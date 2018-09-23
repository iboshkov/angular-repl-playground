import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ContentChild,
  ContentChildren,
  Input,
  OnInit
} from "@angular/core";
import { LessonsService } from "../lessons.service";
import { Exercise } from "../../models/lesson";
import { CodeBlockComponent } from "../../repl/code-block/code-block.component";
import { SnippetComponent } from "../../repl/snippet/snippet.component";
import { UserService } from "../../user.service";

@Component({
  selector: "app-exercise",
  templateUrl: "./exercise.component.html",
  styleUrls: ["./exercise.component.css"]
})
export class ExerciseComponent implements OnInit, AfterContentInit {
  @Input()
  title: string;

  @Input()
  id: string;

  @Input()
  exp: number;

  model: Exercise;

  @ContentChild(SnippetComponent)
  private snippet: SnippetComponent;

  @ContentChildren(Component)
  contentChildren = [];

  @Input()
  validator: Function;

  constructor(
    private userSvc: UserService,
    private lessonSvc: LessonsService
  ) {}

  isDoneByCurrentUser() {
    return (
      this.userSvc.isLoggedIn &&
      !!this.model.doneBy.find(x => x === this.userSvc.user.id)
    );
  }

  ngOnInit() {
    this.model = new Exercise(this.id, this.exp);
    console.log("On init");
    this.model = this.lessonSvc.getOrCreateExercise(this.model);
  }

  ngAfterContentInit(): void {
    this.snippet.codeBlock.onEval.subscribe(result => {
      if (result.isSuccess && this.userSvc.isLoggedIn) {
        this.model = this.lessonSvc.getOrCreateExercise(this.model);
        if (this.model.doneBy.indexOf(this.userSvc.user.id) < 0) {
          if (this.validator && !this.validator(result)) {
            console.log("Validator returned false");
            return;
          }

          this.model.doneBy.push(this.userSvc.user.id);
          this.userSvc.addExp(parseInt(this.model.exp.toString(), 10));
          this.lessonSvc.update(this.model);
        }
      }
    });
  }
}
