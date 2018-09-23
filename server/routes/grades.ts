import * as express from 'express';
import {Course} from "../models/course";
import {Grade} from "../models/student";
export const gradeRouter = express.Router();

gradeRouter.get('/student/:student/', async (req, res, next) => {
    const grades = await Grade.find({student: req.params.student});

    await res.json(grades);
});

gradeRouter.put('/:id', async (req, res, next) => {
    try {
        const grade = await Grade.findById(req.params.id);
        grade.set(req.body);
        const result = await grade.save();
        await res.json(result);

    } catch (err) {
        next(err)
    }
});


gradeRouter.delete('/:id', async (req, res, next) => {
    try {
        const result = await Grade.findByIdAndRemove(req.params.id);
        await res.json(result);

    } catch (err) {
        next(err)
    }
});


gradeRouter.post('/', async (req, res, next) => {
    try {
        const grade = new Grade(req.body);
        const result = await grade.save();
        await res.json(result);
    } catch (err) {
        next(err)
    }
});
