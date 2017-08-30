SMSA.viewCanvas = {
	c1:                document.getElementById("skyCanvas"), //get canvas
	c2:                document.getElementById("graphCanvas"),
	c3:                document.getElementById("sunPointsCanvas"),
	c4:                document.getElementById("sunMoonStarCanvas"),
	skyCtx:            null, //layer 1(backmost) for background sky color
	graphCtx:          null, //layer 2 for grid lines
	sunPointsCtx:      null, //layer 3 for sun hour points and text
	sunMoonStarCtx:    null, //layer 4(topmost) for the sun, moon, and stars
	
	textColor:         "white",         //text color for grid and direction labels,
	crosshairColor:    null,
	currentSkyColorType:"undefined",    //either 'night','astronomical','nautical','civil', or 'day'

	//set the canvas contexts and draw the lines and degree labels on the
	//graph canvas
	initializeCanvases: function()
	{
		//set contexts
		this.skyCtx=this.c1.getContext("2d");
		this.graphCtx = this.c2.getContext("2d");
		this.sunPointsCtx = this.c3.getContext("2d");
		this.sunMoonStarCtx = this.c4.getContext("2d");
		
		//size canvases to fit parent div
		var w=document.getElementById("rightPane").offsetWidth-30;
		this.c1.width=w;
		this.c1.height=w/2;
		this.c2.width=w;
		this.c2.height=w/2;
		this.c3.width=w;
		this.c3.height=w/2;
		this.c4.width=w;
		this.c4.height=w/2;
		document.getElementById("canvasesdiv").style.width=w+"px";
		document.getElementById("canvasesdiv").style.height=(w/2)+"px";
		
		
		//event listeners
		this.c4.addEventListener("mousedown",SMSA.events.handleMouseDown);
		this.c4.addEventListener("mousemove",SMSA.events.handleMouseMove);
		this.c4.addEventListener("mouseleave",SMSA.events.handleMouseLeave);
		window.addEventListener("resize", SMSA.events.handleResize);          //TODO remove from artist class?

		this.initializeGraph();
	},
	
	initializeGraph()
	{
		//draw 10-80 degree altitude lines, in 10 degree increments
		for(var count=10; count<=80; count=count+10)
		{
			this.graphCtx.beginPath();
			this.graphCtx.moveTo(0,this.yCoord(count));
			this.graphCtx.lineTo(this.xCoord(360),this.yCoord(count));
			this.graphCtx.strokeStyle = '#555555';
			this.graphCtx.stroke();
			this.graphCtx.closePath();
		}
	
		//draw 180 degree azimuth line
		this.graphCtx.beginPath();
		this.graphCtx.moveTo(this.xCoord(180),this.yCoord(0));
		this.graphCtx.lineTo(this.xCoord(180),this.yCoord(90));
		this.graphCtx.strokeStyle = '#800000';
		this.graphCtx.stroke();
		this.graphCtx.closePath();
	
		//draw 90 and 270 degree azimuth line
		for(var i=90; i<=270; i+=180)
		{
			this.graphCtx.beginPath();
			this.graphCtx.moveTo(this.xCoord(i),this.yCoord(0));
			this.graphCtx.lineTo(this.xCoord(i),this.yCoord(90));
			this.graphCtx.strokeStyle = '#555555';
			this.graphCtx.stroke();
			this.graphCtx.closePath();
		}
	
		//draw -6 to 0 degree altitude twilight box
		this.graphCtx.beginPath();
		this.graphCtx.fillStyle ='#0099cc';
		this.graphCtx.fillRect(this.xCoord(0),this.yCoord(-6),this.xCoord(360),-6*this.c1.height/120);
		this.graphCtx.closePath();
	
		//draw -12 to -6 degree altitude twilight box
		this.graphCtx.beginPath();
		this.graphCtx.fillStyle ='#003366';
		this.graphCtx.fillRect(this.xCoord(0),this.yCoord(-12),this.xCoord(360),-6*this.c1.height/120);
		this.graphCtx.closePath();
	
		//draw -18 to -12 degree altitude twilight box
		this.graphCtx.beginPath();
		this.graphCtx.fillStyle ='#0e2f44';
		this.graphCtx.fillRect(this.xCoord(0),this.yCoord(-18),this.xCoord(360),-6*this.c1.height/120);
		this.graphCtx.closePath();
	
		//draw -30 to -18 degree altitude night box
		this.graphCtx.beginPath();
		this.graphCtx.fillStyle ='#222222';
		this.graphCtx.fillRect(this.xCoord(0),this.yCoord(-30),this.xCoord(360),-12*this.c1.height/120);
		this.graphCtx.closePath();
	
		//draw 0 altitude degree line
		this.graphCtx.beginPath();
		this.graphCtx.moveTo(0,this.yCoord(0));
		this.graphCtx.lineTo(this.xCoord(360),this.yCoord(0));
		this.graphCtx.strokeStyle = '#800000';
		this.graphCtx.stroke();
		this.graphCtx.closePath();

		//draw -18 to -6 degree altitude lines, in 6 degree increments
		for(var count=-18; count<=-6; count=count+6)
		{
			this.graphCtx.beginPath();
			this.graphCtx.moveTo(0,this.yCoord(count));
			this.graphCtx.lineTo(this.xCoord(360),this.yCoord(count));
			this.graphCtx.strokeStyle = '#800000';
			this.graphCtx.stroke();
			this.graphCtx.closePath();
		}
	
		//draw border
		this.graphCtx.beginPath();
		this.graphCtx.strokeStyle = '#800000';
		this.graphCtx.strokeRect(0, 0, this.c1.width, this.c1.height);
		this.graphCtx.closePath();
	},
	
	drawCanvas: function()
	{
		//grab the location and date
		var latitude=SMSA.model.currentLocation.latitude;
		var longitude=SMSA.model.currentLocation.longitude;

		//clone current date moment into JS date time
		var currentTimeAndDate=SMSA.model.currentDate.clone().toDate();

		//Calculate Current sun position
		var currentSunPos=SunCalc.getPosition(/*Date*/ currentTimeAndDate, /*Number*/ latitude, /*Number*/ longitude);
		var sunAltitude=currentSunPos.altitude*180/Math.PI;
		var sunAzimuth=currentSunPos.azimuth*180/Math.PI+180;

		//initialize color and gradient vars
		this.skyCtx.beginPath();
		var color1="";
		var color2="";
		var skyColorType;
		var grad=this.skyCtx.createLinearGradient(this.xCoord(0),this.yCoord(90),this.xCoord(0),this.yCoord(0));

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
		this.skyCtx.fillStyle = grad;

		//necessary to prevent redundancy of redrawing of skies with same sky colors
		if(skyColorType!=this.currentSkyColorType)
		{
			//clear skyCanvas
			this.skyCtx.clearRect(0,0, this.c1.width, this.c1.height);

			this.currentSkyColorType=skyColorType;

			//change text color and draw the sky.
			this.textColor=(skyColorType=="day" ? "black" : "white");
			this.crosshairColor=(skyColorType=="day" ? "#006400" : '#39FF14')
			this.skyCtx.fillRect(this.xCoord(0),this.yCoord(0),this.xCoord(360),-90*this.c1.height/120);
			this.skyCtx.closePath();
			
			this.plotSunPoints();
		}

		//clear sunMoonStarCanvas
		this.sunMoonStarCtx.clearRect(0,0, this.c1.width, this.c1.height);
		
		//check if the sun points need to be redrawn again
		//if the date has changed, the timezone has changed,
		//or the location has changed
		if(!SMSA.model.currentDate.isSame(SMSA.model.oldDate, "date")||SMSA.model.currentDate.utcOffset()!=SMSA.model.oldDate.utcOffset()
			||(!SMSA.model.currentLocation.isSame(SMSA.model.oldLocation)&&SMSA.model.isLocationUpdated==false))
		{
			//calculate a new declination
			SMSA.model.currentDeclination=SunCalc.getPosition(/*Date*/ currentTimeAndDate, 90, 0).altitude*180/Math.PI;
			
			//plot 24 points for each hour
			this.plotSunPoints();
			SMSA.model.isLocationUpdated=true;

			//calculate sunrise, sunset, and day length
			var sunTimes=SunCalc.getTimes(/*Date*/ currentTimeAndDate, /*Number*/ latitude, /*Number*/ longitude);
			var sunrise=moment(sunTimes.sunrise).utcOffset(SMSA.model.currentLocation.timezone+SMSA.model.tzAdjustment,false);
			var sunset=moment(sunTimes.sunset).utcOffset(SMSA.model.currentLocation.timezone+SMSA.model.tzAdjustment,false);
			var dayLength=sunset.diff(sunrise, 'minutes');
			var sunriseStr;
			var sunsetStr;

			//correctly format times
			if(SMSA.viewUI.getClockType()=="12")
			{
				sunriseStr=sunrise.format("h:mm a");
				sunsetStr=sunset.format("h:mm a");
			}
			else
			{
				sunriseStr=sunrise.format("H:mm");
				sunsetStr=sunset.format("H:mm");
			}
			
			var minute=Math.round(dayLength%60.0);
			var dayLengthStr=Math.floor(dayLength/60.0)+":"+ ((minute>9)? minute : ("0"+minute))+" hours";
			
			//output
			var sunTimesString="<h3>Times</h3><br>Sunrise: "+sunriseStr+"<br> Sunset: "+sunsetStr+"<br> Day Length: "+dayLengthStr;
			document.getElementById("infoPanel").innerHTML=sunTimesString;
		}

		//adjust azimuth for southern hemisphere and, if needed, the lower northern hemisphere
		if(latitude<SMSA.model.currentDeclination)
		{
			sunAzimuth=(sunAzimuth+180)%360;
		}

		//get sun color
		var sunColor=this.gradientFunction(sunAltitude);

		//draw sun
		this.sunMoonStarCtx.beginPath();
		this.sunMoonStarCtx.arc(this.xCoord(sunAzimuth),this.yCoord(sunAltitude),10,0,2*Math.PI);
		this.sunMoonStarCtx.strokeStyle = '#990000';
		this.sunMoonStarCtx.stroke();
		this.sunMoonStarCtx.fillStyle = sunColor;
		this.sunMoonStarCtx.fill();
		this.sunMoonStarCtx.closePath();

		//if the sun altitude is below 6 degrees of horizon, call draw stars
		if(sunAltitude<-6)
		{
			this.drawStars();
		}

		this.drawMoon();
	  
		//draw crosshair
		this.sunMoonStarCtx.strokeStyle = this.crosshairColor;
		this.sunMoonStarCtx.beginPath();
		this.sunMoonStarCtx.moveTo(SMSA.model.crosshairPos.x-5,SMSA.model.crosshairPos.y);
		this.sunMoonStarCtx.lineTo(SMSA.model.crosshairPos.x+5,SMSA.model.crosshairPos.y);
		this.sunMoonStarCtx.stroke();
		this.sunMoonStarCtx.closePath();
		this.sunMoonStarCtx.beginPath();
		this.sunMoonStarCtx.moveTo(SMSA.model.crosshairPos.x,SMSA.model.crosshairPos.y-5);
		this.sunMoonStarCtx.lineTo(SMSA.model.crosshairPos.x,SMSA.model.crosshairPos.y+5);
		this.sunMoonStarCtx.stroke();
		this.sunMoonStarCtx.closePath();
		
		if(mapReady)
		{
			drawSun(nite.calculatePositionOfSun(currentTimeAndDate));
		}
		
		SMSA.viewUI.sunAltitudeOut.innerHTML=sunAltitude.toFixed(3);
		SMSA.viewUI.sunAzimuthOut.innerHTML=sunAzimuth.toFixed(3);
	},
	
	/*
	Calculate a sun color in hex given an altitude and return it.
	*/
	gradientFunction: function(sunAltitude)
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
	},
	
	/*
	This function calculates and plots red dots/circles for every hour (0-23)
	indicating where the sun is at the beginning of each hour HH:00
	*/
	plotSunPoints: function()
	{
		//A moment counter that will be incremented every hour
		var momentCounter=moment(SMSA.model.currentDate.clone().format("MM/DD/YYYY"),"MM/DD/YYYY").utcOffset(SMSA.model.currentLocation.timezone+SMSA.model.tzAdjustment);
		var latitude=SMSA.model.currentLocation.latitude;
		var longitude=SMSA.model.currentLocation.longitude;


		//JS Date object required for SunCalc library
		var timeAndDate;
	
		//Used to store Altitude and Azimuth of the sun at the beginning of an hour
		var sunHourAltitude, sunHourAzimuth;

		this.sunPointsCtx.clearRect(0,0, this.c1.width, this.c1.height);
	
		//Loop through every hour
		for(count=0;count<=23; count++)
		{
			//Convert moment object to JS Date
			timeAndDate=momentCounter.clone().toDate();

			//Calculate altitude and azimuth
			var sunPos=SunCalc.getPosition(/*Date*/ timeAndDate, /*Number*/ latitude, /*Number*/ longitude);
			sunHourAltitude=sunPos.altitude*180/Math.PI;
			sunHourAzimuth=sunPos.azimuth*180/Math.PI+180;

			//adjust azimuth for southern hemisphere and, if needed, the lower northern hemisphere
			if(latitude<SMSA.model.currentDeclination)
			{
				sunHourAzimuth=(sunHourAzimuth+180)%360;
			}

			//draw the red circle/dots
			this.sunPointsCtx.beginPath();
			this.sunPointsCtx.arc(this.xCoord(sunHourAzimuth),this.yCoord(sunHourAltitude),3,0,2*Math.PI);
			this.sunPointsCtx.strokeStyle = '#990000';
			this.sunPointsCtx.stroke();
			this.sunPointsCtx.closePath();

			//determine the hour label format to be printed next to each point
			var hourString;
			if(SMSA.viewUI.getClockType()=="12")
			{
				hourString=momentCounter.clone().format("ha");
			}
			else 
			{
				hourString=momentCounter.clone().format("H");
			}



			//draw sun point hour text label
			this.sunPointsCtx.fillStyle = this.textColor;
			this.sunPointsCtx.font = "10px Arial";
			this.sunPointsCtx.fillText(hourString,Math.round(this.xCoord(sunHourAzimuth+1)),Math.round(this.yCoord(sunHourAltitude+1)));

			//increment the moment object by an hour
			momentCounter.add(1,'h');
		}

		//draw directionLabels
		var directionsLabels;
		if(latitude>SMSA.model.currentDeclination)
		{
			directionsLabels=["North","East","South","West"];
		}
		else 
		{
			directionsLabels=["South","West","North","East"];
		}
		this.sunPointsCtx.fillStyle=this.textColor;
		this.sunPointsCtx.font = "14px Arial";
		this.sunPointsCtx.fillText(directionsLabels[0],3,this.yCoord(90-5));
		this.sunPointsCtx.fillText(directionsLabels[1],this.c1.width*.25+3,this.yCoord(90-5));
		this.sunPointsCtx.fillText(directionsLabels[2],this.c1.width*.5+3,this.yCoord(90-5));
		this.sunPointsCtx.fillText(directionsLabels[3],this.c1.width*.75+3,this.yCoord(90-5));
	  
	  
	  
		//draw degree labels
		for(var count=10; count<=90; count=count+10)
		{
			this.sunPointsCtx.font = "10px Arial";
			this.sunPointsCtx.fillText(count+" deg",this.c1.width*.95,this.yCoord(count-2));
		}
	},
	
	

	/*
	This function will draw the moon with a given moment,
	a latitude and longitude.
	*/
	drawMoon: function()
	{
		var latitude=SMSA.model.currentLocation.latitude;
		var longitude=SMSA.model.currentLocation.longitude;
		
		//convert moment to JS date
		var timeAndDate=SMSA.model.currentDate.clone().toDate();

		//calculate moon alitude and azimuth
		var moonPos=SunCalc.getMoonPosition(/*Date*/ timeAndDate, /*Number*/ latitude, /*Number*/ longitude);
		var moonIllumination=SunCalc.getMoonIllumination(timeAndDate, latitude, longitude);
		var moonAltitude=moonPos.altitude*180/Math.PI;
		var moonAzimuth=moonPos.azimuth*180/Math.PI+180;

		//adjust azimuth for southern hemisphere and, if needed, the lower northern hemisphere
		if(latitude<SMSA.model.currentDeclination)
		{
			moonAzimuth=(moonAzimuth+180)%360;
		}

		//draw moon on canvas
		/*
		this.sunMoonStarCtx.beginPath();
		this.sunMoonStarCtx.arc(this.xCoord(moonAzimuth),this.yCoord(moonAltitude),8,0,2*Math.PI);
		this.sunMoonStarCtx.strokeStyle = '#990000';
		this.sunMoonStarCtx.stroke();
		this.sunMoonStarCtx.fillStyle = '#ffffff';
		this.sunMoonStarCtx.fill();
		this.sunMoonStarCtx.closePath();
		*/
	  
		//console.log(moonPos.parallacticAngle*180/Math.PI+", "+moonIllumination.angle*180/Math.PI);
		this.sunMoonStarCtx.save();
		this.sunMoonStarCtx.translate(this.xCoord(moonAzimuth),this.yCoord(moonAltitude));
		//console.log("parallacticAngle: "+moonPos.parallacticAngle*180/Math.PI+", moonIllumination.angle: "+moonIllumination.angle*180/Math.PI);
		this.sunMoonStarCtx.rotate(moonPos.parallacticAngle-(Math.PI/4-moonIllumination.angle));
		this.sunMoonStarCtx.translate(-14,-14);
		this.sunMoonStarCtx.drawImage(document.getElementById("moonIMG"),0,0,28,28);
		
		var imgData=this.skyCtx.getImageData(this.xCoord(moonAzimuth),this.yCoord(moonAltitude),1,1);
	  
		this.sunMoonStarCtx.beginPath();
		this.sunMoonStarCtx.arc(14,14,12,0,2*Math.PI);
		this.sunMoonStarCtx.fillStyle = "rgba("+imgData.data[0]+","+imgData.data[1]+","+imgData.data[2]+",0.55)";
		this.sunMoonStarCtx.fill();
		this.sunMoonStarCtx.closePath();
	  
		this.sunMoonStarCtx.restore();
		
		SMSA.viewUI.moonAltitudeOut.innerHTML=moonAltitude.toFixed(3);
		SMSA.viewUI.moonAzimuthOut.innerHTML=moonAzimuth.toFixed(3);
	},
	
	//TODO 2) make stars vary with longitude
	drawStars: function()
	{
		var latitude=SMSA.model.currentLocation.latitude;
		var longitude=SMSA.model.currentLocation.longitude;
		
		//convert moment to JS date
		var timeAndDate=SMSA.model.currentDate.clone().toDate();

		//calculate star altitude and azimuth for every RNG based declination
		//and hour displacement in arrays.
		for(var i=0; i<SMSA.model.starDeclination.length;i++)
		{
			var hour=(timeAndDate.getHours()+timeAndDate.getMinutes()/60+SMSA.model.hourDisplacement[i])%24;
			starAltitude=180/Math.PI*Math.asin(cos(latitude)*cos(hour*15)*cos(SMSA.model.starDeclination[i])+sin(latitude)*sin(SMSA.model.starDeclination[i]));
			starAzimuth=180/Math.PI*Math.acos((sin(starAltitude)*sin(latitude)-sin(SMSA.model.starDeclination[i]))/(cos(starAltitude)*cos(latitude)));

			//star azimuth adjustment
			if((hour*15)>180)
			{
				starAzimuth=360-starAzimuth;
			}
			starAzimuth=(starAzimuth+180)%360;

			//adjust azimuth for southern hemisphere and, if needed, the lower northern hemisphere
			if(latitude<SMSA.model.currentDeclination)
			{
				starAzimuth=(starAzimuth+180)%360;
			}

			//only draw stars with altitude above 0 degrees(above horizon)
			if(starAltitude>0)
			{
				this.sunMoonStarCtx.beginPath();
				this.sunMoonStarCtx.arc(this.xCoord(starAzimuth),this.yCoord(starAltitude),1,0,2*Math.PI);
				this.sunMoonStarCtx.fillStyle = 'white';
				this.sunMoonStarCtx.fill();
				this.sunMoonStarCtx.closePath();
			}
		}
	},
	
	resize: function(w)
	{
		this.c1.width=w;
		this.c1.height=w/2;
		this.c2.width=w;
		this.c2.height=w/2;
		this.c3.width=w;
		this.c3.height=w/2;
		this.c4.width=w;
		this.c4.height=w/2;
		
		document.getElementById("canvasesdiv").style.width=w+"px";
		document.getElementById("canvasesdiv").style.height=(w/2)+"px";
		
		this.currentSkyColorType=-1;
		this.initializeGraph();
		this.drawCanvas();
	},
	
	//convert the azimuth angle (0 to 360 degrees east of north) to
	//an x-coordinate on the canvas
	xCoord: function(coord)
	{
		return coord/360*this.c1.width;
	},
	
	//convert altitude angle(-30 to +90) to pixel y-coordinate on the canvas
	yCoord: function(coord)
	{
		return -this.c1.height*.75/90*coord+.75*this.c1.height;
	},
};