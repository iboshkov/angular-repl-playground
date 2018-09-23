import * as express from 'express';
import {Course} from "../models/course";
export const router = express.Router();

const populatePeriod = (i, match={}) => {
    return  {
        match: { period: i, ...match }, populate: {
            path: 'teacher'
        }
    };
}
//
// for(let i = 1; i <= 4; i++) {
//
// }
// this.populate({ path: `firstHalf`, ...populatePeriod(5)});
// this.populate({ path: `secondHalf`, ...populatePeriod(6)});
// this.populate({ path: `final`, ...populatePeriod(7)});

router.get('/', async (req, res, next) => {
    const courses = await Course.find({})
        .populate("staff")
        .populate("courseGroups")
    await res.json(courses);
});

router.get('/:id', async (req, res, next) => {
    try {
        const match = { course: req.params.id };
        const periodPopulate = [1, 2, 3, 4].map(x => {
            return {
                path: `period${x}`,
                ...populatePeriod(x , match),
            }
        });
        const course = await Course.findById(req.params.id)
            .populate({
                path: "courseGroups",
                populate:  {
                    path: "students",
                    populate: [
                        ...periodPopulate,
                        {
                            path: "firstHalf",
                            ...populatePeriod(5, match)
                        },
                        {
                            path: "secondHalf",
                            ...populatePeriod(6, match)
                        },
                        {
                            path: "final",
                            ...populatePeriod(7, match)
                        }
                    ]
                }
            });
        await res.json(course);
    } catch (err) {
        next(err)
    }
});
