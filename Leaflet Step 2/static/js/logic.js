function createMap(earthquakes, tectonicplates) {

  var graymap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  })


  var satmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  })


  var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  })


  var myMap = L.map("map", {
    center: [38.89511, -77.03637],
    zoom: 6,
    layers: [graymap, satmap, outdoors]

  });

  var basemaps = {
    "Satellite Map": satmap,
    "Gray Map": graymap,
    "Outdoors": outdoors,
  }

  var overlay = {
    "Earthquakes": earthquakes,
    "Fault Lines": tectonicplates,
  }

  L.control.layers(basemaps, overlay).addTo(myMap)



  function getColor(magnitude) {
    switch (true) {
      case magnitude > 5:
        return "#ea2c2c";
      case magnitude > 4:
        return "#ea822c";
      case magnitude > 3:
        return "#ee9c00";
      case magnitude > 2:
        return "#eecc00";
      case magnitude > 1:
        return "#d4ee00";
      default:
        return "#98ee00";
    }
  }


  var legend = L.control({ position: 'bottomright' });

  legend.onAdd = function () {

    var div = L.DomUtil.create('div', 'info legend'),

      grades = [0, 1, 2, 3, 4, 5];


    div.innerHTML += 'Eathquake<br>Magnitude<br><hr>'


    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(grades[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
  };

  legend.addTo(myMap);
}


var remainingCalls = 2;


var earthquakesLayer = []

var faultlinelLayer = []


d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function (data) {

  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }


  function getColor(magnitude) {
    switch (true) {
      case magnitude > 5:
        return "#ea2c2c";
      case magnitude > 4:
        return "#ea822c";
      case magnitude > 3:
        return "#ee9c00";
      case magnitude > 2:
        return "#eecc00";
      case magnitude > 1:
        return "#d4ee00";
      default:
        return "#98ee00";
    }
  }

  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 4;
  }

  var earthquakes = new L.LayerGroup()
  L.geoJson(data, {

    pointToLayer: function (feature, latlong) {
      return L.circleMarker(latlong);
    },

    style: styleInfo,



    onEachFeature: function (feature, layer) {

      layer.bindPopup("Earthquake Magnitude: " + feature.properties.mag + "<br>Earthquake Location:<br>" + feature.properties.place);
    }
  }).addTo(earthquakes);


  earthquakesLayer = earthquakes




  --remainingCalls;
  console.log(`Fetched earthquake data. Remaining calls: ${remainingCalls}`)

  if (remainingCalls === 0) {
    createMap(earthquakesLayer, faultlinelLayer)
  }

});


d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json", function (data) {

  var faultlines = new L.LayerGroup()

  L.geoJson(data, {
    color: "orange",
    weight: 2,
  }).addTo(faultlines);

  faultlinelLayer = faultlines


  --remainingCalls;
  console.log(`Fetched faultline data. Remaining calls: ${remainingCalls}`)

  if (remainingCalls === 0) {
    createMap(earthquakesLayer, faultlinelLayer)
  }

});