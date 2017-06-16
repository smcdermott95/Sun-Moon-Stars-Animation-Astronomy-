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
	sunMarker=new google.maps.Marker({
	position: {lat:nite.getSunPosition().lat(), lng:nite.getSunPosition().lng()},
		map: map,
		icon: sun,
	})
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
					
			var l = new Location("custom",Math.floor(Math.abs(latLng.lat())),
				Math.floor(Math.abs(latLng.lat()%1*60)),
				(latLng.lat()>=0)? "n":"s",
				Math.floor(Math.abs(latLng.lng())),
				Math.floor(Math.abs(latLng.lng()%1*60)),
				(latLng.lng()>=0)? "e":"w",
			tz,dst);
			SMSA.oldDate=SMSA.getDate();
			SMSA.updateLocation(l);
			SMSA.setLocation(l);
			SMSA.updateDate(SMSA.calculateDate(SMSA.oldDate));
			SMSA.setDate(SMSA.getDate());
			SMSA.drawCanvas();
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