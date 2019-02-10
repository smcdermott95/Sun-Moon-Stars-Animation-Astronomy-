declare var require: any;
import { Injectable } from '@angular/core';
import { AppService, IDateChangeEvent, ILocationChangeEvent } from './app.service';
import { CanvasColors } from './canvas-color';
var SunCalc = require('suncalc');
import * as moment from 'moment';


//TODO - add the other properties
export interface ISunPos {
	altitude: number;
	azimuth: number;
}

export interface IMoonPos {
	altitude: number;
	azimuth: number;
	parallacticAngle: number;
}

enum SkyColorType {
	NIGHT,
	ASTRONOMICAL,
	NAUTICAL,
	CIVIL,
	DAY
}

@Injectable({
  providedIn: 'root'
})
export class CanvasService {
	private canvasesEle: Element;
	private skyCanvas: HTMLCanvasElement;
	private graphCanvas: HTMLCanvasElement;
	private sunPointsCanvas: HTMLCanvasElement;
	private sunMoonStarCanvas: HTMLCanvasElement;
	private skyCtx: CanvasRenderingContext2D;
	private graphCtx: CanvasRenderingContext2D;
	private sunPointsCtx: CanvasRenderingContext2D;
	private sunMoonStarCtx: CanvasRenderingContext2D;

  	private textColor: string;
	private numberOfStars = 120;
	private starDeclination = [89, 0]; //initilize array to store RNG'ed star declination position
	private hourDisplacement =  [6, 2];  //initilize array to store RNG'ed star hour positions

	private currentDeclination: number;

	private currentLocation: { lat: number, lon: number, timezone: number};
	private currentDateTime: moment.Moment;
	private is24HourClock: boolean;

	private lastDrawnDateTime: moment.Moment;
	private lastDrawnLocation: { lat: number, lon: number, timezone: number};
	private lastDrawnSkyColorType: number;
	private lastDrawnIs24HourClock: boolean;

	constructor(private appService: AppService) {
		console.log(this);

		appService.locationPanelChanged$.subscribe( (e: ILocationChangeEvent) => {
			this.currentLocation = e;
			if(this.currentDateTime && this.canvasesEle) {
				this.currentDateTime.utcOffset(e.timezone);
				this.drawCanvas();
			}
		});
		appService.dateChanged$.subscribe( (e: IDateChangeEvent) => {
			this.currentDateTime = e.newDateTime;
			this.is24HourClock = e.is24HourClock;
			if(this.currentLocation && this.canvasesEle)
				this.drawCanvas();
		});
	}

	public setCanvas(element: Element): void {
		this.canvasesEle = element;
		this.skyCanvas = this.canvasesEle.children[0] as HTMLCanvasElement;
		this.graphCanvas = this.canvasesEle.children[1] as HTMLCanvasElement;
		this.sunPointsCanvas = this.canvasesEle.children[2] as HTMLCanvasElement;
		this.sunMoonStarCanvas = this.canvasesEle.children[3] as HTMLCanvasElement;
	}

	public init(): void {
		this.initializeCanvases();
		this.initializeGraph();
		this.initializeStarsArrays();
	}

	//set the canvas contexts and draw the lines and degree labels on the
	//graph canvas
	private initializeCanvases() {
		//set contexts
		this.skyCtx = this.skyCanvas.getContext("2d");
		this.graphCtx = this.graphCanvas.getContext("2d");
		this.sunPointsCtx = this.sunPointsCanvas.getContext("2d");
		this.sunMoonStarCtx = this.sunMoonStarCanvas.getContext("2d");
		
	//size canvases to fit parent div
    //var w=document.getElementById("rightPane").offsetWidth-30;
    let w: number = this.canvasesEle.clientWidth;
		this.skyCanvas.width = w;
		this.skyCanvas.height = w / 2;
		this.graphCanvas.width = w;
		this.graphCanvas.height = w / 2;
		this.sunPointsCanvas.width = w;
		this.sunPointsCanvas.height = w / 2;
		this.sunMoonStarCanvas.width = w;
		this.sunMoonStarCanvas.height = w / 2;
		//document.getElementById("canvasesdiv").style.width=w+"px";
		//document.getElementById("canvasesdiv").style.height=(w/2)+"px";
		
		
		//event listeners
		//this.c4.addEventListener("mousedown",SMSA.events.handleMouseDown);
		//this.c4.addEventListener("mousemove",SMSA.events.handleMouseMove);
		//this.c4.addEventListener("mouseleave",SMSA.events.handleMouseLeave);
		//window.addEventListener("resize", SMSA.events.handleResize);          //TODO remove from artist class?
	}
  
