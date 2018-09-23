import * as createError from "http-errors";
import * as express from "express";
import * as path from "path";
import * as fs from "fs";
import * as logger from "morgan";
import { router as indexRouter } from "./routes/";
import { authRouter, router as usersRouter } from "./routes/users";
import { router as absencesRouter } from "./routes/absences";
import { router as coursesRouter } from "./routes/courses";
import { router as studentsRouter } from "./routes/students";
import { router as schedulesRouter } from "./routes/schedules";
import { router as roomsRouter } from "./routes/rooms";
import * as mongoose from "mongoose";
import { IUserModel, User, hashPassword, generateRandomPassword } from "./models/user";
import { IStudentModel, Student, Grade } from "./models/student";
import { Course, ICourseModel } from "./models/course";
import { CourseGroup } from "./models/course-group";
import { IScheduleModel, Schedule, ScheduleCheck } from "./models/schedule";
import * as moment from "moment";
import { secondsSinceMidnight } from "./utilts";
import { Room } from "./models/room";
import { Absence, Excuse } from "./models/absence";
import { gradeRouter } from "./routes/grades";
import { groupRouter } from "./routes/groups";
import * as csv from 'csvtojson';

const nextInsert = new Date(1535924999335); 

const MONGODB_CONNECTION: string =
  process.env.MONGODB_CONNECTION || "mongodb://127.0.0.1:27017/ednevnik";
mongoose
  .connect(MONGODB_CONNECTION)
  .then(async () => {
    const dataInsert = await Data.find({}).sort({lastDataInsert: -1});
    if (dataInsert.length > 0 && dataInsert[0].lastDataInsert >= nextInsert) {
      console.log(`Last data insert ${dataInsert[0].lastDataInsert}, next insert ${nextInsert} is passed, skipping.`);
      return;
    }
    await Absence.remove({});
    await Room.remove({});
    await Student.remove({});
    await User.remove({});
    await CourseGroup.remove({});
    await Course.remove({});
    await Schedule.remove({});
    await ScheduleCheck.remove({});
    await Excuse.remove({});
    console.log("Removed");

    const teachers = [
      {
        firstName: "Горан",
        lastName: "Станикевски-Горјански",
        email: "gorjanski123@gmail.com"
      },
      {
        firstName: "Зоран",
        lastName: "Зивчевски",
        email: "zoran@algoritam.mk"
      },
      {
        firstName: "Горјан",
        lastName: "Николовски",
        email: "gorjan10@gmail.com"
      },
      {
        firstName: "Оливер",
        lastName: "Зајков",
        email: "oliver.zajkov@gmail.com"
      },
      {
        firstName: "Нена",
        lastName: "Милковски",
        email: "nena.milkovski@algoritam.mk"
      },
      {
        firstName: "Катерина",
        lastName: "Јангеловска",
        email: "jangelovska0405@gmail.com"
      },
      {
        firstName: "Благица",
        lastName: "Блажевска-Богдановска",
        email: "blagica@algoritam.mk"
      },
      {
        firstName: "Јасмина",
        lastName: "Радулова",
        email: "jasmina.radulova@gmail.com"
      },
      {
        firstName: "Винета",
        lastName: "Жиковска-Здравковиќ",
        email: "vineta.zdravkovikj@gmail.com"
      },
      {
        firstName: "Ана",
        lastName: "Богдановска",
        email: "bogdanovskaana@gmail.com"
      }
    ]

    let roditeliIn = (await csv().fromFile("roditeli.csv"));

    const iminja = ["Прва", "Втора", "Трета", "Четврта"]

    const pavlina = new User({
      firstName: "Павлина",
      lastName: "Бучевска",
      email: "pavlina@algoritam.mk",
      password: await hashPassword("admin"),
      isAdmin: true,
      isTeacher: true
    });

    await pavlina.save();
    const teacherUsers: any = await Promise.all(teachers.map(async teacher => {
      const pass = generateRandomPassword(8);
      const user = new User({
        ...teacher,
        isTeacher: true,
        password: await hashPassword(pass),
      });
      await user.save();
      (<any>user).generatedPassword = pass;
      return user;
    }));
    const fileDesc = fs.openSync("./csvs/teachers.csv", "w");
    fs.writeSync(fileDesc, `"Име", "Презиме", "Емаил", "Лозинка"\n`)
    teacherUsers.forEach(x => fs.writeSync(fileDesc, `${x.firstName},${x.lastName},${x.email},${x.generatedPassword}\n`))

    const roditeli = [];

    roditeliIn.forEach(x => {
      if (!roditeli.find(y => y.child === x.child)) {
        roditeli.push(x);
      }
    })

    const parentUsers = [];

    for (let i = 0; i < roditeli.length; i++) {
      const roditel = roditeli[i];
      const idx = parseInt(roditel.year);
      let grName = `${iminja[idx - 1]} ${roditel.class}`;
      // console.log(grName)

      let group = await CourseGroup.findOne({ name: grName });

      if (!group) {
        group = new CourseGroup({
          name: grName,
          teacher: pavlina._id,
          class: roditel.class,
          year: idx
        });
        await group.save();
      }

      const pass = generateRandomPassword(8);
      const user = new User({
        ...roditel,
        password: await hashPassword(pass),
        isParent: true
      });
      await user.save();
      (<any>user).generatedPassword = pass;
      parentUsers.push(user);

      const [firstName, lastName] = roditel.child.split(" ");
      if (firstName) {
        const existing = await Student.findOne({ firstName, lastName });
        if (!existing) {
          const student = new Student({
            firstName,
            lastName,
            parent: user._id,
            groups: [group._id]
          });

          if (roditel.smer) {
            const addName = `${iminja[idx - 1]} ${roditel.smer}`;

            let addGroup = await CourseGroup.findOne({ name: addName });
            if (!addGroup) {
              addGroup = new CourseGroup({
                name: addName,
                teacher: pavlina._id,
                year: idx,
                smer: roditel.smer
              });
              await addGroup.save();
            }

            student.groups.push(addGroup._id);
          }

          await student.save();
        }
        // console.log(roditel)
      }
    } 

    const parentFd = fs.openSync("./csvs/parents.csv", "w");
    fs.writeSync(parentFd, `"Име", "Презиме", "Емаил", "Лозинка"\n`)

    parentUsers.forEach(x => fs.writeSync(parentFd, `${x.firstName},${x.lastName},${x.email},${x.generatedPassword}\n`))
    // const ilija = new User({
    //   firstName: "Винета",
    //   lastName: "Жиковска",
    //   email: "vineta@algoritam.mk",
    //   password: await hashPassword("admin"),
    //   isParent: false,
    //   isAdmin: true,
    //   isTeacher: true
    // });
    // await ilija.save();


    // const profesor = new User({
    //   firstName: "Горан",
    //   lastName: "Николовски",
    //   email: "goran@algoritam.mk",
    //   password: await hashPassword("admin"),
    //   isParent: false,
    //   isAdmin: false,
    //   isTeacher: true
    // });
    // await profesor.save();

    const petranka = new User({
      firstName: "Павлина",
      lastName: "Родителката",
      email: "pavlina_b@live.com",
      password: await hashPassword("admin"),
      phone: "075-123-000",
      isParent: true,
      isAdmin: false,
      isTeacher: false
    });
    await petranka.save();
    const room1 = new Room({ name: "" });
    await room1.save();

    async function getSchedule(startTime, numBlocks, day, group) {
      const result = [];
      let start = startTime;
      let blockLength = 60 * 80;
      let pauseLength = 20 * 60;
      let end = start;
      end += blockLength;

      for (let i = 0; i < numBlocks; i++) {
        if (
          !group.smer && !((day === 5 && group.year === 1 && i >= 2)
            ||
            (group.year === 3 && (day === 1 || day === 4) && i >= 2)
            ||
            (group.year === 3 && (day === 4 || day === 3) && i === 0)
            ||
            (group.year === 4 && group.class !== 3 && (((day === 3 || day === 5) && i === 0 || i >= 2)))
            ||
            (group.year === 4 && group.class === 3 && (((day === 3 || day === 5) && i === 1 || i == 0))
            ))
          ||
          group.smer &&
          (
            (group.year === 3 && (day === 4 || day === 3) && i === 0) ||
            (group.year === 4 && (day === 5 || day === 3) && i >= 2)
          )
        ) {
          const sched = new Schedule({
            courseGroup: group,
            day,
            start: start,
            end: end,
            room: room1,
          });
          await sched.save();
          result.push(sched);
        }
        start += blockLength + pauseLength;
        end += blockLength + pauseLength;

      }

      return result;
    }
    const groups = await CourseGroup.find({});

    groups.forEach(async (group, idx) => {
      for (let i = 1; i <= 5; i++) {
        let start = 8 * 3600 + 30 * 60;
        if (group.year === 1 || group.year === 2 || group.year === 4 && group.class === 3) {
          start = 10 * 3600 + 10 * 60;
        }
        const scheds = await getSchedule(start, 3, i, group);
        const currDay = moment().startOf("week").add(i, "d");
        // scheds.forEach(async (sched, idx) => {
        //   const check = new ScheduleCheck({
        //     teacher: teacherUsers[0],
        //     room: room1,
        //     schedule: sched,
        //     created: currDay.clone().add(sched.start, "s")
        //   })
        //   await check.save();
        // });
      }
    });

    const insert = new Data({
      lastDataInsert: new Date()
    });
    await insert.save();
  })
  .catch(err => {
    console.error(err);
    console.error(err.stackTrace);
    process.exit(-1);
  });


