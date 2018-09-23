import { model, connect, Mongoose, Document, Schema } from 'mongoose';
import {IUserModel} from "./user";
import {ICourseModel} from "./course";
import {ICourseGroupModel} from "./course-group";
import {IRoomModel} from "./room";
import * as moment from 'moment';

export interface IScheduleModel extends Document {
    teacher?: IUserModel;
    course?: ICourseModel;
    courseGroup?: ICourseGroupModel;
    room?: IRoomModel;
    day?: number;
    start?: number | Date | string; // Seconds since 00?:00
    end?: number | Date | string; // Seconds since 00:00,
    check: IScheduleCheck;
}

export const ScheduleSchema = new Schema({
    teacher: { type: Schema.Types.ObjectId, ref: 'User' },
    course: { type: Schema.Types.ObjectId, ref: 'Course' },
    courseGroup: { type: Schema.Types.ObjectId, ref: 'CourseGroup' },
    room: { type: Schema.Types.ObjectId, ref: 'Room' },
    day: Number,
    start: Number, // Seconds since 00:00
    end: Number // Seconds since 00:00
});


export interface IScheduleCheck extends Document {
    schedule?: IScheduleModel;
    teacher?: IUserModel;
    room?: IRoomModel;
    created?: Date;
}

export const ScheduleCheckSchema = new Schema({
    schedule: { type: Schema.Types.ObjectId, ref: 'Schedule' },
    teacher: { type: Schema.Types.ObjectId, ref: 'User' },
    room: { type: Schema.Types.ObjectId, ref: 'Room' },
},
{
    timestamps: { createdAt: 'created' }
});


ScheduleSchema.set('toObject', { virtuals: true });
ScheduleSchema.set('toJSON', { virtuals: true });

ScheduleSchema.virtual('humanStart').get(function() {
    return moment().startOf("day").add(this.start, "s").format("HH:mm");
});

ScheduleSchema.virtual('humanEnd').get(function() {
    return moment().startOf("day").add(this.end, "s").format("HH:mm");
});

export const Schedule = model<IScheduleModel>("Schedule", ScheduleSchema);
export const ScheduleCheck = model<IScheduleCheck>("ScheduleCheck", ScheduleCheckSchema);
