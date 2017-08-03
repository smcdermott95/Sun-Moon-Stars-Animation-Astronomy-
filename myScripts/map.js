var map;
var marker;
var sunMarker;
var mapReady=false;
var sun={anchor: {x:16, y:16},url: "./sun.png"};
function initMap() {
	var newYork = {lat: 40.717, lng: -74.000};
		map = new google.maps.Map(document.getElementById('map'), {
		zoom: 4,
		center: newYork
	});
	marker = new google.maps.Marker({
		position: newYork,
		map: map
	});
	
			
	map.addListener('click', function(e) {
	placeMarkerAndPanTo(e.latLng, map);
	});
	nite.init(map);
	mapReady=true;
	
	//initialize sun marker to current location
	/*
	sunMarker=new google.maps.Marker({
	position: {lat:nite.getSunPosition().lat(), lng:nite.getSunPosition().lng()},
		map: map,
		icon: sun,
	})
	*/
	sunMarker= new google.maps.Circle({
		map: map,
		center: {lat:nite.getSunPosition().lat(), lng:nite.getSunPosition().lng()},
		radius: 200000,
		fillColor: "#FF0",
		fillOpacity: 1,
		strokeColor: "#F00",
		strokeWeight: 1,
		strokeOpacity: 1,
		clickable: false,
		editable: false
        });
}

function placeMarkerAndPanTo(latLng, map) {
	marker.setMap(null);
	marker = new google.maps.Marker({
		position: latLng,
		map: map
	});
	map.panTo(latLng);
			

	var tz;
	var dst;
	$.ajax({
		url:"https://maps.googleapis.com/maps/api/timezone/json?location="+latLng.lat()+","+latLng.lng()+"&timestamp="+(Math.round((new Date().getTime())/1000)).toString()+"&key=AIzaSyBMsO1sfJI8djX1LkDq4vYiXudrpKSi4Pk",}
		).done(function(response){
		if(response.timeZoneId != null){
			tz=response.rawOffset/3600;
			dst=response.dstOffset/3600;
			
			//initialize array for location coords [latitude Degrees, latitude Minutes, longitude Degrees, longitude Minutes]
			var coords=new Array(4);
			
			coords[0]=Math.floor(Math.abs(latLng.lat()));
			coords[1]=Math.round(Math.abs(latLng.lat()%1*60));
			
			//if minutes rounded up to 60, reset it to 0 and increment degrees.
			if(coords[1]==60)
			{
				coords[1]=0;
				coords[0]++;
			}
			
			
			coords[2]=Math.floor(Math.abs(latLng.lng()));
			coords[3]=Math.round(Math.abs(latLng.lng()%1*60));
			
			//if minutes rounded up to 60, reset it to 0 and increment degrees.
			if(coords[3]==60)
			{
				coords[3]=0;
				coords[2]++;
			}
			
					
			var l = new Location("custom",coords[0],coords[1],(latLng.lat()>=0)? "n":"s",
				coords[2],coords[3],(latLng.lng()>=0)? "e":"w",tz,dst);
			SMSA.model.oldDate=SMSA.viewUI.getDate();
			SMSA.viewUI.updateLocation(l);
			SMSA.model.setLocation(l);
			SMSA.viewUI.updateDate(SMSA.model.calculateDate(SMSA.model.oldDate));
			SMSA.model.setDate(SMSA.viewUI.getDate());
			SMSA.viewCanvas.drawCanvas();
		}
	});
	
	//TODO handle offline situation when google timezone API cannot be accessed		
			
}
		
function changeLocationOnMap(latLng,map)
{
	marker.setMap(null);
	marker = new google.maps.Marker({
		position: latLng,
		map: map
	});
	map.panTo(latLng);
}

function drawSun(latLng)
{

	sunMarker.setMap(null);
	/*
	sunMarker.position=latLng;
	sunMarker=new google.maps.Marker({
		position: latLng,
		map: map,
		icon: sun
	});
	*/
	sunMarker= new google.maps.Circle({
		map: map,
		center: latLng,
		radius: 200000,
		fillColor: "#FF0",
		fillOpacity: 1,
		strokeColor: "#F00",
		strokeWeight: 1,
		strokeOpacity: 1,
		clickable: false,
		editable: false
        });
}