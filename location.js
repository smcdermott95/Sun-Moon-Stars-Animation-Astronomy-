class Location {
  constructor(name,latDeg,latMin,hemisphereNS,lonDeg,lonMin,hemisphereEW,timezone,observeDST){
    this.name=name;
    this.latitudeDegrees=latDeg;
    this.latitudeMinutes=latMin;
    this.latitude=latDeg+latMin/60.0;
    this.hemisphereNS=hemisphereNS;
    this.longitudeDegrees=lonDeg;
    this.longitudeMinutes=lonMin
    this.longitude=lonDeg+lonMin/60.0
    this.hemisphereEW=hemisphereEW;
    this.timezone=timezone;
    this.observeDST=observeDST;

    //Convert latitude to negative if south was selected
    if(hemisphereNS=="s")
    {
      this.latitude=-1*this.latitude;
    }

    //Convert longitude to negative if west was selected
    if(hemisphereEW=="w")
    {
      this.longitude=-1*this.longitude;
    }
  }

  clone(){
    var copy = new Location(this.name,this.latitudeDegrees,this.latitudeMinutes,this.hemisphereNS,this.longitudeDegrees,this.longitudeMinutes,this.hemisphereEW,this.timezone,this.observeDST);
    return copy;
  }

  isSame(otherLocation){
    return
      this.name==otherLocation.name&&
      this.latitudeDegrees==otherLocation.latitudeDegrees&&
      this.latitudeMinutes==otherLocation.latitudeMinutes&&
      this.hemisphereNS==otherLocation.hemisphereNS&&
      this.longitudeDegrees==otherLocation.longitudeDegrees&&
      this.longitudeMinutes==otherLocation.longitudeMinutes&&
      this.hemisphereEW==otherLocation.hemisphereEW&&
      this.timezone==otherLocation.timezone&&
      this.observeDST==otherLocation.observeDST;
  }
}
