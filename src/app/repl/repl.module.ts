import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeBlockComponent } from './code-block/code-block.component';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { SnippetComponent } from './snippet/snippet.component';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule, NgxMonacoEditorConfig } from 'ngx-monaco-editor';
import { themeData } from './theme-data';
import { HighlightModule } from 'ngx-highlightjs';

const monacoConfig: NgxMonacoEditorConfig = {
  onMonacoLoad: () => { 
    monaco.editor.defineTheme("tomorrow-night", themeData);
    monaco.editor.setTheme("tomorrow-night");
  } 
};

const COMPONENTS = [
  CodeBlockComponent,
  CodeEditorComponent,
  SnippetComponent
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MonacoEditorModule.forRoot(monacoConfig), // use forRoot() in main app module only.,
    HighlightModule.forRoot({
      theme: "solarized-dark",
      config: {
        tabReplace: '  '
      }
    }),
  ],
  declarations: [
    ...COMPONENTS
  ],
  exports: [
    ...COMPONENTS
  ]
})
export class ReplModule { }
