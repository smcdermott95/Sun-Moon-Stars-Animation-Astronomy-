import { Component, OnInit, ViewChild ,ElementRef } from '@angular/core';
import { CanvasService } from './../canvas.service'

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit {

  @ViewChild('canvasesEle', { static: true }) canvasesRef: ElementRef;
  canvasesEle: HTMLElement;

  constructor(private canvasService: CanvasService) { }

  ngOnInit() {
    console.log(this);
    this.canvasesEle = this.canvasesRef.nativeElement as HTMLElement;
    this.canvasService.setCanvas(this.canvasesEle);
    this.canvasService.init();
  }

}
