import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { CanvasService } from './canvas.service';

@Injectable({
  providedIn: 'root'
})
export class DateTimeService {
  public dateTime: moment.Moment
  public month: number = 1;
  public date: number = 1;
  public year: number = 2000;
  public daysInMonth = 31;
  public hour: number = 1;
  public hour12: number = 1;
  public isPM: boolean = false;
  public minute: number = 0;

  private canvasService;

  constructor() {

    console.log(this);
    this.dateTime = moment();
    this.date = this.dateTime.date();
    this.month = this.dateTime.month()+1;
    this.year = this.dateTime.year();
    this.daysInMonth = this.dateTime.daysInMonth();

    this.hour = this.dateTime.hour();
    this.hour12 = parseInt(this.dateTime.format("hh"));
    this.minute = this.dateTime.minute();
    this.isPM = this.hour >= 12;
  }

  //TODO - temporary solution to circular dependancy issue
  public setCanvasService(cs: CanvasService) {
      //this.canvasService = this.injector.get(CanvasService);
      this.canvasService = cs;
  }

  public setDate(newDate: string) {
    this.date = parseInt(newDate);
    this.dateTime.date(this.date);
    this.canvasService.drawCanvas();
  }

  public setMonth(newMonth: string) {
    let oldDate = this.date;
    this.date=1;
    this.dateTime.date(1);

    this.month=parseInt(newMonth);
    this.dateTime.month(this.month-1);
    this.daysInMonth=this.dateTime.daysInMonth();

    this.date = oldDate<=this.daysInMonth ? (oldDate) : this.daysInMonth;
    this.dateTime.date(this.date);
    this.canvasService.drawCanvas();
  }

  public setYear(newYear) {
    this.year = parseInt(newYear);
    this.dateTime.year(this.year);
    this.canvasService.drawCanvas();
  }

  public setHour(newHour) {
    this.hour = parseInt(newHour);
    this.dateTime.hour(newHour);
    this.hour12 = parseInt(this.dateTime.format("hh"));
    this.isPM = this.hour >= 12;
    this.canvasService.drawCanvas();
  }

  public setHour12(newHour) {
    this.hour12 = parseInt(newHour);
    if(this.hour12<12) {
      this.hour = this.hour12 + (this.isPM ? 12 : 0);
    }
    else {
      this.hour = this.isPM ? 12 : 0;
    }
    this.dateTime.hour(this.hour);
    this.canvasService.drawCanvas();
  }

  public setMinute(newMinute) {
    this.minute = parseInt(newMinute);
    this.dateTime.minute(newMinute);
    this.canvasService.drawCanvas();
  }

  public setAMPM(isPM) {
    this.isPM = String(isPM) === "true";
    this.setHour12(this.hour12);
  }
}
