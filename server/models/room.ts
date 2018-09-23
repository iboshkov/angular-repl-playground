import { model, connect, Mongoose, Document, Schema } from 'mongoose';
import {IUserModel} from "./user";
import {ICourseGroupModel} from "./course-group";

export interface IRoomModel extends Document {
    name: string,
    courseGroups: Array<ICourseGroupModel>,
    staff: Array<IUserModel>
}

export const RoomSchema = new Schema({
    name:  String,
    staff: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    courseGroups: [{ type: Schema.Types.ObjectId, ref: 'CourseGroup' }],
});

export const Room = model<IRoomModel>("Room", RoomSchema);
