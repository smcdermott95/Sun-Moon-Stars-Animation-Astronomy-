import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent implements OnInit {

  @ViewChild('mapEle') mapRef: ElementRef;
  private mapEle: HTMLElement;

  constructor() {
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
  private mapReady: boolean = false;
  //private sun: any;
  //var sun={anchor: {x:16, y:16},url: "./sun.png"}; //if using sun image
  private initMap() {
    let newYork: google.maps.LatLngLiteral = {lat: 40.717, lng: -74.000};
    this.map = new google.maps.Map(this.mapEle, {
      zoom: 3,
      center: newYork
    });

    this.marker = new google.maps.Marker({
      position: newYork,
      map: this.map
    });


    // this.map.addListener('click', function(e) {
    //   if(!SMSA.events.isPlaying){
    //     placeMarkerAndPanTo(e.latLng, map);
    //   }
    // });

    //nite.init(map);
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
  }

}
