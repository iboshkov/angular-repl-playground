import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NavComponent } from "./nav/nav.component";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";
import { LoginComponent } from "./nav/login/login.component";
const appRoutes: Routes = [
  {
    path: "lessons",
    loadChildren: "./lessons/lessons.module#LessonsModule"
  },
  {
    path: "profile",
    loadChildren: "./profile/profile.module#ProfileModule"
  },
  {
    path: "",
    redirectTo: "/lessons",
    pathMatch: "full"
  }
];

@NgModule({
  declarations: [AppComponent, NavComponent, LoginComponent],
  imports: [
    BrowserModule,
    FormsModule,
    NgbModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  entryComponents: [LoginComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
