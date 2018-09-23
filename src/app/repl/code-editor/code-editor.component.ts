import { Component, OnInit, NgZone, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.css']
})
export class CodeEditorComponent implements OnInit {
  @Input()
  code = "";

  @Output()
  onSubmit = new EventEmitter<string>();

  @Input()
  editorOptions = {theme: 'tomorrow-night', language: 'javascript', minimap: { enabled: false }};

  initialized = false;

  constructor(private zone: NgZone) { }

  ngOnInit() {
  }

  onInit(editor: any) {
    this.zone.run(() => this.initialized = true);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      this.zone.run(() => {
        this.submit();
      });
    });
  }


  submit() {
    this.onSubmit.emit(this.code);
  }

}
