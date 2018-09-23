import { model, connect, Mongoose, Document, Schema } from 'mongoose';
import {ICourseModel} from "./course";
import {IUserModel} from "./user";
import { ICourseGroupModel } from './course-group';

export interface IGradeModel extends Document {
    course: ICourseModel | string
    teacher: IUserModel | string;
    student: IStudentModel | string;
    note: string;
    grade: number;
    period: number;
}


export interface IStudentModel extends Document {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    fullName:  String,
    groups: ICourseGroupModel[];
    isExcused?: boolean;
    parent: IUserModel;
    grades: IGradeModel[];
    periods: IGradeModel[][];
    period1: IGradeModel[];
    period2: IGradeModel[];
    period3: IGradeModel[];
    period4: IGradeModel[];
    firstHalf: IGradeModel[];
    secondHalf: IGradeModel[];
    final: IGradeModel[];
}

export const GradeSchema = new Schema({
    course: { type: Schema.Types.ObjectId, ref: 'Course' },
    teacher: { type: Schema.Types.ObjectId, ref: 'User' },
    student: { type: Schema.Types.ObjectId, ref: 'Student' },
    parent: { type: Schema.Types.ObjectId, ref: 'User' },
    note: String,
    grade: {
        type: Number,
        min: 1,
        max: 5
    },
    period: {
        type: Number,
        min: 1,
        max: 7
    },
    created: Date
},
{
    timestamps: { createdAt: 'created' }
});

export const StudentSchema = new Schema({
    firstName:  String,
    lastName: String,
    dateOfBirth: Date,
    grades: [{ type: Schema.Types.ObjectId, ref: 'Grade' }],
    parent: { type: Schema.Types.ObjectId, ref: 'User' },
    groups: [{ type: Schema.Types.ObjectId, ref: 'CourseGroup' }]
});

for(let i = 1; i <= 4; i++) {
    StudentSchema.virtual(`period${i}`, {
        ref: "Grade",
        localField: '_id',
        foreignField: 'student'
    });
}

StudentSchema.virtual(`firstHalf`, {
    ref: "Grade",
    localField: '_id',
    foreignField: 'student'
});

StudentSchema.virtual(`secondHalf`, {
    ref: "Grade",
    localField: '_id',
    foreignField: 'student'
});

StudentSchema.virtual(`final`, {
    ref: "Grade",
    localField: '_id',
    foreignField: 'student'
});

StudentSchema.virtual(`absences`, {
    ref: "Absence",
    localField: '_id',
    foreignField: 'student'
});

StudentSchema.virtual('periods').get(function() {
    return [this.period1, this.period2, this.period3, this.period4];
});

StudentSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

//
// const populatePeriod = (i) => {
//      return  {
//          match: { period: i }, populate: {
//              path: 'teacher'
//          }
//      };
// }
//
// StudentSchema.pre('find', function() {
//     for(let i = 1; i <= 4; i++) {
//         this.populate({ path: `period${i}`, ...populatePeriod(i)});
//     }
//     this.populate({ path: `firstHalf`, ...populatePeriod(5)});
//     this.populate({ path: `secondHalf`, ...populatePeriod(6)});
//     this.populate({ path: `final`, ...populatePeriod(7)});
// });


StudentSchema.set('toObject', { virtuals: true });
StudentSchema.set('toJSON', { virtuals: true });

export const Student = model<IStudentModel>("Student", StudentSchema);
export const Grade = model<IGradeModel>("Grade", GradeSchema);
