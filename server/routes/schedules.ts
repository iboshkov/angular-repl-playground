import * as express from 'express';
import { Student } from "../models/student";
import { IScheduleModel, Schedule, ScheduleCheck } from "../models/schedule";
import * as moment from 'moment';
import { secondsSinceMidnight } from "../utilts";
import { User, IUserModel } from "../models/user";
import { schedulesSocket } from '../sockets';
import { CourseGroup } from '../models/course-group';

export const router = express.Router();

async function getUser(req) {
    return req.session.user;
}

async function populate(entries: IScheduleModel | IScheduleModel[]) {
    return await Schedule.populate(entries, [
        {
            path: 'teacher'
        },
        {
            path: "courseGroup"
        },
        {
            path: "course"
        },
        {
            path: "room"
        }
    ]);
}

// router.get('/current', async (req, res, next) => {
//     const sega = secondsSinceMidnight(moment());
//     const deneska = moment().day();
//     const user = await getUser(req);
//     const entries = await Schedule.find({
//         start: { $lte: sega },
//         end: { $gte: sega },
//         // day: deneska,
//         // teacher: user._id
//     });

//     await populate(entries);

//     await res.json(entries[0]);
// });


router.get('/current', async (req, res, next) => {
    const sega = secondsSinceMidnight(moment());
    const deneska = moment().day();
    const user = await getUser(req);
    const search: any = {
        start: { $lte: sega },
        end: { $gte: sega },
        day: deneska,
        // teacher: user._id
    };

    if (req.query.group) {
        search.courseGroup = req.query.group;
    }

    let entries = await Schedule.find(search);
    let result: any = entries;
    if (req.query.group) {
        result = entries.length === 1 ? entries[0] : entries;
    }

    await populate(result);

    await res.json(result);
});

async function getCheckForSchedule(schedule: IScheduleModel, teacher: IUserModel) {
    const today = moment().startOf("day");

    const startSega = today.clone().add(<number>schedule.start, "s");
    const endSega = today.clone().add(<number>schedule.end, "s");
    const search = {
        schedule: schedule._id,
        created: {
            $gte: startSega,
            $lte: endSega
        },
        // teacher: teacher._id
    };
    return await ScheduleCheck.findOne(search).populate("teacher");
}

router.get('/check/:id', async (req, res, next) => {
    const schedule = await Schedule.findOne({ _id: req.params.id });
    if (!schedule) { return res.sendStatus(404); }

    const user = await User.findOne({ _id: req.session.user._id });
    const check = await getCheckForSchedule(schedule, user);
    return await res.json(check);
});

// id: group id
router.get('/checked-classes/:id', async (req, res, next) => {
    const schedules = await Schedule.find({ courseGroup: req.params.id });
    const schedulesIds = schedules.map(x => x._id);
    const checks = await ScheduleCheck.count({
        schedule: {
            $in: schedulesIds
        }
    });
    res.json({
        schedules,
        checks,
    })
});

