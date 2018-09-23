import {
  Component,
  OnInit,
  NgZone,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Output,
  EventEmitter,
  Input
} from "@angular/core";
import * as vm from "vm-browserify";
import { HighlightJS, HighlightOptions } from "ngx-highlightjs";

enum LineType {
  INPUT = 0,
  OUTPUT = 1,
  BLOCK = 2
}

enum LineSeverity {
  NORMAL = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3
}

class Line {
  constructor(
    public text = "",
    public type = LineType.OUTPUT,
    public severity = LineSeverity.NORMAL,
    public isBlock = false
  ) {}

  public get isInput() {
    return this.type === LineType.INPUT;
  }
  public get isOutput() {
    return this.type === LineType.OUTPUT;
  }
  public get isError() {
    return this.severity === LineSeverity.ERROR;
  }
}

@Component({
  selector: "app-code-block",
  templateUrl: "./code-block.component.html",
  styleUrls: ["./code-block.component.css"]
})
export class CodeBlockComponent implements OnInit, AfterViewInit {
  @Output()
  onEval = new EventEmitter();

  @Input()
  additionalContext: any;

  lines: Line[] = [];
  code = "";

  editorOptions = { theme: "tomorrow-night", language: "javascript" };

  upStack = [];
  downStack = [];

  @ViewChild("output")
  outputEl: ElementRef;
  private context: vm.Context;

  getText(line: Line) {
    let prefix = line.isOutput ? "<<<" : ">>>";
    return `${prefix} ${line.text}`;
  }

  get outputCode() {
    return this.lines.reduce(
      (prev, current) => `${prev}\n${this.getText(current)}`,
      ""
    );
  }

  get inputs() {
    return this.lines.filter(x => x.isInput);
  }

  get inputTexts() {
    return this.inputs.map(x => x.text);
  }

  constructor(private zone: NgZone, private hljs: HighlightJS) {}

  clear() {
    this.lines = [];
  }

  ngOnInit() {
    this.hljs.isReady.subscribe(() => {
      this.hljs.configure({ tabReplace: "" } as HighlightOptions);
    });

    this.context = vm.createContext({
      clear: () => this.clear(),
      console: {
        log: (...args) => this.lines.push(new Line(`log: ${args.toString()}`))
      },
      ...this.additionalContext
    });
  }

  ngAfterViewInit(): void {}

  onInit(editor: any) {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      this.zone.run(() => {
        this.submit();
      });
    });
  }

  onKey(e: KeyboardEvent) {
    this.zone.run(() => {
      let el = null;
      if (e.which === 38 && this.upStack.length > 0) {
        el = this.upStack.pop();
        this.downStack.push(el);
      }
      if (e.which === 40 && this.downStack.length > 0) {
        el = this.downStack.pop();
        this.upStack.push(el);
      }
      if (el !== null) {
        this.code = el;
      }
    });
  }

  execute(code) {
    let msg = "";
    let msgSeverity = LineSeverity.NORMAL;
    let jsonResult = null;
    let isSuccess = false;
    try {
      jsonResult = vm.runInContext(code, this.context);
      msg = JSON.stringify(jsonResult, null, 4);
      isSuccess = true;
    } catch (err) {
      msg = JSON.stringify(err, ["message", "arguments", "type", "name"], 4);
      msgSeverity = LineSeverity.ERROR;
    }
    this.onEval.emit({
      isSuccess,
      input: code,
      stringOut: msg,
      jsonResult,
      context: this.context
    });
    this.printMsg(msg || "", LineType.OUTPUT, msgSeverity);
  }

  scrollOutput() {
    this.zone.run(() => {
      this.code = "";
      const el = this.outputEl.nativeElement as HTMLElement;
      el.scrollTop = el.scrollHeight;
    });
  }

  printMsg(
    msg: string,
    lineType = LineType.OUTPUT,
    severity = LineSeverity.NORMAL
  ) {
    msg
      .split("\n")
      .map((line, idx) =>
        this.lines.push(new Line(line, lineType, severity, idx > 0))
      );
  }

  submit(input: string = null, clear = false) {
    if (clear) this.clear();

    const code = input ? input : this.code;

    if (code.trim().length === 0) return;

    this.printMsg(code, LineType.INPUT, LineSeverity.NORMAL);

    this.upStack = this.inputTexts;
    this.downStack = [];

    try {
      this.execute(code);
    } catch (err) {}
    this.scrollOutput();
    setTimeout(this.scrollOutput.bind(this), 100);
  }
}
