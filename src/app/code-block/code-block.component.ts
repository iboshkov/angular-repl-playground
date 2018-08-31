import { Component, OnInit, NgZone, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import * as vm from 'vm-browserify';
import { HighlightJS, HighlightOptions } from 'ngx-highlightjs';

enum LineType {
  INPUT = 0,
  OUTPUT = 1
}

enum LineSeverity {
  NORMAL = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3
}

class Line {
  constructor(public text = "", public type = LineType.OUTPUT, public severity = LineSeverity.NORMAL) {
  }

  public get isInput() { return this.type === LineType.INPUT }
  public get isOutput() { return this.type === LineType.OUTPUT }
  public get isError() { return this.severity === LineSeverity.ERROR }
}


@Component({
  selector: 'app-code-block',
  templateUrl: './code-block.component.html',
  styleUrls: ['./code-block.component.css']
})
export class CodeBlockComponent implements OnInit, AfterViewInit {
  lines = [];
  code = '';
  context = vm.createContext({
    clear: () => this.lines = [],
    console: {
      log: (...args) => this.lines.push(new Line(`log: ${args.toString()}`))
    }
  });
  editorOptions = { theme: 'tomorrow-night', language: 'javascript' };

  @ViewChild("output") outputEl: ElementRef;

  getText(line: Line) {
    let prefix = line.isOutput ?  "<<<" : ">>>";
    return `${prefix} ${line.text}`;
  }

  get outputCode() {
    return this.lines.reduce((prev, current) => `${prev}\n${this.getText(current)}`, ">>> KI REPL v0.1");
  }

  constructor(private zone: NgZone, private hljs: HighlightJS) { }

  ngOnInit() {
    this.hljs.isReady.subscribe(() => {
      this.hljs.configure({ tabReplace: '' } as HighlightOptions)
    });
  }

  ngAfterViewInit(): void {
  }

  onInit(editor: any) {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      this.zone.run(() => {
        this.submit();
      });
    });
  }

  execute(code) {
    let msg = "";
    let msgSeverity = LineSeverity.NORMAL;
    try {
      msg = JSON.stringify(vm.runInContext(code, this.context), null, 4);
    } catch (err) {
      msg = JSON.stringify(err, ["message", "arguments", "type", "name"], 4);
      msgSeverity = LineSeverity.ERROR;
    }
    this.printMsg(msg, LineType.OUTPUT, msgSeverity);
  }

  scrollOutput() {
    this.zone.run(() => {
      this.code = '';
      const el = (this.outputEl.nativeElement as HTMLElement);
      el.scrollTop = el.scrollHeight;
    })
  }

  printMsg(msg: string, lineType = LineType.OUTPUT, severity = LineSeverity.NORMAL) {
    msg.split("\n").map(line => this.lines.push(new Line(line, lineType, severity)));
  }

  submit() {
    this.printMsg(this.code, LineType.INPUT, LineSeverity.NORMAL);

    try {
      this.execute(this.code);
    } catch(err) {}
    this.scrollOutput()
    setTimeout(this.scrollOutput.bind(this), 100);
  }

}