// id: group id
router.get('/weekly-checks/:id', async (req, res, next) => {
    const group = await CourseGroup.findOne({ _id: req.params.id });
    const schedules = await Schedule.find({ courseGroup: group._id });

    if (schedules.length === 0) {
        return await res.json({ data: [], events: [] });
    }

    const pipeline: any[] = [
        {
            $match: {
                schedule: {
                    $in: schedules.map(x => x._id)
                }
            }
        },
        {
            $group: {
                _id: {
                    // schedule: "$schedule",
                    month: { $month: "$created" },
                    day: { $dayOfMonth: "$created" },
                    year: { $year: "$created" },
                    //   hour: { $hour: "$created" }
                },
                checks: { $push: "$$ROOT" },
                teacher: { $last: "$teacher" },
                schedule: { $last: "$schedule" }
            },
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
                from: "users",
                localField: "teacher",
                foreignField: "_id",
                as: "teacher"
            }
        }
    ];
    let referenceDate = moment().startOf("week");
    if (req.query.week) {
        referenceDate = moment(req.query.week, "YYYY-MM-DD");
        const match = {
            $match: {
                created: {
                    $gte: referenceDate.toDate(),
                    $lt: referenceDate.clone().add(1, "week").toDate()
                }
            }
        };
        pipeline.splice(0, 0, match);
        console.log(JSON.stringify(pipeline, null, 2))
    }

    const checks = await ScheduleCheck.aggregate(pipeline);
    await Promise.all(checks.map(async check => {
        await ScheduleCheck.populate(<any>check.checks, {
            path: "schedule",
            populate: {
                path: "courseGroup"
            }
        });
    }));
    const evts = [];
    const allSchedules = [];
    const missingSchedules = [];

    await Promise.all(checks.map(async groupEntry => {
        const date = moment(
            new Date(groupEntry._id.year, groupEntry._id.month - 1, groupEntry._id.day)
        );

        allSchedules.push(...groupEntry.checks.map(x => x.schedule));

        evts.push(...groupEntry.checks.map(entry => {
            const start = date.clone().add(<number>entry.schedule.start, "s");
            const end = date.clone().add(<number>entry.schedule.end, "s");
            return {
                title: `Пријавен од - ${groupEntry.teacher[0].firstName} ${groupEntry.teacher[0].lastName}  ${start.format("HH:mm")} - ${end.format("HH:mm")} - ${entry.schedule.courseGroup.name}`,
                start,
                end,
                checked: true
            }
        }));

    }));

    const schedulesForGroup = await Schedule.find({ courseGroup: group._id });

    missingSchedules.push(...schedulesForGroup.filter(sch => {
        return allSchedules.filter(x => {
            const id1 = x._id.toString();
            const id2 = sch._id.toString();

            return id1 === id2;
        }).length === 0;
    }));

    evts.push(...missingSchedules.map(schedule => {
        const start = referenceDate.clone().add(schedule.day - 1, "d").add(<number>schedule.start, "s");
        const end = referenceDate.clone().add(schedule.day - 1, "d").add(<number>schedule.end, "s");
        return {
            title: `Не пријавен: ${start.format("HH:mm")} - ${end.format("HH:mm")}`,
            schedule,
            start,
            end,
            checked: false,
            color: {
                primary: '#ad2121',
                secondary: '#FAE3E3'
            }
        }
    }));
    return await res.json({ data: checks, events: evts });
});

router.post('/check/:id', async (req, res, next) => {
    const schedule = await Schedule.findOne({ _id: req.params.id });
    if (!schedule) { return res.sendStatus(404); }
    // const sega = secondsSinceMidnight(moment());
    const user = await User.findOne({ _id: req.session.user._id });
    const existing = await getCheckForSchedule(schedule, user);

    if (existing) {
        return res.sendStatus(304);
    }
    const check = new ScheduleCheck({
        schedule,
        teacher: req.session.user._id,
        created: moment().toDate()
    });
    await check.save();
    schedulesSocket.scheduleLockChanged();
    await res.json(check);
});


router.delete('/check/:id', async (req, res, next) => {
    const schedule = await Schedule.findOne({ _id: req.params.id });
    if (!schedule) { return res.sendStatus(404); }
    // const sega = secondsSinceMidnight(moment());
    const user = await User.findOne({ _id: req.session.user._id });
    const existing = await getCheckForSchedule(schedule, user);

    if (!existing) {
        return res.sendStatus(404);
    }

    await existing.remove();
    schedulesSocket.scheduleLockChanged();
    await res.json({ message: "Entry deleted" });
});


router.get('/', async (req, res, next) => {
    const user = await getUser(req);
    const entries = await Schedule.find({});

    await populate(entries);

    await res.json(entries);
});

router.get('/rooms/', async (req, res, next) => {
    const entries = await Schedule.distinct("room");

    await res.json(entries);
});

router.get('/:id', async (req, res, next) => {
    try {
    } catch (err) {
        next(err)
    }
});
