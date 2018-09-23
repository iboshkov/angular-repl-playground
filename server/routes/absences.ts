import * as express from "express";
import { Absence, IAbsenceModel, Excuse, IExcuse } from "../models/absence";
import { Student, IStudentModel } from "../models/student";
import { ICourseModel } from "../models/course";
import { IScheduleModel } from "../models/schedule";
import { IUserModel } from "../models/user";
export const router = express.Router();
const moment = require("moment");

async function populate(items: IAbsenceModel | IAbsenceModel[]) {
  await Absence.populate(items, [
    { path: "student", populate: { path: "parent" } },
    { path: "scheduleCheck", populate: [ { path: "teacher" }, { path: "schedule" }, { path: "room" } ] },
    {
      path: "scheduleEntry",
      populate: [
        {
          path: "course"
        },

        {
          path: "teacher"
        }
      ]
    }
  ]);
}

async function populateExcuse(items: IExcuse | IExcuse[]) {
  await Excuse.populate(items, [
    { path: "student" },
    { path: "enteredBy" }
  ])
}

router.get("/", async (req, res, next) => {
  const filter: any = {};

  if (req.query.scheduleId) {
    filter.scheduleEntry = req.query.scheduleId;
  }
  if (req.query.scheduleCheckId) {
    filter.scheduleCheck = req.query.scheduleCheckId;
  }

  const entries = await Absence.find(filter);
  await populate(entries);
  await res.json(entries);
});

router.get("/calendar", async (req, res, next) => {
  const data = await Absence.aggregate([
    {
      $group: {
        _id: {
          schedule: "$scheduleEntry",
          month: { $month: "$created" },
          day: { $dayOfMonth: "$created" },
          year: { $year: "$created" }
        },
        students: { $push: "$student" },
        schedule: { $last: "$scheduleEntry" }
      }
    },
    {
      $lookup: {
        from: "students",
        localField: "students",
        foreignField: "_id",
        as: "students"
      }
    },
    {
      $lookup: {
        from: "schedules",
        localField: "schedule",
        foreignField: "_id",
        as: "schedule"
      }
    },
    {
      $lookup: {
        from: "courses",
        localField: "schedule.course",
        foreignField: "_id",
        as: "course"
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "schedule.teacher",
        foreignField: "_id",
        as: "teacher"
      }
    }
  ]);

  const events = data.map(entry => {
    const date = moment(
      new Date(entry._id.year, entry._id.month - 1, entry._id.day)
    );
    return {
      title: `${entry.students.length} Отсутни - ${entry.course[0].name} од ${
        entry.teacher[0].firstName
      } ${entry.teacher[0].lastName}`,
      start: date.clone().add(entry.schedule[0].start, "s"),
      end: date.clone().add(entry.schedule[0].end, "s"),
      students: entry.students
    };
  });

  const result = {
    data,
    events
  };

  await res.json(result);
});


router.post("/excuses", async (req, res) => {
  const excuse = new Excuse(req.body);
  await excuse.save();
  await populateExcuse(excuse);
  res.json(excuse);
});

router.get("/excuses", async (req, res) => {
  const entries = await Excuse.find({});
  await populateExcuse(entries);
  res.json(entries);
});

router.get("/excuses/active", async (req, res) => {
  const entries = await Excuse.find({
    start: {
      $lte: moment().toDate()
    },
    end: {
      $gte: moment().toDate()
    }
  });
  await populateExcuse(entries);
  res.json(entries);
});

router.get("/:id", async (req, res, next) => {
  try {
    const absence = await Absence.findOne({ _id: req.params.id });
    await populate(absence);
    await res.json(absence);
  } catch (err) {
    next(err);
  }
});

const nodemailer = require("nodemailer");

// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing
// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "buchevskapavlina@gmail.com",
    pass: "Guenaelverez2."
  }
});

// setup email data with unicode symbols
let mailOptions = {
  from: '"Гимназија Алгоритам" <kontakt@algoritam.mk>', // sender address
  to: "mindcalamity@gmail.com", // list of receivers
  subject: "Отсуства", // Subject line
  text: "Hello world?", // plain text body
  html: "<b>Hello world?</b>" // html body
};

function sendAbsentMail(absence) {
  const schedule = absence.scheduleEntry as IScheduleModel;
  const course = schedule.course as ICourseModel;
  const student = <IStudentModel>absence.student;
  const parent = <IUserModel>student.parent;

  // const alreadySentMail = await Absence.count({
  //   student: student._id,
  //   created: {
  //     $gt: moment()
  //       .startOf("day")
  //       .toDate()
  //   },
  //   mailSent: true
  // });

  // if (alreadySentMail > 0) {
  //     return;
  // }

  mailOptions.html = `
<p>Почитувани${(student.parent && " " + student.parent.fullName) || ""},</p> 
<p>ја добивате оваа порака како известување дека ученикот ${
    student.firstName
  } ${student.lastName} е отсутен од настава на ден <strong>${moment(
    absence.created
  )
    .locale("mk")
    .format("LL")} во ${moment(absence.created).format("HH:mm")}</strong></p>
<p>Кликнете <a href="http://ednevnik.algoritam.mk/">тука</a> за да внесете забелешка во врска со отсуството.</p>
`;
  // console.log(mailOptions.html);
  mailOptions.to = `${(false && parent && `${parent.email}, `) ||
    ""} mindcalamity@gmail.com, pavlina_b@live.com`;
  console.log(`Sending email to ${mailOptions.to}`);
  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account

    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  });
}

router.post("/", async (req, res, next) => {
  try {
    const exists = await Absence.findOne({
      student: req.body.student._id,
      scheduleCheck: req.body.scheduleCheck
    });
    if (exists) {
      console.log("Absence entry already exists");
      return res.sendStatus(304);
    }

    const absence = new Absence({
      ...req.body,
      mailSent: false,
      isExcused: false,
      isLate: false
    });
    
    await populate(absence);
    sendAbsentMail(absence);

    const result = await absence.save();
    await res.json(result);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const absence = await Absence.findById(req.params.id);
    if (!absence) {
      console.log("Absence entry doesn't exist");
      return res.sendStatus(404);
    }
    if (req.body._id) {
      delete req.body._id;
    }
    absence.set(req.body);
    const result = await absence.save();
    await res.json(result);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const result = await Absence.findByIdAndRemove(req.params.id);
    await res.json(result);
  } catch (err) {
    next(err);
  }
});