const session = require("express-session");

const app = express();
app.use(session({ resave: true, secret: "123456", saveUninitialized: true }));

const hardcodeLogin = false;
if (hardcodeLogin) {
  app.use(async (req, res, next) => {
    const user = await User.findOne({ email: "pavlina@algoritam.mk" });
    req.session.user = user;
    next();
  });
}

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//
app.use(express.static(path.join(__dirname, "public")));

const rootRouter = express.Router();
rootRouter.use("/", indexRouter);
rootRouter.use("/users", usersRouter);
rootRouter.use("/auth/", authRouter);
rootRouter.use("/courses", coursesRouter);
rootRouter.use("/groups", groupRouter);
rootRouter.use("/grades", gradeRouter);
rootRouter.use("/schedules", schedulesRouter);
rootRouter.use("/students", studentsRouter);
rootRouter.use("/absences", absencesRouter);
rootRouter.use("/rooms", roomsRouter);
app.use("/api/", rootRouter);

app.use("/", (req, res, next) => {
  req.session.test = "stojce";
  res.json(req.session);
  next();
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

/**
 * Module dependencies.
 */
const debug = require('debug')('ednevnik:server');
const http = require('http');

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3125');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);
import * as socket from 'socket.io';

const io = socket(server);
io.on('connection', function (socket) {
  console.log('a user connected');
});

import * as appSockets from './sockets';
import { Data } from "./models/data";
appSockets.init(io);


/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}
