import { model, connect, Mongoose, Document, Schema } from 'mongoose';
import {IStudentModel} from "./student";
import {IUserModel} from "./user";
import {ICourseModel} from "./course";

export interface ICourseGroupModel extends Document {
    name: string;
    courses: Array<ICourseModel>;
    students: Array<IStudentModel>;
    teacher: IUserModel | string,
    year: number,
    class: number,
    smer: string,
}

export const CourseGroupSchema = new Schema({
    name:  String,
    year:  Number,
    class:  Number,
    smer:  String,
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    teacher: { type: Schema.Types.ObjectId, ref: 'User' },
});


CourseGroupSchema.virtual(`students`, {
    ref: "Student",
    localField: '_id',
    foreignField: 'groups'
});

CourseGroupSchema.set('toObject', { virtuals: true });
CourseGroupSchema.set('toJSON', { virtuals: true });

export const CourseGroup = model<ICourseGroupModel>("CourseGroup", CourseGroupSchema);
