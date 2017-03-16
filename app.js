
    //declare 3 canvas contexts
    //layer 1(bottom) is the sky color canvas
    //layer 2(middle) is the lines and degree label canvas
    //layer 3(top) is the canvas for the sun, moon and stars
    var c1,skyCtx,graphCtx,sunPointsCtx,sunMoonStarCtx;
    var interval;

    //initialize arrays for star declination and hour displacement
    //using values for north star (dec: 89)
    //and arbitrary star above equator(dec: 0)
    var starDeclination=[89,0];
    var hourDisplacement=[6,2];

    var oldDate=moment("0000", "YYYY");
    var currentDate=moment("0000", "YYYY");
    var currentTimezone=0;
    var oldLocation;
    var currentLocation = new Location();
    var textColor="white";
    var currentskyColorType = "";
    var islocationUpdated;
    var currentDeclination;
    var fps="60";
    var playSpeed=3600;

    //set the start location to new york city, NY
    function tempStartLocation()
    {
      var newYork=new Location("new york",40,43,"n",74,0,"w", -5, true);
      setLocationName("New York City");
      updateLocation(newYork);
      setLocation(newYork);
      calculateTimezone();
      //drawCanvas();
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

      //draw degree labels
      for(var count=10; count<=90; count=count+10)
      {
        graphCtx.font = "10px Arial";
        graphCtx.fillStyle="#ffffff";
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

    /*
    Calculate a sun color in hex given an altitude and return it.
    */
    function gradientFunction(sunAltitude)
    {
      var color;
      if(sunAltitude>=0)
      {
        var red=Math.round((255-255)*Math.pow(sunAltitude/90,.25)+255);
        var green=Math.round((255-102)*Math.pow(sunAltitude/90,.25)+102);
        var blue=Math.round((153-0)*Math.pow(sunAltitude/90,.25)+0);
        color="#"+red.toString(16)+green.toString(16)+"00";
      }
      else
      {
        color="#ff6600";
      }
      return color;
    }

    /*
    Get the selected location on the screen and return a location object
    */
    function getLocation()
    {
      var name="custom";
      var latDeg=parseInt(document.getElementById("latDeg").value);
      var latMin=parseInt(document.getElementById("latMin").value);
      var lonDeg=parseInt(document.getElementById("lonDeg").value);
      var lonMin=parseInt(document.getElementById("lonMin").value);
      var vHemi=document.getElementById("vHemi").value;
      var hHemi=document.getElementById("hHemi").value;
      var timezone=document.getElementById("timezone").value;

      //oldLocation=currentLocation.clone();
      var location=new Location(name,latDeg, latMin,vHemi,lonDeg,lonMin,hHemi,timezone,0);
      return location;
    }

    /*
    Set the current location to a location
    */
    function setLocation(location)
    {
      oldLocation=currentLocation;
      currentLocation=location;
      islocationUpdated=false;
    }

    /*
    Set the location on the input screen to a location object
    */
    function updateLocation(location)
    {
      document.getElementById("latDeg").value=location.latitudeDegrees;
      document.getElementById("latMin").value=location.latitudeMinutes;
      document.getElementById("vHemi").value=location.hemisphereNS;
      document.getElementById("lonDeg").value=location.longitudeDegrees;
      document.getElementById("lonMin").value=location.longitudeMinutes;
      document.getElementById("hHemi").value=location.hemisphereEW;
    }


    /*
    Update the location name drop down selection
    */
    function setLocationName(name)
    {
      document.getElementById("locationName").value=name;
    }

    /*
    Called when user chooses a city from the drop-down
    Find the selected city in the locationDB vector and update the input pane
    with that city's data
    */
    function changeLocationName()
    {
      var name=document.getElementById("locationName").value;
      for(var i=0; i<locationDB.locationVec.length;i++)
      {
        if(locationDB.locationVec[i].name==name)
        {
          updateLocation(locationDB.locationVec[i]);
          setLocation(locationDB.locationVec[i]);
          calculateTimezone();
          i=locationDB.locationVec.length;
        }
      }
      drawCanvas();
    }

    /*
    Called when user changes the location attributes on the input screen
    */
    function changeLocation()
    {
      setLocationName("custom");
      setLocation(getLocation());
      drawCanvas();
    }

    /*
    Get the selected date on the input screen and return it as a moment
    */
    function getDate()
    {
      var day=document.getElementById("day").value;
      var month=document.getElementById("month").value;
      var year=document.getElementById("year").value;
      var hour=document.getElementById("hour").value;
      var min=document.getElementById("min").value;
      var ampm=document.getElementById("ampm").value;

      var date;
      if(checkClockType()=="12")
      {
        date=moment(month+"/"+day+"/"+year+" "+hour+":"+min+" "+ampm,"M/D/YYYY h:mm a");
      }
      else
      {
        date=moment(month+"/"+day+"/"+year+" "+hour+":"+min,"M/D/YYYY H:m");
      }

      date.utcOffset(parseInt(currentTimezone), true);

      return date;
    }

    /*
    Set the current date to a date
    */
    function setDate(date)
    {
      oldDate=currentDate;
      currentDate=date;

      if(oldDate.month()!=currentDate.month())
      {
        handleMonthChange2();
      }
    }


    /*
    Set the date selected on the input screen to a moment
    */
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



    /*
    Calculate old date and timezone to currentTimezone
    */
    function calculateDate(oldDate)
    {
      var date=oldDate.clone().utcOffset(currentTimezone);
      return date;
    }

    /*
    Get the selected timezone on the input screen
    */
    function getTimezone()
    {
      return parseInt(document.getElementById("timezone").value);
    }

    /*
    update the timezone on input screen
    */
    function updateTimezone(timezone)
    {
      document.getElementById("timezone").value=timezone;
    }

    /*
    Calculate and set the timezone using the current location
    */
    function calculateTimezone()
    {
      //if location observes DST, add 1
      if(moment(currentDate.clone().format("MM/DD/YYYY"),"MM/DD/YYYY").isDST()
         &&currentLocation.observeDST)
      {
        updateTimezone(currentLocation.timezone+1);
        setTimezone(currentLocation.timezone+1);
      }
      else
      {
        updateTimezone(currentLocation.timezone);
        setTimezone(currentLocation.timezone);
      }
    }

    /*
    Set the currentTimezone to a timezone
    */
    function setTimezone(timezone)
    {
      currentTimezone=timezone;
    }


    /*
    Called when user changes the date on the input screen
    */
    function changeDate()
    {
      setDate(getDate());
      calculateTimezone();
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

      plotSunPoints();
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

    /*
    Called when user changes the timezone on input screen
    Converts the time in old timezone to new timezone
    */
    function handleTimezoneChange()
    {
      oldDate=getDate();
      setTimezone(getTimezone());
      updateDate(calculateDate(oldDate));
      setDate(getDate());
      drawCanvas();
    }

    /*
    called when user changes frameRate on input pane
    */
    function handleFrameRateChange()
    {
      fps=document.getElementById("frameRate").value;
    }

    /*
    called when user changes play speed on input pane
    */
    function handleSpeedChange()
    {
      playSpeed=document.getElementById("playSpeed").value*60;
    }


    /*
    This function will draw the moon with a given JS Date object,
    a latitude and longitude.
    */
    function drawMoon(moment,latitude, longitude)
    {
      //conver moment to JS date object
      var timeAndDate=moment.clone().toDate();

      //calculate moon alitude and azimuth
      var moonPos=SunCalc.getMoonPosition(/*Date*/ timeAndDate, /*Number*/ latitude, /*Number*/ longitude);
      var moonAltitude=moonPos.altitude*180/Math.PI;
      var moonAzimuth=moonPos.azimuth*180/Math.PI+180;

      //adjust azimuth if needed
      if(latitude<currentDeclination)
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
    function plotSunPoints()
    {
      //A moment counter that will be incremented every hour
      var momentCounter=moment(currentDate.clone().format("MM/DD/YYYY"),"MM/DD/YYYY").utcOffset(currentTimezone);
      var latitude=currentLocation.latitude;
      var longitude=currentLocation.longitude;


      //JS Date object required for SunCalc library
      var timeAndDate;

      //Used to store Altitude and Azimuth of the sun at the beginning of an hour
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

        //adjust azimuth if necessary
        if(latitude<currentDeclination)
        {
          sunHourAzimuth=(sunHourAzimuth+180)%360;
        }

        //draw the red circle/dots
        sunPointsCtx.beginPath();
        sunPointsCtx.arc(xCoord(sunHourAzimuth),yCoord(sunHourAltitude),3,0,2*Math.PI);
        sunPointsCtx.strokeStyle = '#990000';
        sunPointsCtx.stroke();
        sunPointsCtx.closePath();

        //determine the hour label format to be printed next to each point
        var hourString;
        if(checkClockType()=="12")
        {
          hourString=momentCounter.clone().format("ha");
        }
        else {
          hourString=momentCounter.clone().format("H");
        }



        //draw sun point hour text label
        sunPointsCtx.fillStyle = textColor;
        sunPointsCtx.font = "10px Arial";
        sunPointsCtx.fillText(hourString,Math.round(xCoord(sunHourAzimuth+1)),Math.round(yCoord(sunHourAltitude+1)));

        //increment the moment object by an hour
        momentCounter.add(1,'h');
      }

      var directionsLabels;
      if(latitude>currentDeclination)
      {
        directionsLabels=["East","South","West"];
      }
      else {
        directionsLabels=["West","North","East"];
      }

      sunPointsCtx.fillStyle=textColor;
      sunPointsCtx.font = "14px Arial";
      sunPointsCtx.fillText(directionsLabels[0],c1.width*.25+3,yCoord(90-5));
      sunPointsCtx.fillText(directionsLabels[1],c1.width*.5+3,yCoord(90-5));
      sunPointsCtx.fillText(directionsLabels[2],c1.width*.75+3,yCoord(90-5));
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
    function drawStars(moment,latitude,longitude,altitude,azimuth)
    {
      //convert moment to JS date
      var timeAndDate=moment.clone().toDate();

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

        //adjust azimuth if needed
        if(latitude<currentDeclination)
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
      //initialize a default moment(uses current time) and offset
      var momentNow=moment().utcOffset(parseInt(currentTimezone),false);

      updateDate(momentNow);
      setDate(momentNow);
      calculateTimezone();
      drawCanvas();
    }

    function playInitialize()
    {
      if(document.getElementById("playbutton").innerHTML=="Play")
      {
        //if user clicks play button, change it to a stop button and disable other buttons
        document.getElementById("locationName").disabled=true;
        document.getElementById("timezone").disabled=true;
        document.getElementById("day").disabled=true;
        document.getElementById("month").disabled=true;
        document.getElementById("year").disabled=true;
        document.getElementById("hour").disabled=true;
        document.getElementById("min").disabled=true;
        document.getElementById("ampm").disabled=true;
        document.getElementById("currentButton").disabled=true;
        document.getElementById("playStart").disabled=true;
        document.getElementById("frameRate").disabled=true;
        document.getElementById("playbutton").innerHTML="Stop";

        var momentCounter;

        //set the moment increment counter to the beginning of the day if
        //user checks the corresponding option, otherwise set to current time
        if(document.getElementById("playStart").checked)
        {
          momentCounter=moment(currentDate.clone().format("M/D/YYYY")+" 0","M/D/YYYY H").utcOffset(currentTimezone,true);
        }
        else
        {
          momentCounter=moment(getDate());
        }

        var delay=1000/fps; //milisec

        //for each second passed in real life, the animation will play x seconds
        //of the day
        //var SecondsPlayedPerSecond=playSpeed;

        //the amount of seconds to increment the moment counter each frame
        //var playSecondInterval=SecondsPlayedPerSecond/fps;


        interval=setInterval(play, delay, momentCounter);
      }
      else
      {
        //set play/stop button to play and enable buttons
        document.getElementById("playbutton").innerHTML="Play";
        document.getElementById("locationName").disabled=false;
        document.getElementById("timezone").disabled=false;
        document.getElementById("day").disabled=false;
        document.getElementById("month").disabled=false;
        document.getElementById("year").disabled=false;
        document.getElementById("hour").disabled=false;
        document.getElementById("min").disabled=false;
        document.getElementById("ampm").disabled=false;
        document.getElementById("playStart").disabled=false;
        document.getElementById("frameRate").disabled=false;
        document.getElementById("currentButton").disabled=false;
      }
    }

    function play(momentCounter)
    {
      var playSecondInterval=playSpeed/fps;

      //if the user presses play button...
      if(document.getElementById("playbutton").innerHTML=="Play")
      {
        //...stop the animaion
        clearInterval(interval);
      }
      else
      {
        //otherwise update and set the date, draw canvas, and increment
        //the counter
        updateDate(momentCounter);
        setDate(getDate());
        drawCanvas();

        momentCounter.add(playSecondInterval,"s");
      }
    }

    function drawCanvas()
    {
      //grab the location and date
      var latitude=currentLocation.latitude;
      var longitude=currentLocation.longitude;

      //clone current date moment into JS date time
      var currentTimeAndDate=currentDate.clone().toDate();

      //Calculate Current sun position
      var currentSunPos=SunCalc.getPosition(/*Date*/ currentTimeAndDate, /*Number*/ latitude, /*Number*/ longitude);
      var sunAltitude=currentSunPos.altitude*180/Math.PI;
      var sunAzimuth=currentSunPos.azimuth*180/Math.PI+180;

      //initialize color and gradient vars
      skyCtx.beginPath();
      var color1="";
      var color2="";
      var skyColorType;
      var grad=skyCtx.createLinearGradient(xCoord(0),yCoord(90),xCoord(0),yCoord(0));

      //calculate the 2 sky colors(top and bottom) for the sky gradient
      //using the sun's altitude. set the skyColorType
      if(sunAltitude<-18)
      {
        color1="black";
        color2="#301860";
        skyColorType="night";
      }
      else if(sunAltitude<-12)
      {
        color1="#301860";
        color2="#00344d";
        skyColorType="astronomical";
      }
      else if(sunAltitude<-6)
      {
        color1="#00344d";
        color2="#006999";
        skyColorType="nautical";
      }
      else if(sunAltitude<0)
      {
        color1="#006999";
        color2="#4dc6ff";
        skyColorType="civil";
      }
      else
      {
        color1="#9adfff";
        color2="#e6f7ff";
        skyColorType="day";
      }

      //add colors to gradient
      grad.addColorStop(0,color1);
      grad.addColorStop(1,color2);
      skyCtx.fillStyle = grad;

      //necessary to prevent redundancy of redrawing of skies with same sky colors
      if(skyColorType!=currentskyColorType){

        //clear skyCanvas
        skyCtx.clearRect(0,0, c1.width, c1.height);

        currentskyColorType=skyColorType;

        //change text color and draw the sky.
        textColor=(skyColorType=="day" ? "black" : "white");
        skyCtx.fillRect(xCoord(0),yCoord(0),xCoord(360),-90*c1.height/120);
        skyCtx.closePath();

        plotSunPoints();
      }

      //clear sunMoonStarCanvas
      sunMoonStarCtx.clearRect(0,0, c1.width, c1.height);

      //check if the sun points need to be redrawn again
      //if the date has changed, the timezone has changed,
      //or the location has changed
      if(!currentDate.isSame(oldDate, "date")||currentDate.utcOffset()!=oldDate.utcOffset()
          ||(!currentLocation.isSame(oldLocation)&&islocationUpdated==false))
      {
        //calculate a new declination
        currentDeclination=SunCalc.getPosition(/*Date*/ currentTimeAndDate, 90, 0).altitude*180/Math.PI;

        //plot 24 points for each hour
        plotSunPoints();
        islocationUpdated=true;

        //calculate sunrise, sunset, and day length
        var sunTimes=SunCalc.getTimes(/*Date*/ currentTimeAndDate, /*Number*/ latitude, /*Number*/ longitude);
        var sunrise=moment(sunTimes.sunrise).utcOffset(currentTimezone,false);
        var sunset=moment(sunTimes.sunset).utcOffset(currentTimezone,false);
        var dayLength=sunset.diff(sunrise, 'minutes');
        var sunriseStr;
        var sunsetStr;

        //correctly format times
        if(checkClockType()=="12")
        {
          sunriseStr=sunrise.format("h:mm a");
          sunsetStr=sunset.format("h:mm a");
        }
        else {
          sunriseStr=sunrise.format("H:mm");
          sunsetStr=sunset.format("H:mm");
        }

        var dayLengthStr=Math.floor(dayLength/60.0)+":"+Math.round(dayLength%60.0);

        //output
        var sunTimesString="Sunrise: "+sunriseStr+" Sunset: "+sunsetStr+" Day Length: "+dayLengthStr;
        document.getElementById("infoPanel").innerHTML=sunTimesString;
      }

      //adjust azimuth if necessary
      if(latitude<currentDeclination)
      {
        sunAzimuth=(sunAzimuth+180)%360;
      }

      //get sun color
      var sunColor=gradientFunction(sunAltitude);

      //draw sun
      sunMoonStarCtx.beginPath();
      sunMoonStarCtx.arc(xCoord(sunAzimuth),yCoord(sunAltitude),10,0,2*Math.PI);
      sunMoonStarCtx.strokeStyle = '#990000';
      sunMoonStarCtx.stroke();
      sunMoonStarCtx.fillStyle = sunColor;
      sunMoonStarCtx.fill();
      sunMoonStarCtx.closePath();

      //if the sun altitude is below 6 degrees of horizon, call draw stars
      if(sunAltitude<-6)
      {
        drawStars(currentDate, latitude, longitude, sunAltitude,sunAzimuth);
      }

      drawMoon(currentDate,latitude, longitude);
    }
