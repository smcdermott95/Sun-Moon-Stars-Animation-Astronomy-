import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AppService, IDateChangeEvent, ILocationChangeEvent, ITimezoneInfo } from './../app.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent implements OnInit {

  @ViewChild('mapEle', { static: true }) mapRef: ElementRef;
  private mapEle: HTMLElement;
  private mapReady: boolean;
  private location: google.maps.LatLng;
  private ignoreNextLocationUpdate: boolean = false;

  constructor(private appService: AppService) {

  }

  ngOnInit() {
    this.mapEle = this.mapRef.nativeElement as HTMLElement;
    if(window['googleMapsLoaded']) { //TODO: find a way to not to pollute global namespace (see index.html too)
        this.initMap();
    }
    else {
      window['mapClass'] = this;
    }
  }

  private map: google.maps.Map;
  private marker: google.maps.Marker;
  private sunMarker: google.maps.Circle;
  private timezone: number;
  //private sun: any;
  //var sun={anchor: {x:16, y:16},url: "./sun.png"}; //if using sun image
  private async initMap() {
    this.map = new google.maps.Map(this.mapEle, {
      zoom: 3,
      center: { lat: 0, lng: 0}
    });

    this.marker = new google.maps.Marker({
      position: {lat: 0, lng: 0},
      map: null
    });


    this.map.addListener('click', async (e: google.maps.MouseEvent) => {
      //if(!SMSA.events.isPlaying){
        await this.placeMarkerAndPanTo(e.latLng);
        this.publishMapChangeEvent(e.latLng);
      //}
    });

    //nite.init(map);
    if(this.location)
      await this.placeMarkerAndPanTo(this.location);
    this.mapReady=true;

    //initialize sun marker to current location
    /*
    sunMarker=new google.maps.Marker({
    position: {lat:nite.getSunPosition().lat(), lng:nite.getSunPosition().lng()},
      map: map,
      icon: sun,
    })
    */
    // this.sunMarker = new google.maps.Circle({
    //   map: this.map,
    //   center: { lat:nite.getSunPosition().lat(), lng:nite.getSunPosition().lng() },
    //   radius: 200000,
    //   fillColor: "#FF0",
    //   fillOpacity: 1,
    //   strokeColor: "#F00",
    //   strokeWeight: 1,
    //   strokeOpacity: 1,
    //   clickable: false,
    //   editable: false
    // });

    this.appService.locationPanelChanged$.subscribe( (e: ILocationChangeEvent) => {
      if(!this.ignoreNextLocationUpdate) {
        this.location = new google.maps.LatLng(e.lat, e.lon);
        if(this.mapReady)
          this.placeMarkerAndPanTo(this.location);
      }
      else {
        this.ignoreNextLocationUpdate = false;
      }
		});
		this.appService.dateChanged$.subscribe( (e: IDateChangeEvent) => {
      //update shadow
		});
  }

  private async placeMarkerAndPanTo(latLng: google.maps.LatLng) {
    this.marker.setMap(null);
    this.marker = new google.maps.Marker({
      position: latLng,
      map: this.map
    });
    this.map.panTo(latLng);
  
  
    var tz;
    var dst;

    let tzApiResponse: Response = await fetch("https://maps.googleapis.com/maps/api/timezone/json?location="+latLng.lat()+","+latLng.lng()+"&timestamp="+(Math.round((new Date().getTime())/1000)).toString()+"&key=AIzaSyBMsO1sfJI8djX1LkDq4vYiXudrpKSi4Pk");
    let newTimezoneInfo: ITimezoneInfo = await tzApiResponse.json();

    if(newTimezoneInfo.status != 'ZERO_RESULTS') {
      this.timezone = Math.floor(newTimezoneInfo.rawOffset/3600);
    }
    else {
      this.timezone = Math.floor(latLng.lng()/180*12); //guess timezone
    }
  }

  private publishMapChangeEvent(location: google.maps.LatLng) {
    this.ignoreNextLocationUpdate = true;  //map component initiates the location change - no need to update on next event
    this.appService.changeMapLocation({lat: location.lat(), lon: location.lng(), timezone: this.timezone})
  }

}
