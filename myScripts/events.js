SMSA.events = {
	fps:               "30",   //frames per second
	playSpeed:         3600,   //seconds of day passed(in animation) for each real life second
	interval:          "undefined",
	
	
	
	/****************************ANIMATION PANE EVENTS************************/
	
	playInitialize: function()
	{
		//if user clicks play button
		if(SMSA.viewUI.playButton.innerHTML=="Play")
		{
			SMSA.viewUI.disableButtons();

			var momentCounter;

			//set the moment increment counter to the beginning of the day if
			//user checks the corresponding option, otherwise set to current time
			if(SMSA.viewUI.playStartCheckbox.checked)
			{
				momentCounter=moment(SMSA.model.currentDate.clone().format("M/D/YYYY")+" 0","M/D/YYYY H").utcOffset(SMSA.model.currentLocation.timezone+SMSA.model.tzAdjustment,true);
			}
			else
			{
				momentCounter=moment(SMSA.viewUI.getDate());
			}

			var delay=1000/this.fps; //milisec
			
			//play animation
			this.interval=setInterval(SMSA.events.play, delay, momentCounter);
		}
		else //else if user clicks stop button
		{
			SMSA.viewUI.enableButtons();
		}
	},
	
	play: function(momentCounter)
	{
		var playSecondInterval=SMSA.events.playSpeed/SMSA.events.fps;

		//if the user presses play button...
		if(SMSA.viewUI.playButton.innerHTML=="Play")
		{
			//...stop the animaion
			clearInterval(SMSA.events.interval);
		}
		else
		{
			//otherwise update and set the date, draw canvas, and increment
			//the counter
			SMSA.viewUI.updateDate(momentCounter);
			SMSA.model.setDate(momentCounter);
			SMSA.viewCanvas.drawCanvas();

			momentCounter.add(playSecondInterval,"s");
		}
	},
	
	
	/*
	called when user changes frameRate on input pane
	*/
	handleFrameRateChange: function()
	{
		this.fps=SMSA.frameRateInput.value;
	},
	
	
	/*
	called when user changes play speed on input pane
	*/
	handleSpeedChange: function()
	{
		var dropdown = document.getElementById("speedUnit");
		this.playSpeed=document.getElementById("playSpeed").value;
		
		if(dropdown.options[dropdown.selectedIndex].value=="m")
		{
			this.playSpeed*=60;
		}
	},

	/****************************END ANIMATION PANE EVENTS************************/
	
	
	
	
	
	
	
	/****************************LOCATION PANE EVENTS************************/
	/*
	Called when user chooses a city from the drop-down
	Find the selected city in the locationDB vector and update the input pane
	with that city's data
	*/
	changeLocationName: function()
	{
		//check if location selection is at index 0
		//if not a 0, then a city other than "custom" was picked
		if(SMSA.viewUI.locationDropdown.selectedIndex!=0)
		{
			//store city name
			var name=SMSA.viewUI.locationDropdown.value;
		  
			//search for name in database
			for(var i=0; i<locationDB.locationVec.length;i++)
			{
				//if city was found...
				if(locationDB.locationVec[i].name==name)
				{
					//store old date
					SMSA.model.oldDate=SMSA.viewUI.getDate();  
					
					//update location on UI and set location object
					SMSA.viewUI.updateLocation(locationDB.locationVec[i]);  
					SMSA.model.setLocation(locationDB.locationVec[i]);
							  
					//convert date/time at old location to date/time at new location
					//update date on UI and set date object
					SMSA.viewUI.updateDate(SMSA.model.calculateDate(SMSA.model.oldDate));
					SMSA.model.setDate(SMSA.viewUI.getDate());
					
					i=locationDB.locationVec.length; //break loop
				}
			}
			
			changeLocationOnMap(
			{lat:((SMSA.model.currentLocation.hemisphereNS=="n")? 1:-1) * (SMSA.model.currentLocation.latitudeDegrees+SMSA.model.currentLocation.latitudeMinutes/60),
				lng:((SMSA.model.currentLocation.hemisphereEW=="e")? 1:-1) * (SMSA.model.currentLocation.longitudeDegrees+SMSA.model.currentLocation.longitudeMinutes/60)}
				,map);
			SMSA.viewCanvas.drawCanvas();
		}
	},
	
	/*
	Called when user changes the location attributes on the input screen
	*/
	changeLocation: function()
	{
		SMSA.viewUI.locationDropdown.value="custom";
		SMSA.model.setLocation(SMSA.viewUI.getLocation());
	
		changeLocationOnMap(
		{lat:((SMSA.model.currentLocation.hemisphereNS=="n")? 1:-1) * (SMSA.model.currentLocation.latitudeDegrees+SMSA.model.currentLocation.latitudeMinutes/60),
			lng:((SMSA.model.currentLocation.hemisphereEW=="e")? 1:-1) * (SMSA.model.currentLocation.longitudeDegrees+SMSA.model.currentLocation.longitudeMinutes/60)}
			,map);
		SMSA.viewCanvas.drawCanvas();
	},
	
	/*
	Called when user changes the timezone on input screen
	Converts the time in old timezone to new timezone
	*/
	handleTimezoneChange: function()
	{
		SMSA.model.oldDate=SMSA.viewUI.getDate();
		SMSA.model.currentLocation.timezone=parseInt(SMSA.viewUI.tzDropdown.value);
		SMSA.viewUI.updateDate(SMSA.model.calculateDate(SMSA.model.oldDate));
		SMSA.model.setDate(SMSA.viewUI.getDate());
		SMSA.viewCanvas.drawCanvas();
	},
	
	
	/****************************END LOCATION PANE EVENTS************************/
	
	
	
	
	

	
	/****************************DATE PANE EVENTS************************/	
	/*
	Called when user changes the date on the input screen
	*/
	changeDate: function()
	{
		SMSA.model.setDate(SMSA.viewUI.getDate());
		SMSA.model.calculateTzAdjustment();
		SMSA.viewCanvas.drawCanvas();
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
		var hour=SMSA.viewUI.hourDropdown.value;
	
		//check which clock type is selected(12 or 24)
		if(SMSA.viewUI.getClockType()=="12")
		{
			//if clock type is 12 enable the am/pm selection box
			SMSA.viewUI.ampmDropdown.disabled=false;

			//delete options from hour selection box
			for(var i=SMSA.viewUI.hourDropdown.length; i>=0; i--)
			{
				SMSA.viewUI.hourDropdown.remove(i);
			}

			//create 12am/12pm option and add to hour selection
			var option = document.createElement("option");
			option.value="12";
			option.text="12";
			SMSA.viewUI.hourDropdown.add(option);

			//create 1-11am/pm options and add to hour selection
			for(var i=1; i<=11; i++)
			{
				option = document.createElement("option");
				option.value=i;
				option.text=i;
				SMSA.viewUI.hourDropdown.add(option);
			}
			
			//create a moment using the selected hour and convert to 12 hour format
			var hourMoment=moment(hour,"HH");
			SMSA.viewUI.hourDropdown.value=parseInt(hourMoment.clone().format("hh"));
			SMSA.viewUI.ampmDropdown.value=hourMoment.format("a").charAt(0);
		}
		else
		{
			//if clock type is 24 disable the am/pm selection box
			SMSA.viewUI.ampmDropdown.disabled=true;

			//delete options from hour selection box
			for(var i=SMSA.viewUI.hourDropdown.length; i>=0; i--)
			{
				SMSA.viewUI.hourDropdown.remove(i);
			}

			//create 0-23 hour options and add to hour selection
			var option;
			for(var i=0; i<=23; i++)
			{
				option = document.createElement("option");
				option.value=i;
				option.text =i;
				SMSA.viewUI.hourDropdown.add(option);
			}
			
			//create a moment from the selected hour and selected am/pm
			//and convert to 24 hour format.
			var hourMoment=moment(hour+" "+SMSA.viewUI.ampmDropdown.value,"hh a");
			SMSA.viewUI.hourDropdown.value=parseInt(hourMoment.clone().format("HH"));
		}
		
		SMSA.viewCanvas.plotSunPoints();
	},

	
	/*
	This function sets the drop down box dates and time to the current time
	in the given UTC zone.
	*/
	now: function()
	{
		//initialize a default moment(uses current time) and offset
		var momentNow=moment().utcOffset(parseInt(SMSA.model.currentLocation.timezone+SMSA.model.tzAdjustment),false);

		SMSA.viewUI.updateDate(momentNow);
		SMSA.model.setDate(momentNow);
		SMSA.model.calculateTzAdjustment();
		SMSA.viewCanvas.drawCanvas();
	},

	
	/****************************END DATE PANE EVENTS************************/
	
	
	
	
	
	/****************************CANVAS EVENTS************************/
	handleMouseDown: function(event)
	{
		//console.log(event.clientX+","+event.clientY);
		SMSA.model.crosshairPos=SMSA.events.convertCoords(SMSA.model.c1,event.clientX,event.clientY);
		//console.log(SMSA.model.crosshairPos.x+","+SMSA.model.crosshairPos.y);
		SMSA.viewCanvas.drawCanvas();
	},
	
	handleMouseMove: function(event)
	{
		var mousePosPixels=SMSA.events.convertCoords(SMSA.model.c1,event.clientX,event.clientY);
		var azimuth=SMSA.events.azimuth(mousePosPixels.x);
		var altitude=SMSA.events.altitude(mousePosPixels.y);
		
		//adjust azimuth for southern hemisphere and, if needed, the lower northern hemisphere
		if(SMSA.model.currentLocation.latitude<SMSA.model.currentDeclination)
		{
			azimuth=(azimuth+180)%360;
		};
		
		SMSA.viewUI.mouseAltitude.innerHTML=altitude+"° above horizon";
		SMSA.viewUI.mouseAzimuth.innerHTML=azimuth+"° E of N";
		
		var direction;
		if(azimuth>=40&&azimuth<=50)
		{
			direction="(Due Northeast)";
		}
		else if(azimuth>=85&&azimuth<=95)
		{
			direction="(Due East)";
		}
		else if(azimuth>=130&&azimuth<=140)
		{
			direction="(Due Southeast)";
		}
		else if(azimuth>=175&&azimuth<=185)
		{
			direction="(Due South)";
		}
		else if(azimuth>=220&&azimuth<=230)
		{
			direction="(Due Southwest)";
		}
		else if(azimuth>=265&&azimuth<=275)
		{
			direction="(Due West)";
		}
		else if(azimuth>=310&&azimuth<=320)
		{
			direction="(Due Northwest)";
		}
		else if(azimuth>=355||azimuth<=5)
		{
			direction="(Due North)";
		}
		SMSA.viewUI.mouseAzimuth.innerHTML+=direction;
		
	},
	
	handleMouseLeave: function(event)
	{
		SMSA.viewUI.mouseAltitude.innerHTML="N/A"
		SMSA.viewUI.mouseAzimuth.innerHTML="N/A";
	},
	
	handleResize: function(event)
	{
		SMSA.viewCanvas.resize(document.getElementById("rightPane").offsetWidth-30);
	},
	
	/****************************END CANVAS EVENTS************************/
	
	
	/********************************Functions for handlers*********************/
	convertCoords: function(canvas, x,y)
	{
		var bbox = canvas.getBoundingClientRect();
		return { x: x - bbox.left * (canvas.width  / bbox.width),
		y: y - bbox.top  * (canvas.height / bbox.height)
		};
	},
	
	azimuth: function(coord)
	{
		return Math.round(coord*360/SMSA.viewCanvas.c1.width);
	},
	
	altitude: function(coord)
	{
		return Math.round((SMSA.viewCanvas.c1.height*.75-coord)/SMSA.viewCanvas.c1.height*120);
	}
	
	/********************************ENd Functions for handlers*********************/
	
	
	
};