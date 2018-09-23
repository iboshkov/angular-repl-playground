import * as express from 'express';
import {Course} from "../models/course";
import {CourseGroup, ICourseGroupModel} from "../models/course-group";
import { Student } from '../models/student';
export const groupRouter = express.Router();

function getIds(array: any[]) {
    return array.map(item => {
        let id = null;
        if (item instanceof String) {
            id = item;
        } else {
            id = item._id;
        }
        if (!id) throw new Error("Invalid item reference");
        return id;
    })
}

async function updateStudentsWithGroup(group: ICourseGroupModel) {
    const matching = await Student.find({group: group._id});
    const currentStudents = await Student.update({ group: group._id },
    {
        $unset: { group: "" }
    }, { multi: true });
    console.log("Should ", matching.length)
    console.log("Updated ", currentStudents)

    const studentIds = getIds(group.students);
    await Promise.all(studentIds.map(async (id) => {
        await Student.findByIdAndUpdate(id, {
            group: group._id
        })
    }));
}

async function updateCoursesWithGroup(group: ICourseGroupModel) {
    await Course.update({courseGroups: group._id}, { $pull: { courseGroups: group._id } }, { multi: true });
    const courseIds = getIds(group.courses);
    await Course.update({ _id: { $in: courseIds } }, { $push: { courseGroups: group._id } }, { multi: true });
}

async function populate(target: ICourseGroupModel | ICourseGroupModel[]) {
    await CourseGroup.populate(target, [
        { path: "courses" },
        { path: "teacher" },
        { path: "students", populate: {
            path: "parent"
        } }
    ]);
}

groupRouter.get('/', async (req, res, next) => {
    const groups = await CourseGroup.find({}).sort({ year: 1, name: 1 });
    await populate(groups);

    await res.json(groups);
});

groupRouter.get('/:id', async (req, res, next) => {
    try {
        const group = await CourseGroup.findById(req.params.id);
        await populate(group);
        await res.json(group);
    } catch (err) {
        next(err)
    }
});

groupRouter.put('/:id', async (req, res, next) => {
    try {
        const group = await CourseGroup.findById(req.params.id);
        group.set(req.body);
        const result = await group.save();
        await updateStudentsWithGroup(group)
        await updateCoursesWithGroup(group);
        await populate(result);
        await res.json(result);
    } catch (err) {
        next(err)
    }
});

groupRouter.post('/:id', async (req, res, next) => {
    try {
        const group = new CourseGroup(req.body);
        const result = await group.save();
        await updateStudentsWithGroup(group)
        await updateCoursesWithGroup(group);
        await populate(result);
        await res.json(result);
    } catch (err) {
        next(err)
    }
});

groupRouter.delete('/:id', async (req, res, next) => {
    try {
        const result = await CourseGroup.findByIdAndRemove(req.params.id);
        await res.json(result);
    } catch (err) {
        next(err)
    }
});
