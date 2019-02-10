import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { LocationService } from './../location.service';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css']
})
export class LocationComponent implements OnInit {
  private verticalDegrees = [];
  private horizontalDegrees = [];
  private minutes = [];
  private timezones = [];

  constructor(private locationService: LocationService, private changeDetectorRef: ChangeDetectorRef) {
    console.log(this);
    for(let i: number = 0; i<=89; i++) {
      this.verticalDegrees.push(i);
    }
    for(let i: number = 0; i<=179; i++) {
      this.horizontalDegrees.push(i);
    }
    for(let i: number = 0; i<=59; i++) {
      this.minutes.push(i);
    }
    for(let i: number = -12; i<=14; i++) {
      this.timezones.push(i);
    }


    locationService.updateView$.subscribe( () => {
      changeDetectorRef.detectChanges();
		});
  }

  ngOnInit() {
  }

}
