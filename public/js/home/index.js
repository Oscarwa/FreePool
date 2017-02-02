window.map;
this.routes = [];

window.onload = function() {
  navigator.geolocation.getCurrentPosition(success, error, {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  });

  window.map = new google.maps.Map(document.getElementById('map'), {
    scrollwheel: true,
    zoom: 14
  });

  window.map.addListener('click', function(pos) {
    // var marker = new google.maps.Marker({
    //   position: pos.latLng,
    //   map: window.map
    // });
    if(!window.from) {
      window.from = {lat: pos.latLng.lat(), lng: pos.latLng.lng()};
    }
    else {
      window.to = {lat: pos.latLng.lat(), lng: pos.latLng.lng()};
      updateRoute();
    }
  });

  window.image = {
      url: 'images/circle.png',
      // This marker is 20 pixels wide by 32 pixels high.
      size: new google.maps.Size(256, 256),
      // The origin for this image is (0, 0).
      origin: new google.maps.Point(0, 0),
      // The anchor for this image is the base of the flagpole at (0, 32).
      anchor: new google.maps.Point(5, 5),
      scaledSize: new google.maps.Size(10, 10)
    };
}

function error(err) {
  console.warn('ERROR:', err.message);
};

function success(pos) {
  var from = {lat: pos.coords.latitude, lng: pos.coords.longitude};

  map.setCenter(from);
}



window.markers = [];
function createMarker(latLng) {
  var newLatLng = new google.maps.LatLng({lat: latLng.lat, lng: latLng.lng});
  var marker = new google.maps.Marker({
    position: newLatLng,
    map: window.map,
    icon: window.image
  });
  window.markers.push(marker);
  return newLatLng;
}

function updateRoute() {
  // Set destination, origin and travel mode.
  var request = {
    destination: window.to,
    origin: window.from,
    travelMode: 'DRIVING'
  };

  window.from = window.to = null;

  // Pass the directions request to the directions service.
  var directionsService = new google.maps.DirectionsService();
  directionsService.route(request, function(response, status) {
    if (status == 'OK') {
      // Display the route on the map.
      var directionsDisplay = new google.maps.DirectionsRenderer({
        map: window.map
      });
      directionsDisplay.setDirections(response);

      // for (var i = 0; i < window.markers.length; i++) {
      //   window.markers[i].
      // }

      if (!!response.routes.length) {
        var routeArray = response.routes[0].overview_path;
        for(var i = 0; i < routeArray.length; i=i+5) {

          calculateMatch(
            createMarker({lat: routeArray[i].lat(), lng: routeArray[i].lng()})
          );
        }

        this.routes.push(this.markers);
        this.markers = [];
      }
    }
  });
}

function calculateMatch(posToEvaluate) {
  var time = Date.now();
  var mainMatchCount = [];
  for(var route in this.routes) {
    var matchCount = 0;
    for(var pos in this.routes[route]) {
      // console.log(
        var d = google.maps.geometry.spherical.computeDistanceBetween(this.routes[route][pos].position, posToEvaluate)
      // )

      if(d < 300) {
        matchCount++;
        console.log('distance:', d);

        var line = new google.maps.Polyline({
            path: [this.routes[route][pos].position, posToEvaluate],
            strokeColor: "#000000",
            strokeOpacity: 0.6,
            strokeWeight: 2,
            map: window.map
        });
      }
    }
    console.info('Matched in: ' + matchCount + ' out of ' + this.routes[route].length);
    mainMatchCount[route] += matchCount > 0 ? 1 : 0;
  }
  console.info('finished in: ' + (Date.now() - time) + 'ms');
}

function setMapOnAll(map) {
  // for
  for (var i = 0; i < markers.length; i++) {
    window.markers[i].setMap(map);
  }
}
