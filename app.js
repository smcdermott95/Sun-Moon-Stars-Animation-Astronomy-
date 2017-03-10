
    //declare 3 canvas contexts
    //layer 1(bottom) is the sky color canvas
    //layer 2(middle) is the lines and degree label canvas
    //layer 3(top) is the canvas for the sun, moon and stars
    var c1,skyCtx,graphCtx,sunPointsCtx,sunMoonStarCtx;

    //initialize arrays for star declination and hour displacement
    //using values for north star (dec: 89)
    //and arbitrary star above equator(dec: 0)
    var starDeclination=[89,0];
    var hourDisplacement=[6,2];

    var oldDate=moment("0000", "YYYY");
    var currentDate=moment("0000", "YYYY");
    var oldTimezone=0;
    var currentTimezone=0;
    var oldLocation;
    var currentLocation = new Location();

    //set the start location to new york city, NY
    function tempStartLocation()
    {
      var newYork=new Location("new york",40,43,"n",74,0,"w");
      document.getElementById("timezone").value=-5;
      setTimezone(getTimezone());
      updateLocation(newYork);
      setLocation(getLocation());
      drawCanvas();
    }


    //set the canvas contexts and draw the lines and degree labels on the
    //graph canvas
    function initializeCanvases()
    {
      c1 = document.getElementById("skyCanvas");
      skyCtx = c1.getContext("2d");
      var c2 = document.getElementById("graphCanvas");
      graphCtx = c2.getContext("2d");
      var c3 = document.getElementById("sunPointsCanvas");
      sunPointsCtx = c3.getContext("2d");
      var c4 = document.getElementById("sunMoonStarCanvas");
      sunMoonStarCtx = c4.getContext("2d");


      //draw 10-80 degree altitude lines, in 10 degree increments
      for(var count=10; count<=80; count=count+10)
      {
        graphCtx.beginPath();
        graphCtx.moveTo(0,yCoord(count));
        graphCtx.lineTo(xCoord(360),yCoord(count));
        graphCtx.strokeStyle = '#555555';
        graphCtx.stroke();
        graphCtx.closePath();
      }

      //draw 180 degree azimith line
      graphCtx.beginPath();
      graphCtx.moveTo(xCoord(180),yCoord(0));
      graphCtx.lineTo(xCoord(180),yCoord(90));
      graphCtx.strokeStyle = '#800000';
      graphCtx.stroke();
      graphCtx.closePath();

      //draw 90 and 270 degree azimith line
      for(var i=90; i<=270; i+=180)
      {
        graphCtx.beginPath();
        graphCtx.moveTo(xCoord(i),yCoord(0));
        graphCtx.lineTo(xCoord(i),yCoord(90));
        graphCtx.strokeStyle = '#555555';
        graphCtx.stroke();
        graphCtx.closePath();
      }

      //draw -6 to 0 degree altitude twilight box
      graphCtx.beginPath();
      graphCtx.fillStyle ='#0099cc';
      graphCtx.fillRect(xCoord(0),yCoord(-6),xCoord(360),-6*c1.height/120);
      graphCtx.closePath();

      //draw -12 to -6 degree altitude twilight box
      graphCtx.beginPath();
      graphCtx.fillStyle ='#003366';
      graphCtx.fillRect(xCoord(0),yCoord(-12),xCoord(360),-6*c1.height/120);
      graphCtx.closePath();

      //draw -18 to -12 degree altitude twilight box
      graphCtx.beginPath();
      graphCtx.fillStyle ='#0e2f44';
      graphCtx.fillRect(xCoord(0),yCoord(-18),xCoord(360),-6*c1.height/120);
      graphCtx.closePath();

      //draw -30 to -18 degree altitude night box
      graphCtx.beginPath();
      graphCtx.fillStyle ='#222222';
      graphCtx.fillRect(xCoord(0),yCoord(-30),xCoord(360),-12*c1.height/120);
      graphCtx.closePath();

      //draw 0 altitude degree line
      graphCtx.beginPath();
      graphCtx.moveTo(0,yCoord(0));
      graphCtx.lineTo(xCoord(360),yCoord(0));
      graphCtx.strokeStyle = '#800000';
      graphCtx.stroke();
      graphCtx.closePath();

      //draw -18 to -6 degree altitude lines, in 6 degree increments
      for(var count=-18; count<=-6; count=count+6)
      {
        graphCtx.beginPath();
        graphCtx.moveTo(0,yCoord(count));
        graphCtx.lineTo(xCoord(360),yCoord(count));
        graphCtx.strokeStyle = '#800000';
        graphCtx.stroke();
        graphCtx.closePath();
      }

      //draw direction labels
      graphCtx.font = "14px Arial";
      graphCtx.fillStyle="#ffffff"
      graphCtx.fillText("South",c1.width*.5,yCoord(90-5));
      graphCtx.font = "14px Arial";
      graphCtx.fillText("West",c1.width*.75,yCoord(90-5));
      graphCtx.font = "14px Arial";
      graphCtx.fillText("East",c1.width*.25,yCoord(90-5));

      //draw degree labels
      for(var count=10; count<=90; count=count+10)
      {
        graphCtx.font = "10px Arial";
        graphCtx.fillStyle="#ffffff"
        graphCtx.fillText(count+" deg",c1.width*.95,yCoord(count-2));
      }

      //draw border
      graphCtx.beginPath();
      graphCtx.strokeStyle = '#800000';
      graphCtx.strokeRect(0, 0, c1.width, c1.height);
      graphCtx.closePath();
    }



    //convert altitude angle(-30 to +90) to pixel y-coordinate on the canvas
    function yCoord(coord)
    {
      return -c1.height*.75/90*coord+.75*c1.height;
    }

    //convert the azimuth angle (0 to 360 degrees east of north) to
    //an x-coordinate on the canvas
    function xCoord(coord)
    {
      return coord/360*c1.width;
    }

    function gradientFunction(sunAltitude)
    {
      var color;
      /*if(sunAltitude>30)
      {
        color="#ffff00";
      }
      else*/ if(sunAltitude>=0)
      {
        var red=Math.round((255-255)*Math.pow(sunAltitude/90,.25)+255);
        var green=Math.round((255-102)*Math.pow(sunAltitude/90,.25)+102);
        var blue=Math.round((153-0)*Math.pow(sunAltitude/90,.25)+0);
        color="#"+red.toString(16)+green.toString(16)+"00";
        //console.log(color);
      }
      else
      {
        color="#ff6600";
      }
      return color;
    }

    function getLocation()
    {
      var name="custom";
      var latDeg=parseInt(document.getElementById("latDeg").value);
      var latMin=parseInt(document.getElementById("latMin").value);
      var lonDeg=parseInt(document.getElementById("lonDeg").value);
      var lonMin=parseInt(document.getElementById("lonMin").value);
      var vHemi=document.getElementById("vHemi").value;
      var hHemi=document.getElementById("hHemi").value;

      //oldLocation=currentLocation.clone();
      var location=new Location(name,latDeg, latMin,vHemi,lonDeg,lonMin,hHemi);
      return location;
    }

    function setLocation(location)
    {
      oldLocation=currentLocation;
      currentLocation=location;
    }

    function updateLocation(location)
    {
      //document.getElementById("locationName").value=; //TODO
      document.getElementById("latDeg").value=location.latitudeDegrees;
      document.getElementById("latMin").value=location.latitudeMinutes;
      document.getElementById("vHemi").value=location.hemisphereNS;
      document.getElementById("lonDeg").value=location.longitudeDegrees;
      document.getElementById("lonMin").value=location.longitudeMinutes;
      document.getElementById("hHemi").value=location.hemisphereEW;
    }

    function changeLocation()
    {
      setLocation(getLocation());
      drawCanvas();
    }

    function getDate()
    {
      var day=document.getElementById("day").value;
      var month=document.getElementById("month").value;
      var year=document.getElementById("year").value;
      var hour=document.getElementById("hour").value;
      var min=document.getElementById("min").value;
      var ampm=document.getElementById("ampm").value;
      var timezone=currentTimezone;

      var date;
      if(checkClockType()=="12")
      {
        date=moment(month+"/"+day+"/"+year+" "+hour+":"+min+" "+ampm,"M/D/YYYY h:mm a");
      }
      else
      {
        date=moment(month+"/"+day+"/"+year+" "+hour+":"+min,"M/D/YYYY H:m");
      }

      date.utcOffset(parseInt(timezone), true);

      return date;
    }

    function setDate(date)
    {
      oldDate=currentDate;
      currentDate=date;

      if(oldDate.month()!=currentDate.month())
      {
        handleMonthChange2();
      }
    }

    function updateDate(date)
    {
      document.getElementById("day").value=date.date();
      document.getElementById("month").value=date.month()+1;
      document.getElementById("year").value=date.year();
      document.getElementById("min").value=date.minute();


      if(checkClockType()=="12")
      {
        document.getElementById("hour").value=date.clone().format("h");
        document.getElementById("ampm").value=date.clone().format("a").charAt(0);
      }
      else {
        document.getElementById("hour").value=date.hour();
      }

    }



    function calculateDate(oldDate)
    {
      var date=oldDate.utcOffset(currentTimezone);
      return date;
    }

    function getTimezone()
    {
      return parseInt(document.getElementById("timezone").value);
    }

    function setTimezone(timezone)
    {
      oldTimezone=currentTimezone;
      currentTimezone=timezone;
    }



    function changeDate()
    {
      setDate(getDate());
      drawCanvas();
    }

    /*
    This function will enable or disable the am/pm drop-down selection
    if the user changes the clock type to or from 12 to 24 hour.
    This function will convert the time drop-down boxes to 12hr or 24hr format
    if the user changes the clock type to or from 12 to 24 hour.
    */
    function updateClockType()
    {
      //grab the hour selection box
      var hourDropDown=document.getElementById("hour");

      //grab the selected hour on page
      var hour=document.getElementById("hour").value;

      //check which clock type is selected(12 or 24)
      if(checkClockType()=="12")
      {
        //if clock type is 12 enable the am/pm selection box
        document.getElementById("ampm").disabled=false;

        //delete options from hour selection box
        for(var i=hourDropDown.length; i>=0; i--)
        {
          hourDropDown.remove(i);
        }

        //create 12am/12pm option and add to hour selection
        var option = document.createElement("option");
        option.value="12";
        option.text="12";
        hourDropDown.add(option);

        //create 1-11am/pm options and add to hour selection
        for(var i=1; i<=11; i++)
        {
          option = document.createElement("option");
          option.value=i;
          option.text=i;
          hourDropDown.add(option);
        }

        //create a moment using the selected hour and convert to 12 hour format
        var hourMoment=moment(hour,"HH");
        document.getElementById("hour").value=parseInt(hourMoment.clone().format("hh"));
        document.getElementById("ampm").value=hourMoment.format("a").charAt(0);
      }
      else
      {
        //if clock type is 24 disable the am/pm selection box
        document.getElementById("ampm").disabled=true;

        //delete options from hour selection box
        for(var i=hourDropDown.length; i>=0; i--)
        {
          hourDropDown.remove(i);
        }

        //create 0-23 hour options and add to hour selection
        var option;
        for(var i=0; i<=23; i++)
        {
          option = document.createElement("option");
          option.value=i;
          option.text =i;
          hourDropDown.add(option);
        }

        //create a moment from the selected hour and selected am/pm
        //and convert to 24 hour format.
        var hourMoment=moment(hour+" "+document.getElementById("ampm").value,"hh a");
        document.getElementById("hour").value=parseInt(hourMoment.clone().format("HH"));
      }
    }



    //This function will determine which radio button for clock
    //type (12 or 24) is checked and return
    function checkClockType() {
      if(document.getElementById("clockType12").checked) {
        return "12";
      }
      else {
        return "24";
      }
    }



    /*
    This function will update the day selection options (0-31) if the user
    changes the month selection.
    */
    function handleMonthChange2() {
      var day=currentDate.clone().format("D");
      //var month=currentDate.clone.format("MM");
      //var year=currentDate.clone.format("YYYY");

      //var daysInMonth=moment(month+"-"+year, "MM-YYYY").daysInMonth();
      var daysInMonth=moment(currentDate.clone().format("MM-YYYY"),"MM-YYYY").daysInMonth();

      var dayDropDown=document.getElementById("day");

      //delete options from day selection box
      for(var i=dayDropDown.length; i>=0; i--)
      {
        dayDropDown.remove(i);
      }

      //create 0-daysInMonth options in day selection drop-down
      //each option represents a date in a month
      var option;
      for(var i=1; i<=daysInMonth; i++)
      {
        option = document.createElement("option");
        option.value =i;
        option.text =i;
        dayDropDown.add(option);
      }

      //if the date is greater than the number of days
      //in updated month then set the day to the highest date in month
      if(day>daysInMonth)
      {
        day=daysInMonth;
      }
      document.getElementById("day").value=day;
    }


    function handleTimezoneChange()
    {
      /*TODO-*/
      //store old date
      oldDate=getDate();

      setTimezone(getTimezone());
      //console.log("before "+currentDate.hour()+" "+oldTimezone);
      updateDate(calculateDate(oldDate));
      setTimezone(getTimezone())
      setDate(getDate());
      console.log("after "+currentDate.hour()+" "+currentTimezone);
      drawCanvas();
    }


    /*
    This function will draw the moon with a given JS Date object,
    a latitude and longitude.
    */
    function drawMoon(timeAndDate,latitude, longitude)
    {
      //calculate moon alitude and azimuth
      var moonPos=SunCalc.getMoonPosition(/*Date*/ timeAndDate, /*Number*/ latitude, /*Number*/ longitude);
      var moonAltitude=moonPos.altitude*180/Math.PI;
      var moonAzimuth=moonPos.azimuth*180/Math.PI+180;

      //adjustment for southern hemisphere, TODO NEEDS TO BE FIXED
      if(latitude<0)
      {
        moonAzimuth=(moonAzimuth+180)%360;
      }

      //draw moon on canvas
      sunMoonStarCtx.beginPath();
      sunMoonStarCtx.arc(xCoord(moonAzimuth),yCoord(moonAltitude),8,0,2*Math.PI);
      sunMoonStarCtx.strokeStyle = '#990000';
      sunMoonStarCtx.stroke();
      sunMoonStarCtx.fillStyle = '#ffffff';
      sunMoonStarCtx.fill();
      sunMoonStarCtx.closePath();
    }



    /*
    This function calculates and plots red dots/circles for every hour (0-23)
    indicating where the sun is at the beginning of each hour HH:00
    */
    function plotSunPoints(timezone)
    {

      //A moment counter that will be incremented every hour
      var momentCounter=moment(currentDate.clone().format("MM/DD/YYYY"),"MM/DD/YYYY").utcOffset(timezone);
      var latitude=currentLocation.latitude;
      var longitude=currentLocation.longitude;


      //JS Date object require for SunCalc library
      var timeAndDate;

      //Used to Altitude and Azimuth of the sun at the beginning of an hour
      var sunHourAltitude, sunHourAzimuth;

      sunPointsCtx.clearRect(0,0, c1.width, c1.height);

      //Loop through every hour
      for(count=0;count<=23; count++)
      {
        //Convert moment object to JS Date
        timeAndDate=momentCounter.clone().toDate();

        //Calculate altitude and azimuth
        var sunPos=SunCalc.getPosition(/*Date*/ timeAndDate, /*Number*/ latitude, /*Number*/ longitude);
        sunHourAltitude=sunPos.altitude*180/Math.PI;
        sunHourAzimuth=sunPos.azimuth*180/Math.PI+180;

        //adjust azimuth if in southern hemisphere, TODO NEEDS TO BE FIXED
        if(latitude<0)
        {
          sunHourAzimuth=(sunHourAzimuth+180)%360
        }

        //draw the red circle/dots
        sunPointsCtx.beginPath();
        sunPointsCtx.arc(xCoord(sunHourAzimuth),yCoord(sunHourAltitude),3,0,2*Math.PI);
        sunPointsCtx.strokeStyle = '#990000';
        sunPointsCtx.stroke();
        sunPointsCtx.closePath();

        //determine the hour label to be printed next to each point
        var hourString;
        if(checkClockType()=="12")
        {
          hourString=momentCounter.clone().format("h a");
        }
        else {
          hourString=momentCounter.clone().format("H:mm");
        }

        //draw sun point hour text label
        sunPointsCtx.font = "10px Arial";
        sunPointsCtx.fillText(hourString,xCoord(sunHourAzimuth+1),yCoord(sunHourAltitude+1));

        //increment the moment object by an hour
        momentCounter.add(1,'h');
      }
    }



    //Sine and Cosine functions that take degrees as arguments.
    function sin(angle)
    {
      return Math.sin(Math.PI/180*angle);
    }
    function cos(angle)
    {
      return Math.cos(Math.PI/180*angle);
    }



    //Seeded Random Number generator
    //http://indiegamr.com/generate-repeatable-random-numbers-in-js/
    Math.seed=6;
    Math.seededRandom=function(max,min){
      max=max||1;
      min=min||0;

      Math.seed = (Math.seed * 9301 + 49297) % 233280;
      var rnd = Math.seed / 233280;
      return min + rnd * (max - min);
    }

    /*
      This function pushes random values of declination and hour displacements
      into the respective arrays for every star to be generated.
    */
    function initializeStarsArrays(numberOfStars)
    {
      //generate random declination and hour displacements
      Math.seed=6;
      for(var count=0; count<numberOfStars; count++)
      {

        starDeclination.push(Math.seededRandom()*180-90);
        hourDisplacement.push(Math.seededRandom()*24);
      }
    }

    //TODO 2) make stars vary with longitude
    function drawStars(timeAndDate,latitude,longitude,altitude,azimuth)
    {
      //calculate star altitde and azimuth for every RNG based declination
      //and hour displacement in arrays.
      for(var i=0; i<starDeclination.length;i++)
      {
        var hour=(timeAndDate.getHours()+timeAndDate.getMinutes()/60+hourDisplacement[i])%24;
        starAltitude=180/Math.PI*Math.asin(cos(latitude)*cos(hour*15)*cos(starDeclination[i])+sin(latitude)*sin(starDeclination[i]));
        starAzimuth=180/Math.PI*Math.acos((sin(starAltitude)*sin(latitude)-sin(starDeclination[i]))/(cos(starAltitude)*cos(latitude)));

        //star azimuth adjustment
        if((hour*15)>180)
        {
          starAzimuth=360-starAzimuth;
        }
        starAzimuth=(starAzimuth+180)%360;


        //adjustment for southern hemisphere, TODO NEEDS TO BE FIXED
        if(latitude<0)
        {
            starAzimuth=(starAzimuth+180)%360;
        }

        //only draw stars with altitude above 0 degrees(above horizon)
        if(starAltitude>0)
        {
          sunMoonStarCtx.beginPath();
          sunMoonStarCtx.arc(xCoord(starAzimuth),yCoord(starAltitude),1,0,2*Math.PI);
          sunMoonStarCtx.fillStyle = 'white';
          sunMoonStarCtx.fill();
          sunMoonStarCtx.closePath();
        }
      }
    }



    /*
    This function sets the drop down box dates and time to the current time
    in the given UTC zone.
    */
    function now()
    {
      var momentNow=moment().utcOffset(parseInt(document.getElementById("timezone").value),false);
      updateDate(momentNow);
      setDate(momentNow);
      drawCanvas();
    }

    function playInitialize()
    {
      /*
      //var momentNow=moment();
      var month=document.getElementById("month").value;
      var day=document.getElementById("day").value;
      var year=document.getElementById("year").value;
      */
      var momentCounter=moment(currentDate.clone().format("M/D/YYYY")+" 0","M/D/YYYY H").utcOffset(timezone,true);

      var framesPerSecond=60;
      var delay=1000/framesPerSecond;


      //the number of seconds in the day that 1 frame in the animation will skip over
      //ex:value of 120 means 1 frame in animation represents 2 minutes(120s) of the day
      //var playSecondInterval=120;
      var SecondsPlayedPerSecond=3600;
      var playSecondInterval=SecondsPlayedPerSecond/framesPerSecond;


      play(momentCounter,playSecondInterval,delay);
      //document.getElementById("playbutton").value="Stop";


    }

    function play(momentCounter, playSecondInterval,delay)
    {
      updateDate(momentCounter);
      setDate(getDate());
      drawCanvas();

      momentCounter.add(playSecondInterval,"s");
      if(momentCounter.hour()!=23||momentCounter.minute()<(60-playSecondInterval/60))
      {
        setTimeout(play,delay, momentCounter,playSecondInterval,delay);
      }
    }

    function drawCanvas()
    {
      var timezone=currentTimezone;
      var latitude=currentLocation.latitude;
      var longitude=currentLocation.longitude;
      var currentMoment=currentDate.clone();


      //Calculate Current sun position
      //var currentTimeAndDate=new Date(year, month, day, hour, min);
      var currentTimeAndDate=currentMoment.clone().toDate();
      var currentSunPos=SunCalc.getPosition(/*Date*/ currentTimeAndDate, /*Number*/ latitude, /*Number*/ longitude);
      var sunAltitude=currentSunPos.altitude*180/Math.PI;
      var sunAzimuth=currentSunPos.azimuth*180/Math.PI+180;

      //adjustment for southern hemisphere
      if(latitude<0)
      {
        sunAzimuth=(sunAzimuth+180)%360;
      }

      //initialize canvas vars and clear

      //clear skyCanvas
      skyCtx.clearRect(0,0, c1.width, c1.height);

      //draw sky color
      skyCtx.beginPath();
      var color="";
      var grad=skyCtx.createLinearGradient(xCoord(0),yCoord(90),xCoord(0),yCoord(0));
      if(sunAltitude<-18)
      {
        color="#301860";
        grad.addColorStop(0,"black");
        grad.addColorStop(1,color);
        skyCtx.fillStyle = grad;
      }
      else if(sunAltitude<-12)
      {
        color="#00344d"
        grad.addColorStop(0,"#301860");
        grad.addColorStop(1,color);
        skyCtx.fillStyle = grad;
      }
      else if(sunAltitude<-6)
      {
        color="#006999"
        grad.addColorStop(0,"#00344d");
        grad.addColorStop(1,color);
        skyCtx.fillStyle = grad;
      }
      else if(sunAltitude<0)
      {
        color="#4dc6ff"
        grad.addColorStop(0,"#006999");
        grad.addColorStop(1,color);
        skyCtx.fillStyle = grad;
      }
      else
      {
        color="#e6f7ff"
        grad.addColorStop(0,"#9adfff");
        grad.addColorStop(1,color);
        skyCtx.fillStyle = grad;
      }

      skyCtx.fillRect(xCoord(0),yCoord(0),xCoord(360),-90*c1.height/120);
      skyCtx.closePath();

      //clear sunMoonStarCanvas
      sunMoonStarCtx.clearRect(0,0, c1.width, c1.height);

      //plot 24 points for each hour
      //console.log("test "+currentMoment.clone().format("YYYY DD")+" vs "+previousDay.clone().format("YYYY DD")+!currentMoment.isSame(previousDay, "date"));
      if(!currentMoment.isSame(oldDate, "date")||currentMoment.utcOffset()!=oldDate.utcOffset()
          //||!currentLocation.isSame(oldLocation)
        )
      {
        plotSunPoints(timezone);
      }

      var sunColor=gradientFunction(sunAltitude);

      //draw sun
      sunMoonStarCtx.beginPath();
      sunMoonStarCtx.arc(xCoord(sunAzimuth),yCoord(sunAltitude),10,0,2*Math.PI);
      sunMoonStarCtx.strokeStyle = '#990000';
      sunMoonStarCtx.stroke();
      sunMoonStarCtx.fillStyle = sunColor;
      sunMoonStarCtx.fill();
      sunMoonStarCtx.closePath();

      if(sunAltitude<-6)
      {
        drawStars(currentTimeAndDate, latitude, longitude, sunAltitude,sunAzimuth);
      }
      drawMoon(currentTimeAndDate,latitude, longitude);


      var sunTimes=SunCalc.getTimes(/*Date*/ currentTimeAndDate, /*Number*/ latitude, /*Number*/ longitude);
      var sunrise=moment(sunTimes.sunrise).utcOffset(timezone,false);
      var sunset=moment(sunTimes.sunset).utcOffset(timezone,false);
      var dayLength=sunset.diff(sunrise, 'minutes')/60.0;
      var sunriseStr;
      var sunsetStr;

      if(checkClockType()=="12")
      {
        sunriseStr=sunrise.format("h:mm a");
        sunsetStr=sunset.format("h:mm a");
      }
      else {
        sunriseStr=sunrise.format("H:mm");
        sunsetStr=sunset.format("H:mm");
      }


      var sunTimesString="Sunrise: "+sunriseStr+" Sunset: "+sunsetStr+" Day Length: "+dayLength;
      document.getElementById("infoPanel").innerHTML=sunTimesString;
    }
