// Create map object
var myMap = L.map("map", {
  center: [-9.4438, 147.1803],
  zoom: 5
});

// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// URL for all earthquakes in the past 7 days from USGS Site
var link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Function to convert UNIX timestamp to datetime with DD-MM-YYYY format
function convertTimestamp(x) {
  var d = new Date(x);
  var yyyy = d.getFullYear();
  var dd = ('0' + d.getDate()).slice(-2);
  var mm = ('0' + (d.getMonth() + 1)).slice(-2);
  var hh = d.getHours();
  var h = hh;
  var min = ('0' + d.getMinutes()).slice(-2);
  var ampm = 'AM';

  if (hh > 12) {
    h = hh - 12;
    ampm = 'PM';
  } else if (hh === 12) {
    h = 12;
    ampm = 'PM';
  } else if (hh == 0) {
    h = 12;
  }

  var time = dd + '-' + mm + '-' + yyyy + ', ' + h + ':' + min + ' ' + ampm;
  return time;
}

function getColor(depth) {
  if (depth > 90) {
    return 'darkred';
  } else if (depth > 70) {
    return 'red';
  } else if (depth > 50) {
    return 'orange';
  } else if (depth > 30) {
    return 'yellow';
  } else if (depth > 10) {
    return 'green';
  } else {
    return 'lightgreen';
  }
}

// Getting GeoJSON data
d3.json(link).then(function(data) {
  featureData = data.features;

  // Loop through the data
  for (var i = 0; i < featureData.length; i++) {
    var location = data.features[i].geometry;
    var magnitude = data.features[i].properties.mag;
    var depth = data.features[i].geometry.coordinates[2];
    var circleOptions = {
      radius: magnitude * 5,
      color: 'black',
      weight: 1,
      fillColor: getColor(depth),
      fillOpacity: 0.8
    };
    var timestamp = data.features[i].properties.time;
    dateTime = convertTimestamp(timestamp);

    new L.circleMarker([location.coordinates[1], location.coordinates[0]], circleOptions)
      .bindPopup("<strong>Time: </strong>" + dateTime + "<br /><strong>Magnitude: </strong>" + magnitude + "<br /><strong>Location: </strong>" + data.features[i].properties.place + "<br /><strong>Depth: </strong>" + depth + " km")
      .addTo(myMap);
  }
});

// Set up the legend
var legend = L.control({ position: "bottomright" });
legend.onAdd = function() {
  var div = L.DomUtil.create("div", "info legend");
  var labels = ["-10-10 km", "10-30 km", "30-50 km", "50-70 km", "70-90 km", "90+ km"];
  var colors = ['lightgreen', 'green', 'yellow', 'orange', 'red', 'darkred'];
  var legendInfo = "<h1>Earthquake Depth</h1>";

  for (var i = 0; i < labels.length; i++) {
    div.innerHTML += '<i style="background:' + colors[i] + '"></i> ' + labels[i] + '<br>';
  }

  return div;
};

// Adding the legend to the map
legend.addTo(myMap);