/////////////// STEP 1:  SET UP INITIAL PARAMETERS /////////////////////

// Set up queryURL to the get earthquake data 
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var platesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

// Create the map object with options
var myMap = L.map("map", {
    center: [17.5707, -3.9962],
    zoom: 2.5,
    minZoom: 2.5
});

// Create tile layer
var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
})

var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/outdoors-v11",
  accessToken: API_KEY
})

var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",{
    id: "mapbox.satellite",
    maxZoom: 18,
    accessToken: API_KEY  
}).addTo(myMap);
; 

var darkmap =  L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id:"dark-v10",
    accessToken: API_KEY
})

// Set up basemaps
var basemaps = { 
    "Satellite": satellite,
    "Light Map": lightmap,
    "Outdoor Map": outdoorsMap,
    "Dark Map": darkmap
};

// Set up layerGroups
var quake_layer = new L.LayerGroup()
var plates_layer = new L.LayerGroup()

var dataLayers = {
    "Earthquakes": quake_layer,
    "Tectonic Plates": plates_layer
};

// Add toggle option
L.control.layers(basemaps, dataLayers,{
    collapsed: false
}).addTo(myMap);

// Create markerSize function 
function markerSize(magnitude) {
    return magnitude * 2.5
    };

// Create marker color function    
function chooseColor(depth) {
    switch(true) {
        case depth > 90:
            return "red";
        case depth > 70:
            return "orangered";
        case depth > 50:
            return "orange";
        case depth > 30:
            return "gold";
        case depth > 10:
            return "yellow";
        default:
            return "limegreen";
        }
    };

// Add an object legend 
var legend = L.control({
    position: "bottomright",
});

//Details for legend
legend.onAdd = function () {
    var div = L.DomUtil.create("div", "info legend");
    div.innerHTML += "<h6 style=text-align:center> Depth <hr>";
    var grades = [10, 30, 50, 70, 90];


    //Looping through legend entries
    for (var i =0; i < grades.length; i++) {
        div.innerHTML +=
        "<p>" + "<div class = i style='height: 20px; width: 20px; background-color: " + chooseColor(grades[i]) + "'></div>" +
        grades[i] +(grades[i +1] ? "&ndash;" + grades[i+1] + "<br>" : "+"); 
    }
    return div;
}
legend.addTo(myMap);


/////////////// STEP 2: PERFORM API CALL AND CREATE GEOJSON /////////////////////

// API Call
d3.json(queryURL).then(function(data) {
    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: .7,
            fillColor:chooseColor(feature.geometry.coordinates[2]),
            color: "#000000",
            radius: markerSize(feature.properties.mag),
            stroke: true,
            weight: 0.3
        };
    }

    // Create GeoJSON and pointToLayer function for quakes
    L.geoJson(data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
    
        // Add styleInfo and bind popup 
        style: styleInfo, onEachFeature: function(feature, layer) {
            layer.bindPopup("<h6> <strong> Location: " + feature.properties.place + "</strong>" + "</h3><hr><p> Date: " + 
            new Date(feature.properties.time) + "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
        }
    }).addTo(quake_layer);

    // Add quake layer to default view
    quake_layer.addTo(myMap);

    //Loop through the features array
    for (var i = 0; i < features.length; i++) {
        var feature = features[i]
    };
});

// Create GeoJSON for tectonic plates
d3.json(platesURL).then(function(data){
    L.geoJson(data, {
        color:"orange",
        fillColor: "none",
        weight: 1.5,
        borderradius: "none"
    }).addTo(plates_layer);

    // Add paltes layer to default view
    plates_layer.addTo(myMap);
});