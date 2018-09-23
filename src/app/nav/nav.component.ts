import { Component, OnInit } from "@angular/core";
import { UserService } from "../user.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { LoginComponent } from "./login/login.component";

@Component({
  selector: "app-nav",
  templateUrl: "./nav.component.html",
  styleUrls: ["./nav.component.css"]
})
export class NavComponent implements OnInit {
  constructor(public userSvc: UserService, private modalService: NgbModal) {}

  public isNavbarCollapsed = true;

  ngOnInit() {}

  openLoginModal() {
    this.modalService
      .open(LoginComponent, { ariaLabelledBy: "modal-basic-title" })
      .result.then(result => {}, reason => {});
  }
}
