import { Component, OnInit, ViewChild ,ElementRef } from '@angular/core';
import { DateTimeService } from './date-time.service';
import { LocationService } from './location.service';
import { CanvasService } from './canvas.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'web';
  @ViewChild('canvasesEle') canvasesRef: ElementRef;
  canvasesEle: HTMLElement;

  constructor(
    private dateTimeService: DateTimeService, 
    private locationService: LocationService, 
    private canvasService: CanvasService) {
      console.log(this);
  }

  ngOnInit() {
    this.canvasesEle = this.canvasesRef.nativeElement as HTMLElement;
    this.canvasService.setCanvas(this.canvasesEle);
    this.canvasService.init();
    this.canvasService.drawCanvas();
    console.log("Suc");
  }
}
