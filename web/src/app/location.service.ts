import { Injectable } from '@angular/core';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private lat: number;
  private latDeg: number = 40;
  private latMin: number = 0;
  private isNorthHemi: boolean = true;

  private lon: number;
  private lonDeg: number = 78;
  private lonMin: number = 0;
  private isEastHemi: boolean = false;

  constructor(private appService: AppService) { 
    console.log(this);
    this.updateLocation();
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

  public getLat(): number {
    return this.lat;
  }

  public getLon(): number {
    return this.lon;
  }

  private updateLocation() {
    this.lat = (this.isNorthHemi? 1: (-1)) * (this.latDeg + this.latMin/60);
    this.lon = (this.isEastHemi? 1: (-1)) * (this.lonDeg + this.lonMin/60);

    this.publishLocationChangeEvent();
  }

  private publishLocationChangeEvent() {
    this.appService.changeLocation({
      lat: this.lat, 
      lon: this.lon
    });
  }
}
