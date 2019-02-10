import { Injectable } from '@angular/core';
import { AppService, ILocationChangeEvent, ITimezoneInfo } from './app.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private lat: number;
  private latDeg: number = 40;
  private latMin: number = 46;
  private isNorthHemi: boolean = true;

  private lon: number;
  private lonDeg: number = 73;
  private lonMin: number = 59;
  private isEastHemi: boolean = false;

  private timezone: number = -5;

  private updateViewSource: Subject<void> = new Subject<void>();
  public updateView$ = this.updateViewSource.asObservable();

  constructor(private appService: AppService) { 
    console.log(this);
    this.updateLocation();

    appService.mapLocationChanged$.subscribe( (e: ILocationChangeEvent) => {
      this.lat = e.lat;
      this.lon = e.lon;
      this.timezone = e.timezone;

      this.latDeg = Math.floor(Math.abs(e.lat));
      this.latMin = Math.round(Math.abs(e.lat)%1*60);
      this.latDeg = (this.latMin == 60) ? (this.latDeg+1) : this.latDeg; //if minutes rounded to 60, increment deg
      this.latMin = (this.latMin == 60) ? 0 : this.latMin; //if minutes rounded to 60, reset to 0
      this.lonDeg = Math.floor(Math.abs(e.lon));
      this.lonMin = Math.round(Math.abs(e.lon)%1*60);
      this.lonDeg = (this.lonMin == 60) ? (this.lonDeg+1) : this.lonDeg; //if minutes rounded to 60, increment deg
      this.lonMin = (this.lonMin == 60) ? 0 : this.lonMin; //if minutes rounded to 60, reset to 0
      this.isNorthHemi = e.lat > 0;
      this.isEastHemi = e.lon > 0;
      this.publishLocationChangeEvent();
      this.publishUpdateView();
		});
  }

  public setLatDeg(latDeg) {
    this.latDeg = parseInt(latDeg);
    this.updateLocation();
  }

  public setLatMin(latMin) {
    this.latMin = parseInt(latMin);
    this.updateLocation();
  }

  public setVerticalHemi(isNorthHemi) {
    this.isNorthHemi = isNorthHemi;
    this.updateLocation();
  }

  public setLonDeg(lonDeg) {
    this.lonDeg = parseInt(lonDeg);
    this.updateLocation();
  }

  public setLonMin(lonMin) {
    this.lonMin = parseInt(lonMin);
    this.updateLocation();
  }

  public setHorizontalHemi(isEastHemi) {
    this.isEastHemi = isEastHemi;
    this.updateLocation();
  }

  public setTimezone(tz) {
    this.timezone = parseInt(tz);
    this.updateLocation(true);
  }

  public getLat(): number {
    return this.lat;
  }

  public getLon(): number {
    return this.lon;
  }

  private async updateLocation(isTimezoneChange?: boolean) {
    this.lat = (this.isNorthHemi? 1: (-1)) * (this.latDeg + this.latMin/60);
    this.lon = (this.isEastHemi? 1: (-1)) * (this.lonDeg + this.lonMin/60);

    if(!isTimezoneChange) {
      let tzApiResponse: Response = await fetch("https://maps.googleapis.com/maps/api/timezone/json?location="+this.lat+","+this.lon+"&timestamp="+(Math.round((new Date().getTime())/1000)).toString()+"&key=AIzaSyBMsO1sfJI8djX1LkDq4vYiXudrpKSi4Pk");
      let newTimezoneInfo: ITimezoneInfo = await tzApiResponse.json();

      if(newTimezoneInfo.status != 'ZERO_RESULTS') {
        this.timezone = Math.floor(newTimezoneInfo.rawOffset/3600);
      }
      else {
        this.timezone = Math.floor(this.lon/180*12); //guess timezone
      }
    }

    this.publishLocationChangeEvent();
  }

  private publishLocationChangeEvent() {
    this.appService.changeLocation({
      lat: this.lat, 
      lon: this.lon,
      timezone: this.timezone
    });
  }

  private publishUpdateView() {
    this.updateViewSource.next();
  }
}