  	private initializeGraph(): void {
		//draw 10-80 degree altitude lines, in 10 degree increments
		for(let i: number = 10; i <= 80; i += 10) {
			this.graphCtx.beginPath();
			this.graphCtx.moveTo(0,this.yCoord(i));
			this.graphCtx.lineTo(this.xCoord(360),this.yCoord(i));
			this.graphCtx.strokeStyle = CanvasColors.grid.LINE_GRAY;
			this.graphCtx.stroke();
			this.graphCtx.closePath();
		}
	
		//draw 180 degree azimuth line
		this.graphCtx.beginPath();
		this.graphCtx.moveTo(this.xCoord(180),this.yCoord(0));
		this.graphCtx.lineTo(this.xCoord(180),this.yCoord(90));
		this.graphCtx.strokeStyle = CanvasColors.grid.LINE_RED;
		this.graphCtx.stroke();
		this.graphCtx.closePath();
	
		//draw 90 and 270 degree azimuth line
		for(let i: number = 90; i <= 270; i+=180) {
			this.graphCtx.beginPath();
			this.graphCtx.moveTo(this.xCoord(i),this.yCoord(0));
			this.graphCtx.lineTo(this.xCoord(i),this.yCoord(90));
			this.graphCtx.strokeStyle = CanvasColors.grid.LINE_GRAY;
			this.graphCtx.stroke();
			this.graphCtx.closePath();
		}
	
		//draw -6 to 0 degree altitude twilight box
		this.graphCtx.beginPath();
		this.graphCtx.fillStyle = CanvasColors.grid.TWILIGHT_CIVIL;
		this.graphCtx.fillRect(this.xCoord(0), this.yCoord(-6), this.xCoord(360), -6*this.skyCanvas.height/120);
		this.graphCtx.closePath();
	
		//draw -12 to -6 degree altitude twilight box
		this.graphCtx.beginPath();
		this.graphCtx.fillStyle = CanvasColors.grid.TWILIGHT_NAUTICAL;
		this.graphCtx.fillRect(this.xCoord(0), this.yCoord(-12), this.xCoord(360), -6*this.skyCanvas.height/120);
		this.graphCtx.closePath();
	
		//draw -18 to -12 degree altitude twilight box
		this.graphCtx.beginPath();
		this.graphCtx.fillStyle = CanvasColors.grid.TWILIGHT_ASTRONOMICAL;
		this.graphCtx.fillRect(this.xCoord(0), this.yCoord(-18), this.xCoord(360), -6*this.skyCanvas.height/120);
		this.graphCtx.closePath();
	
		//draw -30 to -18 degree altitude night box
		this.graphCtx.beginPath();
		this.graphCtx.fillStyle = CanvasColors.grid.NIGHT;
		this.graphCtx.fillRect(this.xCoord(0), this.yCoord(-30), this.xCoord(360), -12*this.skyCanvas.height/120);
		this.graphCtx.closePath();
	
		//draw 0 altitude degree line
		this.graphCtx.beginPath();
		this.graphCtx.moveTo(0, this.yCoord(0));
		this.graphCtx.lineTo(this.xCoord(360), this.yCoord(0));
		this.graphCtx.strokeStyle = CanvasColors.grid.LINE_RED;
		this.graphCtx.stroke();
		this.graphCtx.closePath();

		//draw -18 to -6 degree altitude lines, in 6 degree increments
		for(let i: number = -18; i <= -6; i += 6) {
			this.graphCtx.beginPath();
			this.graphCtx.moveTo(0,this.yCoord(i));
			this.graphCtx.lineTo(this.xCoord(360),this.yCoord(i));
			this.graphCtx.strokeStyle = CanvasColors.grid.LINE_RED;
			this.graphCtx.stroke();
			this.graphCtx.closePath();
		}
	
		//draw border
		this.graphCtx.beginPath();
		this.graphCtx.strokeStyle = CanvasColors.grid.LINE_GRAY;
		this.graphCtx.strokeRect(0, 0, this.skyCanvas.width, this.skyCanvas.height);
		this.graphCtx.closePath();
	}

