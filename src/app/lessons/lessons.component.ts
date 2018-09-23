import { Component, OnInit } from "@angular/core";
import { UserService } from "../user.service";

@Component({
  selector: "app-lessons",
  templateUrl: "./lessons.component.html",
  styleUrls: ["./lessons.component.css"]
})
export class LessonsComponent implements OnInit {
  constructor(public userSvc: UserService) {}

  ngOnInit() {}
}
