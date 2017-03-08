class Location {
  constructor(name,latDeg,latMin,hemisphereNS,lonDeg,lonMin,hemisphereEW){
    this.name=name;
    this.latitudeDegrees=latDeg;
    this.latitudeMinutes=latMin;
    this.latitude=latDeg+latMin/60.0;
    this.hemisphereNS=hemisphereNS;
    this.longitudeDegrees=lonDeg;
    this.longitudeMinutes=lonMin
    this.longitude=lonDeg+lonMin/60.0
    this.hemisphereEW=hemisphereEW;

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
    var copy = new Location(this.name,this.latitudeDegrees,this.latitudeMinutes,this.hemisphereNS,this.longitudeDegrees,this.longitudeMinutes,this.hemisphereEW);
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
      this.hemisphereEW==otherLocation.hemisphereEW;
  }
}
