import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-lessons-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class LessonsNavComponent implements OnInit {
  lessons = [1, 2, 3, 4];
  constructor() { }

  ngOnInit() {
  }

}
