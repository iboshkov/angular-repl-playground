import { Injectable } from "@angular/core";
import { Exercise, Lesson } from "../models/lesson";
import * as LocalStorage from "lowdb/adapters/LocalStorage";
import * as Lowdb from "lowdb";
import { UserService } from "../user.service";

@Injectable({
  providedIn: "root"
})
export class LessonsService {
  private adapter: Lowdb.AdapterSync<any>;
  private db: Lowdb.LowdbSync<Lowdb.AdapterSync<any>[]> | any;
  private get exercises() {
    return this.db.get("exercises");
  }

  constructor(private userSvc: UserService) {
    this.adapter = new LocalStorage("lessons");
    this.db = Lowdb(this.adapter);

    this.db.defaults({ lessons: [], exercises: [] }).write();
  }

  getOrCreateExercise(exercise: Exercise): Exercise {
    const existing = this.exercises.find({ id: exercise.id }).value();
    console.log(existing);
    if (existing) {
      return existing;
    }

    console.log(exercise);
    this.exercises.push(exercise).write();
    this.db.write();
    return exercise;
  }

  update(exercise: Exercise) {
    const existing = this.exercises.find({ id: exercise.id });
    if (!existing) {
      throw new Error("Not found");
    }

    this.exercises
      .find({ id: exercise.id })
      .assign(exercise)
      .write();

    this.db.write();
    return exercise;
  }
}
