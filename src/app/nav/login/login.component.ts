import { Component, OnInit } from "@angular/core";
import { UserService } from "../../user.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit {
  public error: boolean;
  constructor(private userSvc: UserService, private modalService: NgbModal) {}

  public username = "";
  public password = "";

  ngOnInit() {
    this.error = false;
  }

  login() {
    const success = this.userSvc.login(this.username, this.password);

    if (success) {
      this.modalService.dismissAll();
    } else {
      this.error = true;
    }
  }
}
