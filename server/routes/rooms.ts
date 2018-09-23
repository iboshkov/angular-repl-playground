import * as express from 'express';
import {Course} from "../models/course";
import {CourseGroup} from "../models/course-group";
import {Room} from "../models/room";
export const router = express.Router();

router.get('/', async (req, res, next) => {
    const entries = await Room.find({});
    await res.json(entries);
});

router.get('/:id', async (req, res, next) => {
    try {
        const student = await Room.findById(req.params.id);
        await res.json(student);
    } catch (err) {
        next(err)
    }
});

router.post('/', async (req, res, next) => {
    try {
        const student = new Room(req.body);
        const result = await student.save();
        await res.json(result);
    } catch (err) {
        next(err)
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const student = await Room.findById(req.params.id);
        student.set(req.body);
        const result = await student.save();
        await res.json(result);
    } catch (err) {
        next(err)
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const result = await Room.findByIdAndRemove(req.params.id);
        await res.json(result);
    } catch (err) {
        next(err)
    }
});
