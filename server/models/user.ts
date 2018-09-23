import { model, connect, Mongoose, Document, Schema } from 'mongoose';
import * as bcrypt from 'bcrypt';

export interface IUserModel extends Document {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    password?: string;
    isTeacher?: boolean;
    isParent?: boolean;
    isAdmin?: boolean;
    phone?: string;
}

export const UserSchema = new Schema({
    firstName: String,
    lastName: String,
    username: String,
    email: String,
    password: String,
    phone: String,
    isTeacher: Boolean,
    isParent: Boolean,
    isAdmin: Boolean,
});

UserSchema.virtual(`children`, {
    ref: "Student",
    localField: '_id',
    foreignField: 'parent'
});

UserSchema.set('toObject', { virtuals: true });
UserSchema.set('toJSON', { virtuals: true });

UserSchema.virtual('fullName').get(function () {
    return this.firstName + " " + this.lastName;
});

UserSchema.virtual(`userType`).get(function () {
    const self = this as IUserModel;
    if (self.isAdmin) { return "admin" }
    if (self.isTeacher) { return "admin" }
    if (self.isParent) { return "parent" }

    if (self.isAdmin) { return "error" }
}).set(function (val) {
    this.isAdmin = val === "admin";
    this.isTeacher = val === "teacher";
    this.isParent = val === "parent";
});
export const User = model<IUserModel>("User", UserSchema);

export async function hashPassword(plaintext: string): Promise<string> {
    return bcrypt.hash(plaintext, 10);
}

export async function verifyPass(plaintext: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plaintext, hash);
}

export function generateRandomPassword(length) {
    var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP1234567890";
    var pass = "";
    for (var x = 0; x < length; x++) {
        var i = Math.floor(Math.random() * chars.length);
        pass += chars.charAt(i);
    }
    return pass;
}