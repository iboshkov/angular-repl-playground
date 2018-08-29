import { Component, OnInit, NgZone } from '@angular/core';
import * as vm from 'vm-browserify';

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
export class CodeBlockComponent implements OnInit {
  lines = [];
  code = '';
  context = vm.createContext({ a: 1234, console: {
    log: (...args) => this.lines.push(new Line(`Console log: ${args.toString()}`))
  } });
  editorOptions = {theme: 'vs-dark', language: 'javascript'};

  constructor(private zone: NgZone) { }

  ngOnInit() {
  }

  onInit(editor: any) {
    var myBinding = editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      this.zone.run(() => {
        this.submit();
      });
    });
  }

  execute(code) {
    try {
      const res = JSON.stringify(vm.runInContext(code, this.context));
      this.lines.push(new Line(res, LineType.OUTPUT, LineSeverity.NORMAL));
    } catch (err) {
      this.lines.push(new Line(err.toString(), LineType.OUTPUT, LineSeverity.ERROR));
    }
  }

  submit() {
    this.lines.push(new Line(this.code, LineType.INPUT, LineSeverity.NORMAL));

    this.execute(this.code);

    this.code = '';
  }

}
