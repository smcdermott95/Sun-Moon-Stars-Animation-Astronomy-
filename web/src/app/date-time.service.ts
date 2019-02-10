import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { AppService, IDateChangeEvent, ILocationChangeEvent } from './app.service';
import { Subject } from 'rxjs';

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
  public is24HourClock = true;

  private updateViewSource: Subject<void> = new Subject<void>();
  public updateView$ = this.updateViewSource.asObservable();

  constructor(private appService: AppService) {

    console.log(this);
    this.setDateTime(moment().utcOffset(-5));
    this.publishDateChangeEvent();

    appService.locationPanelChanged$.subscribe( (e: ILocationChangeEvent) => {
      this.dateTime.utcOffset(e.timezone);
      this.setDateTime(this.dateTime);
      this.publishUpdateView();
    });

    appService.mapLocationChanged$.subscribe( (e: ILocationChangeEvent) => { 
      this.dateTime.utcOffset(e.timezone);
      this.setDateTime(this.dateTime);
      this.publishUpdateView();
    });
  }

  private setDateTime(dateTime: moment.Moment) {
    this.dateTime = dateTime;
    this.date = this.dateTime.date();
    this.month = this.dateTime.month()+1;
    this.year = this.dateTime.year();
    this.daysInMonth = this.dateTime.daysInMonth();

    this.hour = this.dateTime.hour();
    this.hour12 = parseInt(this.dateTime.format("hh"));
    this.minute = this.dateTime.minute();
    this.isPM = this.hour >= 12;
  }

  public setDate(newDate: string) {
    this.date = parseInt(newDate);
    this.dateTime.date(this.date);
    this.publishDateChangeEvent();
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
    this.publishDateChangeEvent();
  }

  public setYear(newYear) {
    this.year = parseInt(newYear);
    this.dateTime.year(this.year);
    this.publishDateChangeEvent();
  }

  public setHour(newHour) {
    this.hour = parseInt(newHour);
    this.dateTime.hour(newHour);
    this.hour12 = parseInt(this.dateTime.format("hh"));
    this.isPM = this.hour >= 12;
    this.publishDateChangeEvent();
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
    this.publishDateChangeEvent();
  }

  public setMinute(newMinute) {
    this.minute = parseInt(newMinute);
    this.dateTime.minute(newMinute);
    this.publishDateChangeEvent();
  }

  public setAMPM(isPM) {
    this.isPM = String(isPM) === "true";
    this.setHour12(this.hour12);
  }

  private setClockType(is24HourClock: boolean) {
    this.is24HourClock = is24HourClock;
    this.publishDateChangeEvent();
  }

  private setTimeAsCurrent() {
    this.setDateTime(moment().utcOffset(this.dateTime.utcOffset()));
    this.publishDateChangeEvent();
  }

  private publishDateChangeEvent() {
    this.appService.changeDate({
      newDateTime: this.dateTime, 
      is24HourClock: this.is24HourClock
    });
  }

  private publishUpdateView() {
    this.updateViewSource.next();
  }
}
