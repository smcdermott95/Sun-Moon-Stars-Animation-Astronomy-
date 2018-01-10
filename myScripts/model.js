var SMSA= { };
SMSA.model = {
	//bottom layer canvas
	c1:                document.getElementById("skyCanvas"), //get canvas
	numberOfStars:     120,
	starDeclination:   [89,0], //initilize array to store RNG'ed star declination position
	hourDisplacement:  [6,2],  //initilize array to store RNG'ed star hour positions
	crosshairPos:      {x:0, y:0},  //position of crosshair
	oldDate:           moment("0000", "YYYY"),  //the previous date before a date is changed
	currentDate:       moment("0000", "YYYY"),  //the date after a date is changed
	tzAdjustment:      0,         //offset used account for DST
	oldLocation:       null,            //the previous location before it is changed
	currentLocation:   new Location(),  //the location after it is changed
	isLocationUpdated: "undefined",
	currentDeclination: "undefined",    //declination of the sun


	init: function () {
		this.initializeStarsArrays();
		SMSA.viewCanvas.initializeCanvases();
		this.tempStartLocation();
	},


	//set the start location to new york city, NY
	tempStartLocation: function()
	{
		var newYork=new Location("New York City",40,43,"n",74,0,"w", -5, true);
		SMSA.viewUI.updateLocation(newYork);
		this.setLocation(newYork);
		SMSA.events.now();
		//SMSA.events.now();   //TODO figure out why this needs to be called twice
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
	Set the current date to a date
	*/
	setDate: function(date)
	{
		this.oldDate=this.currentDate;
		this.currentDate=date;

		if(!this.currentDate.isValid()||this.oldDate.month()!=this.currentDate.month())
		{
			SMSA.viewUI.updateDayDropdown();
		}

		if(mapReady)
		{
			//nite.init(map);
			nite.setDate(this.currentDate.clone().toDate());
			nite.refresh();
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
	This function pushes random values of declination and hour displacements
	into the respective arrays for every star to be generated.
	*/
	initializeStarsArrays: function()
	{
		//generate random declination and hour displacements
		Math.seed=6;
		for(var count=0; count<this.numberOfStars; count++)
		{
			this.starDeclination.push(Math.seededRandom()*180-90);
			this.hourDisplacement.push(Math.seededRandom()*24);
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
