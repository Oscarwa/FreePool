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


  google.maps.Polyline.prototype.getBounds = function() {
    var bounds = new google.maps.LatLngBounds();
    this.getPath().forEach(function(item, index) {
        bounds.extend(new google.maps.LatLng(item.lat(), item.lng()));
    });
    return bounds;
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

        // boundingBox of route
        var routeArray = response.routes[0].overview_path;

        // var p1 = new google.maps.LatLng({lat: routeArray[0].lat(), lng: routeArray[0].lng() });
        // var p2 = new google.maps.LatLng({lat: routeArray[0].lat(), lng: routeArray[routeArray.length-1].lng() });
        // var p3 = new google.maps.LatLng({lat: routeArray[routeArray.length-1].lat(), lng: routeArray[routeArray.length-1].lng() });
        // var p4 = new google.maps.LatLng({lat: routeArray[routeArray.length-1].lat(), lng: routeArray[0].lng() });
        // var line = new google.maps.Polyline({
        //     path: [p1, p2, p3, p4, p1],
        //     strokeColor: "#000000",
        //     strokeOpacity: 0.6,
        //     strokeWeight: 2,
        //     map: window.map
        // });
        // var _p2 = farthestPointTo(routeArray, p1);
        // var _p1 = farthestPointTo(routeArray, _p2);
        // _p2 = farthestPointTo(routeArray, _p1);
        // var _p3 = new google.maps.LatLng({lat: _p1.lat(), lng: _p2.lng() });
        // var _p4 = new google.maps.LatLng({lat: _p2.lat(), lng: _p1.lng() });
        // var line = new google.maps.Polyline({
        //     path: [_p1, _p3, _p2, _p4, _p1],
        //     strokeColor: "#00CCCC",
        //     strokeOpacity: 0.6,
        //     strokeWeight: 2,
        //     map: window.map
        // });

        getBoundingBox(routeArray);

        for(var i = 0; i < routeArray.length; i=i+1) {

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

function farthestPointTo(array, p) {
  var tempDistance = 0;
  var tempPoint;
  for(var i in array) {
      var d = google.maps.geometry.spherical.computeDistanceBetween(array[i], p)
      if(d > tempDistance) {
        tempDistance = d;
        tempPoint = array[i];
      }
  }
  return tempPoint;
}

function getBoundingBox(array) {
  var line = new google.maps.Polyline({
      path: array
  });

  var bounds = line.getBounds();
  var northWest = new google.maps.LatLng({lat: bounds.getNorthEast().lat(), lng: bounds.getSouthWest().lng() });
  var southEast = new google.maps.LatLng({lat: bounds.getSouthWest().lat(), lng: bounds.getNorthEast().lng() });
  var line = new google.maps.Polyline({
      path: [bounds.getNorthEast(), northWest, bounds.getSouthWest(), southEast, bounds.getNorthEast()],
      strokeColor: "#FF0000",
      strokeOpacity: 0.6,
      strokeWeight: 2,
      map: window.map
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
