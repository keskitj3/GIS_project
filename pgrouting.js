(function() {
    var cors_api_host = 'cors-anywhere.herokuapp.com';
    var cors_api_url = 'https://' + cors_api_host + '/';
    var slice = [].slice;
    var origin = window.location.protocol + '//' + window.location.host;
    var open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        var args = slice.call(arguments);
        var targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[1]);
        if (targetOrigin && targetOrigin[0].toLowerCase() !== origin &&
            targetOrigin[1] !== cors_api_host) {
            args[1] = cors_api_url + args[1];
        }
        return open.apply(this, args);
    };
})();

//OpenLayers.ProxyHost = "/cgi-bin/proxy.cgi?url=";

var liikuntapaikat_wms = new ol.layer.Image({
          source: new ol.source.ImageWMS({
            ratio: 1,
            url: 'http://130.233.249.20:8080/geoserver/WMS/wms',
            params: {'FORMAT': 'image/png','VERSION': '1.1.1',  
                LAYERS: 'WMS:WFS_pisteet',
                STYLES: '',
            }
          })
        });

//filtterÃƒÂ¶inti
	
//liikuntapaikat_wms.updateParams({CQL_FILTER: 'tyyppikoodi = 2120'});

filterParamsu = {
	    'FILTER': null,
	    'CQL_FILTER': null,
	    'FEATUREID': null
};

function updateFilter(number) {
/*	filterParamsu = {
	    'FILTER': null,
	    'CQL_FILTER': null,
	    'FEATUREID': null
	};
*/	var number = number
/*	if (number != "") {
		liikuntapaikat_wms.getSource().updateParams(filterParams);
	return
	}
*/	var filtteri = "tyyppikoodi " + number
	filterParamsu["CQL_FILTER"] = filtteri//"tyyppikoodi = 2120"
	liikuntapaikat_wms.getSource().updateParams(filterParamsu);
	}

function searchFilter() {
	var filterType = document.getElementById('filterType').value;
	filter = document.getElementById('filter').value;
        // by default, reset all filters
        var filterParamss = {
          'FILTER': null,
          'CQL_FILTER': null,
          'FEATUREID': null
        };
        if (filter.replace(/^\s\s*/, '').replace(/\s\s*$/, '') != "") {
/*          if (filterType == "cql") {
            filterParams["CQL_FILTER"] = filter;
          }
          if (filterType == "ogc") {
            filterParams["FILTER"] = filter;
          }
          if (filterType == "fid")
            filterParams["FEATUREID"] = filter;
          }
*/          // merge the new filter definitions
	  filterParamss["CQL_FILTER"] = filterType + "'%" + filter + "%'" 
          liikuntapaikat_wms.getSource().updateParams(filterParamss)
          };
        }

function resetFilter() {
          document.getElementById('filter').value = null;
          liikuntapaikat_wms.getSource().updateParams(filterParamsu);
        }



