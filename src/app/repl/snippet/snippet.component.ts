import {
  Component,
  OnInit,
  Input,
  ViewChild,
  AfterViewInit
} from "@angular/core";
import { CodeBlockComponent } from "../code-block/code-block.component";

@Component({
  selector: "app-snippet",
  templateUrl: "./snippet.component.html",
  styleUrls: ["./snippet.component.css"]
})
export class SnippetComponent implements OnInit, AfterViewInit {
  @Input()
  public code = "";

  @Input()
  public additionalContext = {};

  @ViewChild("repl")
  codeBlock: CodeBlockComponent;

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {}
}
