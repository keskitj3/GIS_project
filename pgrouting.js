OpenLayers.ProxyHost = "/cgi-bin/proxy.cgi?url=";

function init() {
	
	var map = new ol.Map({
	  layers: [
	    new ol.layer.Tile({
	    source: new ol.source.OSM()
	  })],
	  target: "map",
	  view: new ol.View({
	    center: [2779257.6943, 8439166.6796],
	    zoom: 12
	  })
	});	

	//WMS-testi
	var liikuntapaikat_wms = new ol.layer.Tile({
	  source: new ol.source.TileWMS({
	    url: "http://130.233.249.20:8080/geoserver/WMS/wms",
	    params: {
		"LAYERS": "WMS:liikuntapaikat",
		"VERSION": "1.1.0",
		"FORMAT": "image/png",
		"TILED": true
	    }
	  })
	});
	
	map.addLayer(liikuntapaikat_wms);

	//WFS-testi

var vectorSource = new ol.source.Vector({
  //format: new ol.format.GeoJSON(),
  format: new ol.format.WFS(),
  url: function(extent, resolution, projection) {
    return "http://130.233.249.20:8080/geoserver/wfs?service=WFS&" + 
		"version=1.1.0&request=GetFeature&typename=WMS:WFS_pisteet&" +
		"outputFormat=application/json&srsname=EPSG:3857&";
  },
  strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
    maxZoom: 19
  }))
});

//var loadFeatures = function(response) {
//  vectorSource.addFeatures(vectorSource.readFeatures(response)); //vectorSource.read..
//};

var vector = new ol.layer.Vector({
  source: vectorSource,
  style: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'rgba(0, 0, 255, 1.0)',
      width: 2
    })
  })
});
	
map.addLayer(vector);


/*
var layer_ojd_vector = new ol.layer.Vector({
	source: new ol.source.Vector({parser: new ol.parser.GeoJSON(),
		url: "http://130.233.249.20:8080/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=NS:LAYER&maxFeatures=50&outputFormat=json" }), 
		style: new ol.style.Style({
		rules: [new ol.style.Rule({ 
		filter: 'geometryType("point")',
		symbolizers: [ new ol.style.Shape({ fillColor: '#013', size: 40 }) ] 
})]})});

map.addLayer(layer_ojd_vector);
*/	
/*
sourceVector = new ol.source.Vector({
	loader: function(extent) {
		$.ajax('http://130.233.249.20:8080/geoserver/WMS/wms',{
			type: 'GET',
			data: {
				service: 'WFS',
				version: '1.1.0',
				request: 'GetFeature',
				typename: 'WFS_pisteet',
				srsname: 'EPSG:4326',
				bbox: extent.join(',') + ',EPSG:3857'
				},
			}).done(loadFeatures);
		},
		strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
			maxZoom: 19
			})),
	});

window.loadFeatures = function(response) {
    formatWFS = new ol.format.WFS(),
    sourceVector.addFeatures(formatWFS.readFeatures(response));
    };

layerVector = new ol.layer.Vector({
    source: sourceVector,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 255, 1.0)',
            width: 2
            })
        })
    });

map.addLayer(layerVector);
*/

	//geolocation
var geolocation = new ol.Geolocation({
  projection: view.getProjection()
});

function el(id) {
  return document.getElementById(id);
}

el('track').addEventListener('change', function() {
  geolocation.setTracking(this.checked);
});
/*
// update the HTML page when the position changes.
geolocation.on('change', function() {
  el('accuracy').innerText = geolocation.getAccuracy() + ' [m]';
  el('altitude').innerText = geolocation.getAltitude() + ' [m]';
  el('altitudeAccuracy').innerText = geolocation.getAltitudeAccuracy() + ' [m]';
  el('heading').innerText = geolocation.getHeading() + ' [rad]';
  el('speed').innerText = geolocation.getSpeed() + ' [m/s]';
});
*/
// handle geolocation error.
geolocation.on('error', function(error) {
  var info = document.getElementById('info');
  info.innerHTML = error.message;
  info.style.display = '';
});
/*
var accuracyFeature = new ol.Feature();
geolocation.on('change:accuracyGeometry', function() {
  accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
});
*/
var positionFeature = new ol.Feature();
positionFeature.setStyle(new ol.style.Style({
  image: new ol.style.Circle({
    radius: 6,
    fill: new ol.style.Fill({
      color: '#3399CC'
    }),
    stroke: new ol.style.Stroke({
      color: '#fff',
      width: 2
    })
  })
}));

geolocation.on('change:position', function() {
  var coordinates = geolocation.getPosition();
  positionFeature.setGeometry(coordinates ?
      new ol.geom.Point(coordinates) : null);
});

var featuresOverlay = new ol.layer.Vector({
  map: map,
  source: new ol.source.Vector({
    features: [positionFeature ]//, accuracyFeature ]
  })
});

//Find layer by it's name
/* function findByName(name) {
	var layers = map.getLayers();
        var length = layers.getLength();
        for (var i = 0; i < length; i++) {
        	if (name === layers.item(i).get('name')) {
                	return layers.item(i);
                }     
	}
 	return null;
}  */

//Change visibility of a layer
function showLayer(inputEl){
    map.getLayers().forEach(function(layer){
        if (layer.get('name') === inputEl.name)
            layer.setVisible(inputEl.checked);
    });
};

	//pgRouting
	var params = {
  	  LAYERS: 'pgrouting:pgrouting',
  	  FORMAT: 'image/png'
	};

	// The "start" and "destination" features.
	var startPoint = new ol.Feature();
	var destPoint = new ol.Feature();

	// The vector layer used to display the "start" and "destination" features.
	var vectorLayer = new ol.layer.Vector({
  	  source: new ol.source.Vector({
    	  features: [startPoint, destPoint]
  	  })
	});
	
	map.addLayer(vectorLayer);

	// A transform function to convert coordinates from EPSG:3857
	// to EPSG:4326.
	var transform = ol.proj.getTransform('EPSG:3857', 'EPSG:4326');

	// Register a map click listener.
	map.on('click', function(event) { 
  	  if (startPoint.getGeometry() == null) {
    	    // First click.
    	    startPoint.setGeometry(new ol.geom.Point(event.coordinate));
  	  } 
  	  else if (destPoint.getGeometry() == null) { //destPoint.getGeometry()
    	    // Second click.
   	    destPoint.setGeometry(new ol.geom.Point(event.coordinate));

	    // Transform the coordinates from the map projection (EPSG:3857)
    	    // to the server projection (EPSG:4326).
    	    var startCoord = transform(startPoint.getGeometry().getCoordinates());
    	    var destCoord = transform(destPoint.getGeometry().getCoordinates());
    	    var viewparams = [
      	      'x1:' + startCoord[0], 'y1:' + startCoord[1],
      	      'x2:' + destCoord[0], 'y2:' + destCoord[1]
    	    ];
    
    	    params.viewparams = viewparams.join(';');
    	      result = new ol.layer.Image({
      	        source: new ol.source.ImageWMS({
                url: 'http://130.233.249.20:8080/geoserver/pgrouting/wms',
                params: params
      	      })
    	    });
            
   	    map.addLayer(result);
  	  }
	});

	var clearButton = document.getElementById('clear');
  	  clearButton.addEventListener('click', function(event) {
  	  // Reset the "start" and "destination" features.
  	  startPoint.setGeometry(null);
  	  destPoint.setGeometry(null);
  	  // Remove the result layer.
  	  map.removeLayer(result);
	});

}
