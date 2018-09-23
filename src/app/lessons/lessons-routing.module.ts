import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Lesson1Component } from './lesson1/lesson1.component';
import { Lesson2Component } from './lesson2/lesson2.component';
import { LessonsComponent } from './lessons.component';

const routes: Routes = [
  {
    path: '',
    component: LessonsComponent,
    children: [
      {
        path: '1',
        component: Lesson1Component
      },
      {
        path: '2',
        component: Lesson2Component
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LessonsRoutingModule { }
