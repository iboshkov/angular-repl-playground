import { model, connect, Mongoose, Document, Schema } from 'mongoose';
import {IStudentModel} from "./student";
import {IScheduleModel, IScheduleCheck} from "./schedule";
import { IUserModel } from './user';

export interface IAbsenceModel extends Document {
    created: Date,
    scheduleEntry: string | IScheduleModel,
    scheduleCheck: string | IScheduleCheck,
    student: string | IStudentModel,
    parentNote: string;
    isLate: boolean;
    isExcused: boolean;
    isLocked: boolean;
    mailSent: boolean;
}

export const AbsenceSchema = new Schema({
    scheduleEntry: { type: Schema.Types.ObjectId, ref: 'Schedule' },
    scheduleCheck: { type: Schema.Types.ObjectId, ref: 'ScheduleCheck' },
    student: { type: Schema.Types.ObjectId, ref: 'Student' },
    parentNote: String,
    isLate: Boolean,
    isExcused: Boolean,
    isLocked: Boolean,
    mailSent: Boolean,
    created: Date
},
{
    timestamps: { createdAt: 'created' }
});


export interface IExcuse extends Document {
    start: Date,
    end: Date,
    enteredBy: IUserModel,
    student: IStudentModel,
    reason: String
}

export const ExcuseSchema = new Schema({
    start: Date,
    end: Date,
    enteredBy: { type: Schema.Types.ObjectId, ref: 'User' },
    student: { type: Schema.Types.ObjectId, ref: 'Student' },
    reason: String
});


export const Excuse = model<IExcuse>("Excuse", ExcuseSchema);

export const Absence = model<IAbsenceModel>("Absence", AbsenceSchema);
