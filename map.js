var map;
var marker;
var sunMarker;
var mapReady=false;
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
	
	sunMarker=new google.maps.Marker({
		position: null,
		map: map
	})
			
	map.addListener('click', function(e) {
	placeMarkerAndPanTo(e.latLng, map);
	});
	nite.init(map);
	mapReady=true;
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
		url:"https://maps.googleapis.com/maps/api/timezone/json?location="+latLng.lat()+","+latLng.lng()+"&timestamp="+(Math.round((new Date().getTime())/1000)).toString()+"&key=AIzaSyDceyk4lA3fL76c9LwyP3BcjFzezEFVVxk",}
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
	sunMarker=new google.maps.Marker({
		position: latLng,
		map: map,
		icon: "./sun.png"
	});
}