	public drawCanvas(): void {
		//grab the location and date
		let latitude: number = this.currentLocation.lat;
		let longitude: number = this.currentLocation.lon;

		//clone current date moment into JS date time
		let currentTimeAndDate: Date = this.currentDateTime.clone().toDate();

		//Calculate Current sun position
    	let currentSunPos: ISunPos = SunCalc.getPosition(currentTimeAndDate, latitude, longitude);
		let sunAltitude: number = currentSunPos.altitude*180/Math.PI;
		let sunAzimuth: number = currentSunPos.azimuth*180/Math.PI+180;

		//initialize color and gradient vars
		this.skyCtx.beginPath();
		let color1: string = "";
		let color2: string = "";
		let skyColorType: number;
		let grad: CanvasGradient = this.skyCtx.createLinearGradient(this.xCoord(0),this.yCoord(90),this.xCoord(0),this.yCoord(0));

		//calculate the 2 sky colors(top and bottom) for the sky gradient
		//using the sun's altitude. set the skyColorType
		if(sunAltitude < -18) {
			color1 = "black";
			color2 = CanvasColors.sky.NIGHT_PURPLE;
			skyColorType = SkyColorType.NIGHT;
		} else if(sunAltitude < -12) {
			color1 = CanvasColors.sky.NIGHT_PURPLE;
			color2 = CanvasColors.sky.NIGHT_DARK_BLUE;
			skyColorType = SkyColorType.ASTRONOMICAL;
		} else if(sunAltitude < -6) {
			color1 = CanvasColors.sky.NIGHT_DARK_BLUE;
			color2 = CanvasColors.sky.NIGHT_MEDIUM_BLUE;
			skyColorType = SkyColorType.NAUTICAL;
		} else if(sunAltitude < 0) {
			color1 = CanvasColors.sky.NIGHT_MEDIUM_BLUE;
			color2 = CanvasColors.sky.NIGHT_LIGHT_BLUE;
			skyColorType = SkyColorType.CIVIL;
		} else {
			color1 = CanvasColors.sky.DAY_BLUE;
			color2 = CanvasColors.sky.DAY_LIGHT_BLUE;
			skyColorType = SkyColorType.DAY;
		}

		//add colors to gradient
		grad.addColorStop(0, color1);
		grad.addColorStop(1, color2);
		this.skyCtx.fillStyle = grad;

		// //necessary to prevent redundancy of redrawing of skies with same sky colors
		if(skyColorType != this.lastDrawnSkyColorType) {
			//clear skyCanvas
			this.skyCtx.clearRect(0, 0, this.skyCanvas.width, this.skyCanvas.height);

			this.lastDrawnSkyColorType = skyColorType;

			//change text color and draw the sky.
			this.textColor = (skyColorType == SkyColorType.DAY ? "black" : "white");
			//this.crosshairColor=(skyColorType=="day" ? "#006400" : '#39FF14')
			this.skyCtx.fillRect(this.xCoord(0),this.yCoord(0),this.xCoord(360),-90*this.skyCanvas.height/120);
			this.skyCtx.closePath();
			
			this.plotSunPoints();
		}
    
		//clear sunMoonStarCanvas
		this.sunMoonStarCtx.clearRect(0, 0, this.sunMoonStarCanvas.width, this.sunMoonStarCanvas.height);
		
		//check if the sun points need to be redrawn again
		//if the date has changed, the timezone has changed,
		//or the location has changed
		if(
			!this.lastDrawnDateTime || /* never drawn */
			!this.lastDrawnLocation ||  /* never drawn */
			!this.currentDateTime.isSame(this.lastDrawnDateTime, "date") || /* changed date*/
			this.currentDateTime.utcOffset() != this.lastDrawnDateTime.utcOffset() || /* changed timezone */
			this.currentLocation.lat != this.lastDrawnLocation.lat || /* changed lattitude */
			this.currentLocation.lon != this.lastDrawnLocation.lon || /* changed longitude */
			this.is24HourClock != this.lastDrawnIs24HourClock /* changed clock type */
		) {
			//calculate a new declination
			this.currentDeclination=SunCalc.getPosition(/*Date*/ currentTimeAndDate, 90, 0).altitude*180/Math.PI;
			
			//plot 24 points for each hour
			this.plotSunPoints();
			//SMSA.model.isLocationUpdated=true;

			// //calculate sunrise, sunset, and day length
			// var sunTimes=SunCalc.getTimes(/*Date*/ currentTimeAndDate, /*Number*/ latitude, /*Number*/ longitude);
			// var sunrise=moment(sunTimes.sunrise).utcOffset(SMSA.model.currentLocation.timezone+SMSA.model.tzAdjustment,false);
			// var sunset=moment(sunTimes.sunset).utcOffset(SMSA.model.currentLocation.timezone+SMSA.model.tzAdjustment,false);
			// var dayLength=sunset.diff(sunrise, 'minutes');
			// var sunriseStr;
			// var sunsetStr;

			// //correctly format times
			// if(SMSA.viewUI.getClockType()=="12")
			// {
			// 	sunriseStr=sunrise.format("h:mm a");
			// 	sunsetStr=sunset.format("h:mm a");
			// }
			// else
			// {
			// 	sunriseStr=sunrise.format("H:mm");
			// 	sunsetStr=sunset.format("H:mm");
			// }
			
			// var minute=Math.round(dayLength%60.0);
			// var dayLengthStr=Math.floor(dayLength/60.0)+":"+ ((minute>9)? minute : ("0"+minute))+" hours";
			
			// //output
			// var sunTimesString="<h3>Times</h3><br>Sunrise: "+sunriseStr+"<br> Sunset: "+sunsetStr+"<br> Day Length: "+dayLengthStr;
			// document.getElementById("infoPanel").innerHTML=sunTimesString;
		}

		//adjust azimuth for southern hemisphere and, if needed, the lower northern hemisphere
		if(latitude < this.currentDeclination) {
			sunAzimuth = (sunAzimuth + 180) % 360;
		}

		//get sun color
		let sunColor: string = this.gradientFunction(sunAltitude);

		//draw sun
		this.sunMoonStarCtx.beginPath();
		this.sunMoonStarCtx.arc(this.xCoord(sunAzimuth),this.yCoord(sunAltitude),10,0,2*Math.PI);
		this.sunMoonStarCtx.strokeStyle = CanvasColors.grid.LINE_RED; //border
		this.sunMoonStarCtx.stroke();
		this.sunMoonStarCtx.fillStyle = sunColor;
		this.sunMoonStarCtx.fill();
		this.sunMoonStarCtx.closePath();

		//if the sun altitude is below 6 degrees of horizon, call draw stars
		if(sunAltitude < -6) {
			this.drawStars();
		}

		this.drawMoon();
	  
		// //draw crosshair
		// this.sunMoonStarCtx.strokeStyle = this.crosshairColor;
		// this.sunMoonStarCtx.beginPath();
		// this.sunMoonStarCtx.moveTo(SMSA.model.crosshairPos.x-5,SMSA.model.crosshairPos.y);
		// this.sunMoonStarCtx.lineTo(SMSA.model.crosshairPos.x+5,SMSA.model.crosshairPos.y);
		// this.sunMoonStarCtx.stroke();
		// this.sunMoonStarCtx.closePath();
		// this.sunMoonStarCtx.beginPath();
		// this.sunMoonStarCtx.moveTo(SMSA.model.crosshairPos.x,SMSA.model.crosshairPos.y-5);
		// this.sunMoonStarCtx.lineTo(SMSA.model.crosshairPos.x,SMSA.model.crosshairPos.y+5);
		// this.sunMoonStarCtx.stroke();
		// this.sunMoonStarCtx.closePath();
		
		// if(mapReady)
		// {
		// 	drawSun(nite.calculatePositionOfSun(currentTimeAndDate));
		// }
		
		// SMSA.viewUI.sunAltitudeOut.innerHTML=sunAltitude.toFixed(3);
    	// SMSA.viewUI.sunAzimuthOut.innerHTML=sunAzimuth.toFixed(3);
    
    	this.lastDrawnDateTime = this.currentDateTime.clone();
		this.lastDrawnLocation = this.currentLocation;
		this.lastDrawnIs24HourClock = this.is24HourClock;
	}

