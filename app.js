var SMSA = {

	c1:                document.getElementById("skyCanvas"), //get canvas
	c2:                document.getElementById("graphCanvas"),
	c3:                document.getElementById("sunPointsCanvas"),
	c4:                document.getElementById("sunMoonStarCanvas"),
	skyCtx:            null, //layer 1(backmost) for background sky color
	graphCtx:          null, //layer 2 for grid lines
	sunPointsCtx:      null, //layer 3 for sun hour points and text
	sunMoonStarCtx:    null, //layer 4(topmost) for the sun, moon, and stars
	
	//grab drop down menus, buttons, inputs
	monthDropdown:     document.getElementById("month"),
	dayDropdown:       document.getElementById("day"),
	yearDropdown:      document.getElementById("year"),
	hourDropdown:      document.getElementById("hour"),
	minDropdown:       document.getElementById("min"),
	ampmDropdown:      document.getElementById("ampm"),
	locationDropdown:  document.getElementById("locationName"),
	latDegDropdown:    document.getElementById("latDeg"),
	latMinDropdown:    document.getElementById("latMin"),
	lonDegDropdown:    document.getElementById("lonDeg"),
	lonMinDropdown:    document.getElementById("lonMin"),
	vHemiDropdown:     document.getElementById("vHemi"),
	hHemiDropdown:     document.getElementById("hHemi"),
	tzDropdown:        document.getElementById("timezone"),
	currentButton:     document.getElementById("currentButton"),
	playStartCheckbox: document.getElementById("playStart"),
	frameRateInput:    document.getElementById("frameRate"),
	playButton:        document.getElementById("playbutton"),
	mouseCoordPane:    document.getElementById("mouseCoordinates"),
	
	
	starDeclination:   [89,0], //initilize array to store RNG'ed star declination position
	hourDisplacement:  [6,2],  //initilize array to store RNG'ed star hour positions
	
	crosshairPos:      {x:0, y:0},  //position of crosshair
	
	oldDate:           moment("0000", "YYYY"),  //the previous date before a date is changed
	currentDate:       moment("0000", "YYYY"),  //the date after a date is changed
	tzAdjustment:      0,         //offset used account for DST  
	
	oldLocation:       null,            //the previous location before it is changed
	currentLocation:   new Location(),  //the location after it is changed
	isLocationUpdated: "undefined",
	
	textColor:         "white",         //text color for grid and direction labels,
	crosshairColor:    null,
	currentSkyColorType:"undefined",    //either 'night','astronomical','nautical','civil', or 'day'
	currentDeclination: "undefined",    //declination of the sun
	
	fps:               "30",   //frames per second
	playSpeed:         3600,   //seconds of day passed(in animation) for each real life second
	interval:          "undefined",
	
	
	
    //set the start location to new york city, NY
	tempStartLocation: function()
	{
		var newYork=new Location("New York City",40,43,"n",74,0,"w", -5, true);
		this.updateLocation(newYork);
		this.setLocation(newYork);
		this.now();
		this.now();   //TODO figure out why this needs to be called twice 
	},
	
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
		this.c4.addEventListener("mousedown",this.handleMouseDown);
		this.c4.addEventListener("mousemove",this.handleMouseMove);
		this.c4.addEventListener("mouseleave",this.handleMouseLeave);
		window.addEventListener("resize", this.handleResize);

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
	
	convertCoords: function(canvas, x,y)
	{
		var bbox = canvas.getBoundingClientRect();
		return { x: x - bbox.left * (canvas.width  / bbox.width),
		y: y - bbox.top  * (canvas.height / bbox.height)
		};
	},
	
	handleMouseDown: function(event)
	{
		//console.log(event.clientX+","+event.clientY);
		SMSA.crosshairPos=SMSA.convertCoords(SMSA.c1,event.clientX,event.clientY);
		//console.log(SMSA.crosshairPos.x+","+SMSA.crosshairPos.y);
		SMSA.drawCanvas();
	},
	
	handleMouseMove: function(event)
	{
		var mousePosPixels=SMSA.convertCoords(SMSA.c1,event.clientX,event.clientY);
		var azimuth=SMSA.azimuth(mousePosPixels.x);
		var altitude=SMSA.altitude(mousePosPixels.y);
		
		//adjust azimuth for southern hemisphere and, if needed, the lower northern hemisphere
		if(SMSA.currentLocation.latitude<SMSA.currentDeclination)
		{
			azimuth=(azimuth+180)%360;
		};
		
		SMSA.mouseCoordPane.innerHTML="<h3>Mouse Coordinates</h3><br>Azimuth: "+azimuth+"° E of N";
		
		if(azimuth>=40&&azimuth<=50)
		{
			SMSA.mouseCoordPane.innerHTML+="(Due Northeast)";
		}
		else if(azimuth>=85&&azimuth<=95)
		{
			SMSA.mouseCoordPane.innerHTML+="(Due East)";
		}
		else if(azimuth>=130&&azimuth<=140)
		{
			SMSA.mouseCoordPane.innerHTML+="(Due Southeast)";
		}
		else if(azimuth>=175&&azimuth<=185)
		{
			SMSA.mouseCoordPane.innerHTML+="(Due South)";
		}
		else if(azimuth>=220&&azimuth<=230)
		{
			SMSA.mouseCoordPane.innerHTML+="(Due Southwest)";
		}
		else if(azimuth>=265&&azimuth<=275)
		{
			SMSA.mouseCoordPane.innerHTML+="(Due West)";
		}
		else if(azimuth>=310&&azimuth<=320)
		{
			SMSA.mouseCoordPane.innerHTML+="(Due Northwest)";
		}
		else if(azimuth>=355||azimuth<=5)
		{
			SMSA.mouseCoordPane.innerHTML+="(Due North)";
		}
		SMSA.mouseCoordPane.innerHTML+="<br>Altitude:   ";
		SMSA.mouseCoordPane.innerHTML+=altitude+"° above horizon";
	},
	
	handleMouseLeave: function(event)
	{
		SMSA.mouseCoordPane.innerHTML="<h3>Mouse Coordinates</h3><br>Azimuth: N/A<br>Altitude: N/A";
	},
	
	handleResize: function(event)
	{
		SMSA.resize(document.getElementById("rightPane").offsetWidth-30);
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
	
	
	azimuth: function(coord)
	{
		return Math.round(coord*360/this.c1.width);
	},
	
	altitude: function(coord)
	{
		return Math.round((this.c1.height*.75-coord)/this.c1.height*120);
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
	Get the selected location on the screen and return a location object
	*/
	getLocation: function()
	{
		var name="custom";
		var latDeg=parseInt(this.latDegDropdown.value);
		var latMin=parseInt(this.latMinDropdown.value);
		var lonDeg=parseInt(this.lonDegDropdown.value);
		var lonMin=parseInt(this.lonMinDropdown.value);
		var vHemi=this.vHemiDropdown.value;
		var hHemi=this.hHemiDropdown.value;
		var timezone=parseInt(this.tzDropdown.value);

		var observeDST=this.currentLocation.observeDST;

		var location=new Location(name,latDeg, latMin,vHemi,lonDeg,lonMin,hHemi,timezone,observeDST);
		return location;
	},
	
	/*
	Set the current location to a location
	*/
	setLocation: function(location)
	{
		this.oldLocation=this.currentLocation;
		this.currentLocation=location;
		this.isLocationUpdated=false;
	},
	
	/*
	Set the location on the input screen to a location object
	*/
	updateLocation: function(location)
	{
		this.locationDropdown.value=location.name;
		this.latDegDropdown.value=location.latitudeDegrees;
		this.latMinDropdown.value=location.latitudeMinutes;
		this.vHemiDropdown.value=location.hemisphereNS;
		this.lonDegDropdown.value=location.longitudeDegrees;
		this.lonMinDropdown.value=location.longitudeMinutes;
		this.hHemiDropdown.value=location.hemisphereEW;
		this.tzDropdown.value=location.timezone;
	},

	/*
	Called when user chooses a city from the drop-down
	Find the selected city in the locationDB vector and update the input pane
	with that city's data
	*/
	changeLocationName: function()
	{
		//check if location selection is at index 0
		//if not a 0, then a city other than "custom" was picked
		if(this.locationDropdown.selectedIndex!=0)
		{
			//store city name
			var name=this.locationDropdown.value;
		  
			//search for name in database
			for(var i=0; i<locationDB.locationVec.length;i++)
			{
				//if city was found...
				if(locationDB.locationVec[i].name==name)
				{
					//store old date
					this.oldDate=this.getDate();  
					
					//update location on UI and set location object
					this.updateLocation(locationDB.locationVec[i]);  
					this.setLocation(locationDB.locationVec[i]);
							  
					//convert date/time at old location to date/time at new location
					//update date on UI and set date object
					this.updateDate(this.calculateDate(this.oldDate));
					this.setDate(this.getDate());
					
					i=locationDB.locationVec.length; //break loop
				}
			}
			
			changeLocationOnMap(
			{lat:((this.currentLocation.hemisphereNS=="n")? 1:-1) * (this.currentLocation.latitudeDegrees+this.currentLocation.latitudeMinutes/60),
				lng:((this.currentLocation.hemisphereEW=="e")? 1:-1) * (this.currentLocation.longitudeDegrees+this.currentLocation.longitudeMinutes/60)}
				,map);
			this.drawCanvas();
		}
    },
	
	/*
	Called when user changes the location attributes on the input screen
	*/
	changeLocation: function()
	{
		this.locationDropdown.value="custom";
		this.setLocation(this.getLocation());
	
		changeLocationOnMap(
		{lat:((this.currentLocation.hemisphereNS=="n")? 1:-1) * (this.currentLocation.latitudeDegrees+this.currentLocation.latitudeMinutes/60),
			lng:((this.currentLocation.hemisphereEW=="e")? 1:-1) * (this.currentLocation.longitudeDegrees+this.currentLocation.longitudeMinutes/60)}
			,map);
		this.drawCanvas();
	},

	/*
	Get the selected date on the input screen and return it as a moment
	*/
	getDate: function()
	{
		var day=this.dayDropdown.value;
		var month=this.monthDropdown.value;
		var year=this.yearDropdown.value;
		var hour=this.hourDropdown.value;
		var min=this.minDropdown.value;
		var ampm=this.ampmDropdown.value;
	
		var date;
		if(this.checkClockType()=="12")
		{
			date=moment(month+"/"+day+"/"+year+" "+hour+":"+min+" "+ampm,"M/D/YYYY h:mm a");
		}
		else
		{
			date=moment(month+"/"+day+"/"+year+" "+hour+":"+min,"M/D/YYYY H:m");
		}

		date.utcOffset(parseInt(this.currentLocation.timezone+this.tzAdjustment), true);
		
		return date;
	},

	/*
	Set the current date to a date
	*/
	setDate: function(date)
	{
		this.oldDate=this.currentDate;
		this.currentDate=date;
	
		if(!this.currentDate.isValid()||this.oldDate.month()!=this.currentDate.month())
		{
			this.handleMonthChange();
		}
	
		if(mapReady)
		{
			//nite.init(map);
			nite.setDate(this.currentDate.clone().toDate());
			nite.refresh();
		}
	},
	
	
	/*
	Set the date selected on the input screen to a moment
	*/
	updateDate: function(date)
	{
		this.dayDropdown.value=date.date();
		this.monthDropdown.value=date.month()+1;
		this.yearDropdown.value=date.year();
		this.minDropdown.value=date.minute();
		
		
		if(this.checkClockType()=="12")
		{
			this.hourDropdown.value=date.clone().format("h");
			this.ampmDropdown.value=date.clone().format("a").charAt(0);
		}
		else {
			this.hourDropdown.value=date.hour();
		}
    },
	
	//TODO why use paramters when we can use this.oldDate?
	/*
	Calculate old date and timezone to currentTimezone
	*/
	calculateDate: function(date)
	{
		this.calculateTzAdjustment();
		var newDate=date.clone().utcOffset(this.currentLocation.timezone+this.tzAdjustment);
		return newDate;
	},
	
	/*
	Calculate and set the timezone using the current location
	*/
	calculateTzAdjustment: function()
	{
		//if location observes DST, add 1
		if(moment(this.currentDate.clone().format("MM/DD/YYYY"),"MM/DD/YYYY").isDST()
			&&this.currentLocation.observeDST)
		{
			this.tzAdjustment=1;
			
			//updateTzAdjustment
			document.getElementById("tzAdjustment").innerHTML="1";
		}
		else
		{
			this.tzAdjustment=0;
			
			//updateTzAdjustment
			document.getElementById("tzAdjustment").innerHTML="0";
		}
	},
	
	/*
	Called when user changes the date on the input screen
	*/
	changeDate: function()
	{
		this.setDate(this.getDate());
		this.calculateTzAdjustment();
		this.drawCanvas();
	},
	
	/*
	This function will enable or disable the am/pm drop-down selection
	if the user changes the clock type to or from 12 to 24 hour.
	This function will convert the time drop-down boxes to 12hr or 24hr format
	if the user changes the clock type to or from 12 to 24 hour.
	*/
	updateClockType: function()
	{
		//grab the selected hour on page
		var hour=this.hourDropdown.value;
	
		//check which clock type is selected(12 or 24)
		if(this.checkClockType()=="12")
		{
			//if clock type is 12 enable the am/pm selection box
			this.ampmDropdown.disabled=false;

			//delete options from hour selection box
			for(var i=this.hourDropdown.length; i>=0; i--)
			{
				this.hourDropdown.remove(i);
			}

			//create 12am/12pm option and add to hour selection
			var option = document.createElement("option");
			option.value="12";
			option.text="12";
			this.hourDropdown.add(option);

			//create 1-11am/pm options and add to hour selection
			for(var i=1; i<=11; i++)
			{
				option = document.createElement("option");
				option.value=i;
				option.text=i;
				this.hourDropdown.add(option);
			}
			
			//create a moment using the selected hour and convert to 12 hour format
			var hourMoment=moment(hour,"HH");
			this.hourDropdown.value=parseInt(hourMoment.clone().format("hh"));
			this.ampmDropdown.value=hourMoment.format("a").charAt(0);
		}
		else
		{
			//if clock type is 24 disable the am/pm selection box
			this.ampmDropdown.disabled=true;

			//delete options from hour selection box
			for(var i=this.hourDropdown.length; i>=0; i--)
			{
				this.hourDropdown.remove(i);
			}

			//create 0-23 hour options and add to hour selection
			var option;
			for(var i=0; i<=23; i++)
			{
				option = document.createElement("option");
				option.value=i;
				option.text =i;
				this.hourDropdown.add(option);
			}
			
			//create a moment from the selected hour and selected am/pm
			//and convert to 24 hour format.
			var hourMoment=moment(hour+" "+this.ampmDropdown.value,"hh a");
			this.hourDropdown.value=parseInt(hourMoment.clone().format("HH"));
		}
		
		this.plotSunPoints();
	},



	//This function will determine which radio button for clock
	//type (12 or 24) is checked and return
	checkClockType: function()
	{
		if(document.getElementById("clockType12").checked)
		{
			return "12";
		}
		else
		{
			return "24";
		}
	},



	/*
	This function will update the day selection options (0-31) if the user
	changes the month selection.
	*/
	handleMonthChange: function()
	{
		var day=this.dayDropdown.value;
		var daysInMonth=moment(this.monthDropdown.value,"M").daysInMonth();
		
		//delete options from day selection box
		for(var i=this.dayDropdown.length; i>=0; i--)
		{
			this.dayDropdown.remove(i);
		}

		//create 0-daysInMonth options in day selection drop-down
		//each option represents a date in a month
		var option;
		for(var i=1; i<=daysInMonth; i++)
		{
			option = document.createElement("option");
			option.value =i;
			option.text =i;
			this.dayDropdown.add(option);
		}
		
		//if the date is greater than the number of days
		//in updated month then set the day to the highest date in month
		if(day>daysInMonth)
		{
			this.dayDropdown.value=daysInMonth;
		}
		else
		{
			this.dayDropdown.value=day;
		}
		
		if(!this.currentDate.isValid())
		{
			this.currentDate=this.getDate();
		}
    },

	/*
	Called when user changes the timezone on input screen
	Converts the time in old timezone to new timezone
	*/
	handleTimezoneChange: function()
	{
		this.oldDate=this.getDate();
		this.currentLocation.timezone=parseInt(this.tzDropdown.value);
		this.updateDate(this.calculateDate(this.oldDate));
		this.setDate(this.getDate());
		this.drawCanvas();
	},

	/*
	called when user changes frameRate on input pane
	*/
	handleFrameRateChange: function()
	{
		this.fps=this.frameRateInput.value;
	},

	/*
	called when user changes play speed on input pane
	*/
	handleSpeedChange: function()
	{
		this.playSpeed=document.getElementById("playSpeed").value*60;
	},


	/*
	This function will draw the moon with a given moment,
	a latitude and longitude.
	*/
	drawMoon: function()
    {
		var latitude=this.currentLocation.latitude;
		var longitude=this.currentLocation.longitude;
		
		//convert moment to JS date
		var timeAndDate=this.currentDate.clone().toDate();

		//calculate moon alitude and azimuth
		var moonPos=SunCalc.getMoonPosition(/*Date*/ timeAndDate, /*Number*/ latitude, /*Number*/ longitude);
		var moonIllumination=SunCalc.getMoonIllumination(timeAndDate, latitude, longitude);
		var moonAltitude=moonPos.altitude*180/Math.PI;
		var moonAzimuth=moonPos.azimuth*180/Math.PI+180;

		//adjust azimuth for southern hemisphere and, if needed, the lower northern hemisphere
		if(latitude<this.currentDeclination)
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
	},
	
	
	
	/*
	This function calculates and plots red dots/circles for every hour (0-23)
	indicating where the sun is at the beginning of each hour HH:00
	*/
	plotSunPoints: function()
	{
		//A moment counter that will be incremented every hour
		var momentCounter=moment(this.currentDate.clone().format("MM/DD/YYYY"),"MM/DD/YYYY").utcOffset(this.currentLocation.timezone+this.tzAdjustment);
		var latitude=this.currentLocation.latitude;
		var longitude=this.currentLocation.longitude;


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
			if(latitude<this.currentDeclination)
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
			if(this.checkClockType()=="12")
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
		if(latitude>this.currentDeclination)
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
	This function pushes random values of declination and hour displacements
	into the respective arrays for every star to be generated.
	*/
	initializeStarsArrays: function(numberOfStars)
	{
		//generate random declination and hour displacements
		Math.seed=6;
		for(var count=0; count<numberOfStars; count++)
		{
			this.starDeclination.push(Math.seededRandom()*180-90);
			this.hourDisplacement.push(Math.seededRandom()*24);
		}
	},



	//TODO 2) make stars vary with longitude
	drawStars: function()
	{
		var latitude=this.currentLocation.latitude;
		var longitude=this.currentLocation.longitude;
		
		//convert moment to JS date
		var timeAndDate=this.currentDate.clone().toDate();

		//calculate star altitude and azimuth for every RNG based declination
		//and hour displacement in arrays.
		for(var i=0; i<this.starDeclination.length;i++)
		{
			var hour=(timeAndDate.getHours()+timeAndDate.getMinutes()/60+this.hourDisplacement[i])%24;
			starAltitude=180/Math.PI*Math.asin(cos(latitude)*cos(hour*15)*cos(this.starDeclination[i])+sin(latitude)*sin(this.starDeclination[i]));
			starAzimuth=180/Math.PI*Math.acos((sin(starAltitude)*sin(latitude)-sin(this.starDeclination[i]))/(cos(starAltitude)*cos(latitude)));

			//star azimuth adjustment
			if((hour*15)>180)
			{
				starAzimuth=360-starAzimuth;
			}
			starAzimuth=(starAzimuth+180)%360;

			//adjust azimuth for southern hemisphere and, if needed, the lower northern hemisphere
			if(latitude<this.currentDeclination)
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

	
	/*
	This function sets the drop down box dates and time to the current time
	in the given UTC zone.
	*/
	now: function()
	{
		//initialize a default moment(uses current time) and offset
		var momentNow=moment().utcOffset(parseInt(this.currentLocation.timezone+this.tzAdjustment),false);

		this.updateDate(momentNow);
		this.setDate(momentNow);
		this.calculateTzAdjustment();
		this.drawCanvas();
	},

	playInitialize: function()
	{
		//if user clicks play button
		if(this.playButton.innerHTML=="Play")
		{
			//set play/stop button from "Play" to "Stop" and disable input selections
			this.playButton.innerHTML="Stop";
			this.locationDropdown.disabled=true;
			this.tzDropdown.disabled=true;
			this.dayDropdown.disabled=true;
			this.monthDropdown.disabled=true;
			this.yearDropdown.disabled=true;
			this.hourDropdown.disabled=true;
			this.minDropdown.disabled=true;
			this.ampmDropdown.disabled=true;
			this.currentButton.disabled=true;
			this.playStartCheckbox.disabled=true;
			this.frameRateInput.disabled=true;

			var momentCounter;

			//set the moment increment counter to the beginning of the day if
			//user checks the corresponding option, otherwise set to current time
			if(this.playStartCheckbox.checked)
			{
				momentCounter=moment(this.currentDate.clone().format("M/D/YYYY")+" 0","M/D/YYYY H").utcOffset(this.currentLocation.timezone+this.tzAdjustment,true);
			}
			else
			{
				momentCounter=moment(this.getDate());
			}

			var delay=1000/this.fps; //milisec
			
			//play animation
			this.interval=setInterval(this.play, delay, momentCounter);
		}
		else //else if user clicks stop button
		{
			//set play/stop button from "Stop" to "Play" and enable input selections
			this.playButton.innerHTML="Play";
			this.locationDropdown.disabled=false;
			this.tzDropdown.disabled=false;
			this.dayDropdown.disabled=false;
			this.monthDropdown.disabled=false;
			this.yearDropdown.disabled=false;
			this.hourDropdown.disabled=false;
			this.minDropdown.disabled=false;
			this.ampmDropdown.disabled=false;
			this.playStartCheckbox.disabled=false;
			this.frameRateInput.disabled=false;
			this.currentButton.disabled=false;
		}
	},

	play: function(momentCounter)
	{
		var playSecondInterval=SMSA.playSpeed/SMSA.fps;

		//if the user presses play button...
		if(SMSA.playButton.innerHTML=="Play")
		{
			//...stop the animaion
			clearInterval(SMSA.interval);
		}
		else
		{
			//otherwise update and set the date, draw canvas, and increment
			//the counter
			SMSA.updateDate(momentCounter);
			SMSA.setDate(SMSA.getDate());
			SMSA.drawCanvas();

			momentCounter.add(playSecondInterval,"s");
		}
	},

	drawCanvas: function()
	{
		//grab the location and date
		var latitude=this.currentLocation.latitude;
		var longitude=this.currentLocation.longitude;

		//clone current date moment into JS date time
		var currentTimeAndDate=this.currentDate.clone().toDate();

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
		if(!this.currentDate.isSame(this.oldDate, "date")||this.currentDate.utcOffset()!=this.oldDate.utcOffset()
			||(!this.currentLocation.isSame(this.oldLocation)&&this.isLocationUpdated==false))
		{
			//calculate a new declination
			this.currentDeclination=SunCalc.getPosition(/*Date*/ currentTimeAndDate, 90, 0).altitude*180/Math.PI;
			
			//plot 24 points for each hour
			this.plotSunPoints();
			this.isLocationUpdated=true;

			//calculate sunrise, sunset, and day length
			var sunTimes=SunCalc.getTimes(/*Date*/ currentTimeAndDate, /*Number*/ latitude, /*Number*/ longitude);
			var sunrise=moment(sunTimes.sunrise).utcOffset(this.currentLocation.timezone+this.tzAdjustment,false);
			var sunset=moment(sunTimes.sunset).utcOffset(this.currentLocation.timezone+this.tzAdjustment,false);
			var dayLength=sunset.diff(sunrise, 'minutes');
			var sunriseStr;
			var sunsetStr;

			//correctly format times
			if(this.checkClockType()=="12")
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
		if(latitude<this.currentDeclination)
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
		this.sunMoonStarCtx.moveTo(this.crosshairPos.x-5,this.crosshairPos.y);
		this.sunMoonStarCtx.lineTo(this.crosshairPos.x+5,this.crosshairPos.y);
		this.sunMoonStarCtx.stroke();
		this.sunMoonStarCtx.closePath();
		this.sunMoonStarCtx.beginPath();
		this.sunMoonStarCtx.moveTo(this.crosshairPos.x,this.crosshairPos.y-5);
		this.sunMoonStarCtx.lineTo(this.crosshairPos.x,this.crosshairPos.y+5);
		this.sunMoonStarCtx.stroke();
		this.sunMoonStarCtx.closePath();
		
		if(mapReady)
		{
			drawSun(nite.calculatePositionOfSun(currentTimeAndDate));
		}
	}
};


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
	Math.seededRandom=function(max,min)
	{
		max=max||1;
		min=min||0;

		Math.seed = (Math.seed * 9301 + 49297) % 233280;
		var rnd = Math.seed / 233280;
		return min + rnd * (max - min);
    }
