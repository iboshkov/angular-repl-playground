import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-snippet',
  templateUrl: './snippet.component.html',
  styleUrls: ['./snippet.component.css']
})
export class SnippetComponent implements OnInit {
  @Input()
  code = "";
  
  constructor() { }

  ngOnInit() {
  }

}
