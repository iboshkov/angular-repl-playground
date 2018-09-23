import { Component } from "@angular/core";
import { UserService } from "./user.service";
import { User } from "./models/user";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  public get exercisesPerLevel() {
    return User.exercisesPerLevel;
  }
  constructor(public userSvc: UserService) {}
}