  	/*
	This function calculates and plots red dots/circles for every hour (0-23)
	indicating where the sun is at the beginning of each hour HH:00
	*/
	private plotSunPoints(): void {
		//A moment counter that will be incremented every hour
		let momentCounter = this.currentDateTime.clone().hours(0).minutes(0);
		let latitude: number = this.currentLocation.lat;
		let longitude: number = this.currentLocation.lon;


		//JS Date object required for SunCalc library
		let timeAndDate: Date;
	
		//Used to store Altitude and Azimuth of the sun at the beginning of an hour
		let sunHourAltitude: number, sunHourAzimuth: number;

		this.sunPointsCtx.clearRect(0,0, this.sunPointsCanvas.width, this.sunPointsCanvas.height);
	
		//Loop through every hour
		for(let i: number = 0; i <= 23; i++) {
			//Convert moment object to JS Date
			timeAndDate = momentCounter.clone().toDate();

			//Calculate altitude and azimuth
			let sunPos: ISunPos = SunCalc.getPosition(/*Date*/ timeAndDate, /*Number*/ latitude, /*Number*/ longitude);
			sunHourAltitude = sunPos.altitude * 180 / Math.PI;
			sunHourAzimuth = sunPos.azimuth * 180 / Math.PI + 180;

			//adjust azimuth for southern hemisphere and, if needed, the lower northern hemisphere
			if(latitude < this.currentDeclination) {
				sunHourAzimuth = (sunHourAzimuth + 180) % 360;
			}

			//draw the red circle/dots
			this.sunPointsCtx.beginPath();
			this.sunPointsCtx.arc(this.xCoord(sunHourAzimuth),this.yCoord(sunHourAltitude),3,0,2*Math.PI);
			this.sunPointsCtx.strokeStyle = CanvasColors.grid.LINE_RED;
			this.sunPointsCtx.stroke();
			this.sunPointsCtx.closePath();

			//determine the hour label format to be printed next to each point
			let hourString: string;
			if(!this.is24HourClock) {
				hourString = momentCounter.clone().format("ha");
			} else {
				hourString = momentCounter.clone().format("H");
			}

			//draw sun point hour text label
			this.sunPointsCtx.fillStyle = this.textColor;
			this.sunPointsCtx.font = "10px Arial";
			this.sunPointsCtx.fillText(hourString,Math.round(this.xCoord(sunHourAzimuth+1)),Math.round(this.yCoord(sunHourAltitude+1)));

			//increment the moment object by an hour
			momentCounter.add(1,'h');
		}

		//draw directionLabels
		let directionsLabels: string[];
		if(latitude > this.currentDeclination) {
			directionsLabels = ["North", "East", "South", "West"];
		} else {
			directionsLabels = ["South", "West", "North", "East"];
		}
		this.sunPointsCtx.fillStyle = this.textColor;
		this.sunPointsCtx.font = "14px Arial";
		this.sunPointsCtx.fillText(directionsLabels[0], 3, this.yCoord(90 - 5));
		this.sunPointsCtx.fillText(directionsLabels[1], this.sunPointsCanvas.width * .25 + 3,this.yCoord(90 - 5));
		this.sunPointsCtx.fillText(directionsLabels[2], this.sunPointsCanvas.width * .5 + 3,this.yCoord(90 - 5));
		this.sunPointsCtx.fillText(directionsLabels[3], this.sunPointsCanvas.width * .75 + 3,this.yCoord(90 - 5));
	  
	  
	  
		//draw degree labels
		for(let i: number = 10; i <= 90; i += 10) {
			this.sunPointsCtx.font = "10px Arial";
			this.sunPointsCtx.fillText(i + " deg", this.sunMoonStarCanvas.width * .95, this.yCoord(i - 2));
		}
	}

