SMSA.viewUI = {
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
	mouseAltitude:     document.getElementById("mouseAltitude"),
	mouseAzimuth:      document.getElementById("mouseAzimuth"),
	moonAltitudeOut:   document.getElementById("moonAltitude"),
	moonAzimuthOut:    document.getElementById("moonAzimuth"),
	sunAltitudeOut:    document.getElementById("sunAltitude"),
	sunAzimuthOut:     document.getElementById("sunAzimuth"),

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

		var observeDST=SMSA.model.currentLocation.observeDST;

		var location=new Location(name,latDeg, latMin,vHemi,lonDeg,lonMin,hHemi,timezone,observeDST);
		return location;
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
		if(this.getClockType()=="12")
		{
			date=moment(month+"/"+day+"/"+year+" "+hour+":"+min+" "+ampm,"M/D/YYYY h:mm a");
		}
		else
		{
			date=moment(month+"/"+day+"/"+year+" "+hour+":"+min,"M/D/YYYY H:m");
		}

		date.utcOffset(parseInt(SMSA.model.currentLocation.timezone+SMSA.model.tzAdjustment), true);

		return date;
	},

	//This function will determine which radio button for clock
	//type (12 or 24) is checked and return
	getClockType: function()
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
	Set the date selected on the input screen to a moment
	*/
	updateDate: function(date)
	{
		var oldMonth=this.monthDropdown.value;
		this.monthDropdown.value=date.month()+1;

		//check if month changed, or the month drop down is not initialized
		//if either is true, then update day Dropdown by calling handleMonthChange
		if(this.monthDropdown.value!=oldMonth||this.dayDropdown.options.length==0)
		{
			this.updateDayDropdown();
		}
		this.dayDropdown.value=date.date();
		this.yearDropdown.value=date.year();
		this.minDropdown.value=date.minute();


		if(this.getClockType()=="12")
		{
			this.hourDropdown.value=date.clone().format("h");
			this.ampmDropdown.value=date.clone().format("a").charAt(0);
		}
		else {
			this.hourDropdown.value=date.hour();
		}
	},


	/*
	This function will update the day selection options (0-31) if the user
	changes the month selection.
	*/
	updateDayDropdown: function()
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

		if(!SMSA.model.currentDate.isValid())
		{
			SMSA.model.currentDate=this.getDate();
		}
	},

	disableButtons(){
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
	},

	enableButtons() {
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

};
