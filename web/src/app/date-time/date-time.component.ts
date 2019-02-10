import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DateTimeService } from './../date-time.service';

@Component({
  selector: 'app-date-time',
  templateUrl: './date-time.component.html',
  styleUrls: ['./date-time.component.css']
})
export class DateTimeComponent implements OnInit {
  private datesInMonth: number[] = [];
  private months: number[] = [];
  private years: number[] = [];
  private hours12: number[] = [12];
  private hours24: number[] = [];
  private minutes: number[] = [];

  constructor(private dateTimeService: DateTimeService, private changeDetectorRef: ChangeDetectorRef) {
    console.log(this);
    for( let i: number = 1; i<=12; i++) {
      this.months.push(i);
    }
    for( let i: number = 1; i<=28; i++) {
      //this.datesInMonth.push(i.toString().padStart(2, "0"));
      this.datesInMonth.push(i);
    }
    for( let i: number = 2000; i<=2028; i++) {
      this.years.push(i);
    }

    for( let i: number = 1; i<=11; i++) {
      this.hours12.push(i);
    }
    for( let i: number = 0; i<=23; i++) {
      this.hours24.push(i);
    }
    for( let i: number = 0; i<=59; i++) {
      this.minutes.push(i);
    }

    dateTimeService.updateView$.subscribe( () => {
      changeDetectorRef.detectChanges();
		});
  }

  ngOnInit() {
  }

}