  	/*
	This function will draw the moon with a given moment,
	a latitude and longitude.
	*/
	private drawMoon(): void {
		let latitude: number = this.currentLocation.lat;
		let longitude: number = this.currentLocation.lon;
		
		//convert moment to JS date
		let timeAndDate: Date = this.currentDateTime.clone().toDate();

		//calculate moon alitude and azimuth
		let moonPos: IMoonPos = SunCalc.getMoonPosition(/*Date*/ timeAndDate, /*Number*/ latitude, /*Number*/ longitude);
		var moonIllumination = SunCalc.getMoonIllumination(timeAndDate, latitude, longitude);
		let moonAltitude: number = moonPos.altitude * 180 / Math.PI;
		let moonAzimuth: number = moonPos.azimuth * 180 / Math.PI + 180;

		//adjust azimuth for southern hemisphere and, if needed, the lower northern hemisphere
		if(latitude < this.currentDeclination) {
			moonAzimuth = (moonAzimuth + 180) % 360;
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
		this.sunMoonStarCtx.translate(this.xCoord(moonAzimuth), this.yCoord(moonAltitude));
		//console.log("parallacticAngle: "+moonPos.parallacticAngle*180/Math.PI+", moonIllumination.angle: "+moonIllumination.angle*180/Math.PI);
		this.sunMoonStarCtx.rotate(moonPos.parallacticAngle - (Math.PI / 4 - moonIllumination.angle));
		this.sunMoonStarCtx.translate(-14, -14);
		//this.sunMoonStarCtx.drawImage(document.getElementById("moonIMG"),0,0,28,28); //TODO
		
		var imgData = this.skyCtx.getImageData(this.xCoord(moonAzimuth), this.yCoord(moonAltitude), 1, 1);
	  
		this.sunMoonStarCtx.beginPath();
		this.sunMoonStarCtx.arc(14, 14, 12, 0, 2 * Math.PI);
		this.sunMoonStarCtx.fillStyle = "rgba(" + imgData.data[0]+ "," + imgData.data[1] + "," + imgData.data[2] + ",0.55)";
		this.sunMoonStarCtx.fill();
		this.sunMoonStarCtx.closePath();
	  
		this.sunMoonStarCtx.restore();
		
		// SMSA.viewUI.moonAltitudeOut.innerHTML=moonAltitude.toFixed(3);
		// SMSA.viewUI.moonAzimuthOut.innerHTML=moonAzimuth.toFixed(3);
  }
  
  /*
	This function pushes random values of declination and hour displacements
	into the respective arrays for every star to be generated.
	*/
	private initializeStarsArrays(): void {
		//generate random declination and hour displacements
		//Math.seed=6;
		for(let i: number = 0; i < this.numberOfStars; i++) {
			// this.starDeclination.push(Math.seededRandom()*180-90);
      		// this.hourDisplacement.push(Math.seededRandom()*24);
      		this.starDeclination.push(Math.random() * 180 - 90);
			this.hourDisplacement.push(Math.random() * 24);
		}
	}

  //TODO 2) make stars vary with longitude
	private drawStars(): void {
		let latitude: number = this.currentLocation.lat;
		let longitude: number = this.currentLocation.lon;
		
		//convert moment to JS date
		let timeAndDate: Date = this.currentDateTime.clone().toDate();

		//calculate star altitude and azimuth for every RNG based declination
		//and hour displacement in arrays.
		for(let i:number = 0; i < this.starDeclination.length; i++) {
			let hour: number = (timeAndDate.getHours() + timeAndDate.getMinutes() / 60 + this.hourDisplacement[i]) % 24;
			let starAltitude:number = 180 / Math.PI * Math.asin(this.cos(latitude) * this.cos(hour * 15) * this.cos(this.starDeclination[i]) + this.sin(latitude) * this.sin(this.starDeclination[i]));
			let starAzimuth:number = 180 / Math.PI * Math.acos((this.sin(starAltitude) * this.sin(latitude) - this.sin(this.starDeclination[i])) / (this.cos(starAltitude) * this.cos(latitude)));
 
			//star azimuth adjustment
			if((hour * 15) > 180) {
				starAzimuth = 360 - starAzimuth;
			}
			starAzimuth = (starAzimuth + 180) % 360;

			//adjust azimuth for southern hemisphere and, if needed, the lower northern hemisphere
			if(latitude < this.currentDeclination) {
				starAzimuth = (starAzimuth + 180) % 360;
			}

			//only draw stars with altitude above 0 degrees(above horizon)
			if(starAltitude > 0) {
				this.sunMoonStarCtx.beginPath();
				this.sunMoonStarCtx.arc(this.xCoord(starAzimuth),this.yCoord(starAltitude),1,0,2*Math.PI);
				this.sunMoonStarCtx.fillStyle = 'white';
				this.sunMoonStarCtx.fill();
				this.sunMoonStarCtx.closePath();
			}
		}
	}
  
  /*
	Calculate a sun color in hex given an altitude and return it.
	*/
	private gradientFunction(sunAltitude: number): string {
		let color: string;
		if(sunAltitude >= 0) {
			let red: number = Math.round((255 - 255) * Math.pow(sunAltitude / 90, .25) + 255);
			let green: number = Math.round((255 - 102) * Math.pow(sunAltitude / 90, .25) + 102);
			let blue: number = Math.round((153 - 0) * Math.pow(sunAltitude / 90, .25) + 0);
			color = "#" + red.toString(16) + green.toString(16) + "00";
		} else {
			color = CanvasColors.SUN_BELOW_HORIZON;
		}
		return color;
	}

  	//convert the azimuth angle (0 to 360 degrees east of north) to
	//an x-coordinate on the canvas
	private xCoord(coord): number {
		return coord / 360 * this.skyCanvas.width;
	}
	
	//convert altitude angle(-30 to +90) to pixel y-coordinate on the canvas
	private yCoord(coord): number {
		return -this.skyCanvas.height * .75 / 90 * coord + .75*this.skyCanvas.height;
  	}
  
  private sin(n): number {
    return Math.sin(Math.PI / 180 * n);
  }

  private cos(n): number {
    return Math.cos(Math.PI / 180 * n);
  }
}
