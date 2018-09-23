import * as express from 'express';
import {Course} from "../models/course";
import {CourseGroup} from "../models/course-group";
import {Student, IStudentModel} from "../models/student";
export const router = express.Router();

async function populate(items: IStudentModel[] | IStudentModel) {
    await Student.populate(items, [{
        path: "parent"
    }, {
        path: "grade"
    }, {
        path: "groups"
    }]);
}

router.get('/', async (req, res, next) => {
    const entries = await Student.find({});
    await populate(entries);
    await res.json(entries);
});

router.get('/:id', async (req, res, next) => {
    try {
        const student = await Student.findById(req.params.id);
        await populate(student);
        await res.json(student);
    } catch (err) {
        next(err)
    }
});

router.post('/', async (req, res, next) => {
    try {
        const student = new Student(req.body);
        const result = await student.save();
        await populate(result);
        await res.json(result);
    } catch (err) {
        next(err)
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const student = await Student.findById(req.params.id);
        student.set(req.body);
        const result = await student.save();
        await populate(result);
        await res.json(result);
    } catch (err) {
        next(err)
    }
});

router.put('/:id/grade', async (req, res, next) => {
    try {
        const student = await Student.findById(req.params.id);
        student.set(req.body);
        const result = await student.save();
        await res.json(result);
    } catch (err) {
        next(err)
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const result = await Student.findByIdAndRemove(req.params.id);
        await res.json(result);
    } catch (err) {
        next(err)
    }
});
