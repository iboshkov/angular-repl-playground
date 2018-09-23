import { Component, OnInit } from "@angular/core";
import { UserService } from "../user.service";
import { User } from "../models/user";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"]
})
export class ProfileComponent implements OnInit {
  constructor(public userSvc: UserService) {}

  public get user(): User {
    return this.userSvc.user;
  }

  ngOnInit() {}
}
