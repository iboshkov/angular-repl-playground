import { Injectable } from "@angular/core";
import * as LocalStorage from "lowdb/adapters/LocalStorage";
import * as Lowdb from "lowdb";
import { User } from "./models/user";
import { levels } from "./levels";
import * as _ from "lodash";

@Injectable({
  providedIn: "root"
})
export class UserService {
  private adapter: Lowdb.AdapterSync<any>;
  private db: Lowdb.LowdbSync<Lowdb.AdapterSync<any>[]> | any;
  private get users() {
    return this.db.get("users");
  }
  public user: User;

  public get isLoggedIn() {
    return !!this.user;
  }

  constructor() {
    this.adapter = new LocalStorage("users");
    this.db = Lowdb(this.adapter);

    this.db.defaults({ levels, users: [], loggedInUser: null }).write();
    if (this.users.size().value() === 0) {
      this.users.push(new User("1", "demo", "demo", "Demo User", 0)).write();
    }

    this.user = this.db.get("loggedInUser").value();
  }

  levelForExp(exp: number) {
    return levels.findIndex(x => x.exp > exp) - 1;
  }

  level(user: User) {
    return this.levelForExp(user.exp);
  }

  nextLevel() {
    const usrLvl = this.levelForExp(this.user.exp);

    return levels[usrLvl + 1];
  }

  expToNextLevel() {
    if (!this.isLoggedIn) {
      throw new Error("Not logged in");
    }
    return this.nextLevel().exp - this.user.exp;
  }

  logout() {
    this.db.set("loggedInUser", null).write();
    this.user = null;
    window.location.href = "/";
  }

  login(username: string, password: string): boolean {
    const search = { username, password };
    const user = this.users.find(search).value();
    const users = this.users.find({}).value();
    console.log(user, "Logged In", search, users);
    this.user = user;
    this.db.set("loggedInUser", this.user).write();

    return this.isLoggedIn;
  }

  update(user: User) {
    const existing = this.users.find({ id: user.id }).value();
    if (!existing) {
      throw new Error("Not found");
    }

    this.users
      .find({ id: user.id })
      .assign(user)
      .write();

    if (user.id === this.user.id) {
      console.log("Update logged in ", user);
      this.user = user;
      this.db.set("loggedInUser", user).write();
      console.log("Updated ogged in ", this.db.get("loggedInUser").value());
    }
    this.db.write();
    return user;
  }

  addExp(exp: number) {
    this.user.exp += exp;
    this.update(this.user);
  }
}
