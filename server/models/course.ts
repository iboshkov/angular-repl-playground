import { model, connect, Mongoose, Document, Schema } from 'mongoose';
import {IUserModel} from "./user";
import {ICourseGroupModel} from "./course-group";

export interface ICourseModel extends Document {
    name: string,
    courseGroups: Array<ICourseGroupModel>,
    staff: Array<IUserModel>
}

export const CourseSchema = new Schema({
    name:  String,
    staff: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    courseGroups: [{ type: Schema.Types.ObjectId, ref: 'CourseGroup' }],
});

export const Course = model<ICourseModel>("Course", CourseSchema);
