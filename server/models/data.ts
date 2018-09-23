import { model, connect, Mongoose, Document, Schema } from 'mongoose';
import {IUserModel} from "./user";
import {ICourseGroupModel} from "./course-group";

export interface IDataModel extends Document {
    lastDataInsert: Date,
}

export const DataSchema = new Schema({
    lastDataInsert: Date,
});

export const Data = model<IDataModel>("Data", DataSchema);