import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LessonsRoutingModule } from './lessons-routing.module';
import { LessonsNavComponent } from './nav/nav.component';
import { Lesson1Component } from './lesson1/lesson1.component';
import { Lesson2Component } from './lesson2/lesson2.component';
import { ReplModule } from '../repl/repl.module';
import { LessonsComponent } from './lessons.component';
import { ExerciseComponent } from './exercise/exercise.component';

@NgModule({
  imports: [
    CommonModule,
    LessonsRoutingModule,
    ReplModule
  ],
  declarations: [
    LessonsNavComponent,
    Lesson1Component,
    Lesson2Component,
    LessonsComponent,
    ExerciseComponent,
  ],
  exports: [
    LessonsComponent
  ]
})
export class LessonsModule { }