function init() {

	var view = new ol.View({
	    center: [2779257.6943, 8439166.6796],
	    zoom: 12
	});

	var map = new ol.Map({

	  controls: ol.control.defaults({
	    attribution: false
	  }),
	  layers: [
	    new ol.layer.Tile({
	    source: new ol.source.OSM()
	  })],
	  target: "map",
	  view: view 
	});
	map.addControl(new ol.control.Zoom());

	//map.addLayer(liikuntapaikat_wms);



	// WFS-layer
	var geoJSONFormat = new ol.format.GeoJSON();

	var vectorSource = new ol.source.Vector({
	  loader: function(extent, resolution, projection) {
    	    var url = 'http://130.233.249.20:8080/geoserver/wfs?service=WFS&' +
	  	'version=1.1.0&request=GetFeature&typename=WMS:WFS_pisteet&' +
		'outputFormat=application/json&srsname=EPSG:3857&' +
		'maxFeatures=5000&bbox=' + extent.join(',') + ',EPSG:3857';
	    $.ajax(url).then(function(response) {
		  var features = geoJSONFormat.readFeatures(response, {
			featureProjection: projection
		  });
		  vectorSource.addFeatures(features); 
            });
	  },
  	  strategy: ol.loadingstrategy.bbox
	});

	var wfs_layer = new ol.layer.Vector({
  	  source: vectorSource,
  	  style: new ol.style.Style({
	    image: new ol.style.Circle({
	      radius: 6,
	      fill: new ol.style.Fill({color: 'rgba(57,155,221,1)'}),
	      stroke: new ol.style.Stroke({color: 'rgba(31,119,180,1)', width: 2})
    	    })
 	  })
	});

	map.addLayer(wfs_layer);

	// when the user moves the mouse, get the name property
      // from each feature under the mouse and display it
/*      function onMouseMove(browserEvent) {
        var coordinate = browserEvent.coordinate;
            var pixel = map.getPixelFromCoordinate(coordinate);
            var el = document.getElementById('name');
            el.innerHTML = '';
            map.forEachFeatureAtPixel(pixel, function(feature) {
               el.innerHTML += feature.get('nimi_fi') + feature.get("tyyppi_nimi_fi") +'<br>';
            });	
      }
      map.on('pointermove', onMouseMove);
*/
	//Layerin nakyvyys napin takana
	nappi.addEventListener('change', function() {
  		var checked = this.checked;
  		if (checked !== wfs_layer.getVisible()) {
    			wfs_layer.setVisible(checked);
  		}
	});

	wfs_layer.on('change:visible', function() {
  		var visible = this.getVisible();
  		if (visible !== nappi.checked) {
    			nappi.checked = visible;
  		}
	});



	//pgRoutingin toiminnot
	var params = {
  	  LAYERS: 'pgrouting:pgrouting',
  	  FORMAT: 'image/png'
	};

	// The "start" and "destination" features.
	var startPoint = new ol.Feature();
	var destPoint = new ol.Feature();

	// The vector layer for the "start" and "destination" features.
	var vectorLayer = new ol.layer.Vector({
  	  source: new ol.source.Vector({
    	  	features: [startPoint, destPoint]
  	  })
	});

	map.addLayer(vectorLayer);

	//Transform coordinates from EPSG:3857 to EPSG:4326.
	var transform = ol.proj.getTransform('EPSG:3857', 'EPSG:4326');


	//Geolocation, asettaa samalla reitinhaun aloitussijainnin
	var geolocation = new ol.Geolocation({
	  trackingOptions: {
	    enableHighAccuracy: true
	  },
  	  projection: view.getProjection()
	});

	function el(id) {
  	  return document.getElementById(id);
	}

/*
	var paikannus = document.getElementById('id');
	paikannus.addEventListener('change', function(event) {
	  geolocation.setTracking(this.checked);
	});
*/

	el('track').addEventListener('change', function() {
  	  geolocation.setTracking(this.checked);
	});

	if (geolocation !== null) {
	  geolocation.once('change', function() {
  	    var coordinates = geolocation.getPosition();
	    startPoint.setGeometry(new ol.geom.Point(coordinates));
	    view.setCenter(coordinates);
	  });
	}

	//Layerin valitseminen
	var select = null
	var selectSingleClick = new ol.interaction.Select();
	var select = selectSingleClick;

	map.addInteraction(select);
	
	//Laskee reitin valmiiksi kutsuttavaksi ja palauttaa feature infon
	map.on('click', function(event) { 
	 
	  var feature = map.forEachFeatureAtPixel(event.pixel,
	    function(feature, layer) {
	      return feature;
	  });

	  //Rajoittaa kartalla klikatun kohteen vain featureen
	  if (feature) {

	    geometry = feature.getGeometry();
	    coord = geometry.getCoordinates();

	    // Hakee featureiden tietoja
	    var view = map.getView();
            var viewResolution = view.getResolution();
            var source = liikuntapaikat_wms.getSource();
		
	    //var coordinate = browserEvent.coordinate;
            var pixel = map.getPixelFromCoordinate(coord);
            var el = document.getElementById('name');
            el.innerHTML = '';
            map.forEachFeatureAtPixel(pixel, function(feature) {
               el.innerHTML +=  feature.get("tyyppi_nimi_fi") +"  "+ feature.get('nimi_fi') + '<br>';
            });	
		
	    document.getElementById('information').innerHTML = '';
            var url = source.getGetFeatureInfoUrl(
              event.coordinate, viewResolution, view.getProjection(),
              {'INFO_FORMAT': 'text/html',
	       'propertyName': 'tyyppi_nimi_fi,nimi_fi'});

	    if (url) {
	      document.getElementById('information').innerHTML = '<iframe seamless src="' + url  + '"></iframe>';
	    }	   
	  }
	});

	//Lisaa lasketun reitin kartalle	
	var navigate = document.getElementById('navigate');
	navigate.addEventListener('click', function(event) {
	   

	    //Asettaa loppupisteen vain featureen
  	    if (destPoint.getGeometry() == null) {
   	      destPoint.setGeometry(new ol.geom.Point(coord));

	      // Transform from EPSG:3857 to EPSG:4326
    	      var startCoord = transform(startPoint.getGeometry().getCoordinates());
    	      var destCoord = transform(destPoint.getGeometry().getCoordinates());
    	      var viewparams = [
      	        'x1:' + startCoord[0], 'y1:' + startCoord[1],
      	        'x2:' + destCoord[0], 'y2:' + destCoord[1]
    	      ];
 
	      //Lahettaa parametrit palvelimelle, joka laskee reitin 
    	      params.viewparams = viewparams.join(';');
    	      result = new ol.layer.Image({
      	        source: new ol.source.ImageWMS({
                  url: 'http://130.233.249.20:8080/geoserver/pgrouting/wms',
                  params: params
      	        })
    	      });
	
	      result.addEventListener('change', function() {
		result.getSource().changed();
		//result.getSource().updateParams(params);
	      });

   	      map.addLayer(result);
  	    }
	  //} 
	});

	//Lisaa aloitussijainti, jos omaa sijaintia ei voida kayttaa
	var new_start_point = document.getElementById('new_start');
	new_start_point.addEventListener('click', function(event) {
	  startPoint.setGeometry(null);
	  map.once('click', function(event) {
	    startPoint.setGeometry(new ol.geom.Point(event.coordinate));
	  });
	});
/*
	//Lisaa lasketun reitin kartalle	
	var navigate = document.getElementById('navigate');
	navigate.addEventListener('click', function(event) {
	  map.addLayer(result);
	});
*/
	//Poistaa kartalle lisatys reitin
	var clearButton = document.getElementById('clear');
  	clearButton.addEventListener('click', function(event) {
  	  //startPoint.setGeometry(null);
  	  destPoint.setGeometry(null);
  	  map.removeLayer(result);
	});

}
