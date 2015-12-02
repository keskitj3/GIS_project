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

var format = 'image/png';
var liikuntapaikat_wms = new ol.layer.Image({
          source: new ol.source.ImageWMS({
            ratio: 1,
            url: 'http://130.233.249.20:8080/geoserver/WMS/wms',
            params: {'FORMAT': format,'VERSION': '1.1.1',  
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
	/*
	var mousePositionControl = new ol.control.MousePosition({
            className: 'custom-mouse-position',
            target: document.getElementById('location'),
            coordinateFormat: ol.coordinate.createStringXY(5),
            undefinedHTML: '&nbsp;'
	});
	*/

	var view = new ol.View({
	    center: [2779257.6943, 8439166.6796],
	    zoom: 12
	});

	var map = new ol.Map({

	  controls: ol.control.defaults({
	    attribution: false
	  }),//.extend([mousePositionControl]),

	  layers: [
	    new ol.layer.Tile({
	    source: new ol.source.OSM()
	  })],
	  target: "map",
	  view: view 
	});


/*
	var format = 'image/png';
	var liikuntapaikat_wms = new ol.layer.Image({
          source: new ol.source.ImageWMS({
            ratio: 1,
            url: 'http://130.233.249.20:8080/geoserver/WMS/wms',
            params: {'FORMAT': format,'VERSION': '1.1.1',  
                LAYERS: 'WMS:WFS_pisteet',
                STYLES: '',
            }
          })
        });
*/

	map.addLayer(liikuntapaikat_wms);


	//var parser = new ol.parser.GeoJSON();

	var vectorSource = new ol.source.GeoJSON({//Vector({
	  
	  'projection': map.getView().getProjection(),
	  'url': 'http://130.233.249.20:8080/geoserver/wfs?service=WFS&' +
	  	'version=1.1.0&request=GetFeature&typename=WMS:WFS_pisteet&' +
		'outputFormat=text/javascript&format_options=callback:loadFeatures&' + 
		'srsname=EPSG:3857&bbox=' + extent.join(',') + ',EPSG:3857';
	})
	  
/*	  format: new ol.format.GeoJSON(),
	  loader: function(extent, resolution, projection) {
    	    var url = 'http://130.233.249.20:8080/geoserver/wfs?service=WFS&' +
	  	'version=1.1.0&request=GetFeature&typename=WMS:WFS_pisteet&' +
		'outputFormat=text/javascript&format_options=callback:loadFeatures&' + 
		'srsname=EPSG:3857&bbox=' + extent.join(',') + ',EPSG:3857';
	    $.ajax({
		url: url,
		success: function(data) {
		  var features = geoJSONFormat.readFeatures(data);
        	  vectorSource.addFeature(features);
		  //vectorSource.addFeatures(vectorSource.readFeatures(data)); 
		}
		
          });
	  },
	  projection: 'EPSG:3857',
  	  strategy: ol.loadingstrategy.bbox
	});
*/	
	
	
/*
	window.loadFeatures = function(response) {
	  vectorSource.addFeatures(geojsonFormat.readFeatures(response));
	};
*/
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
	


	//Layerin nakyvyys napin takana
	nappi.addEventListener('change', function() {
  		var checked = this.checked;
  		if (checked !== liikuntapaikat_wms.getVisible()) {
    			liikuntapaikat_wms.setVisible(checked);
  		}
	});

	liikuntapaikat_wms.on('change:visible', function() {
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

	//Ttransform coordinates from EPSG:3857 to EPSG:4326.
	var transform = ol.proj.getTransform('EPSG:3857', 'EPSG:4326');


	//Geolocation asetetaan joka kerralla reitin aloituspisteeksi, kun ruksi ruksataan uudestaan
	var geolocation = new ol.Geolocation({
  	  projection: view.getProjection()//"ESPG:4326"
	});

	function el(id) {
  	  return document.getElementById(id);
	}

	el('track').addEventListener('change', function() {
  	  geolocation.setTracking(this.checked);
	});

	//Handle geolocation error.
	geolocation.on('error', function(error) {
  	  var info = document.getElementById('info');
  	  info.innerHTML = error.message;
  	  info.style.display = '';
	});

	var accuracyFeature = new ol.Feature();
	geolocation.on('change:accuracyGeometry', function() {
  	  accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
	});
	
	if (geolocation !== null) {
	  geolocation.on('change:position', function() {
  	    var coordinates = geolocation.getPosition();
	    startPoint.setGeometry(new ol.geom.Point(coordinates));
	  });
	}

	// Lopetuspiste tulee maaraytya vain kohteen sijainnin mukaan! ei tulisi pystya valitsemaan sita mielivaltaisesti ainakin nain alkuun.
	map.on('click', function(event) { 

          
	  // Hakee featureiden tietoja
	  var view = map.getView();
          var viewResolution = view.getResolution();
          var source = liikuntapaikat_wms.getSource();

	  document.getElementById('nodelist').innerHTML = '';
          var url = source.getGetFeatureInfoUrl(
            event.coordinate, viewResolution, view.getProjection(),
            {'INFO_FORMAT': 'text/html',
	     'propertyName': 'tyyppi_nimi_fi,nimi_fi'});
	   

	  // if feature clicked
	  // anna sen tiedot
	  // jos kayttaja painaa navigoi, niin kysy aloituspaikka, jos omaa sijaintia ei ole maaritelty
	  // aseta kohteen sijainti lopetuspisteeksi
	  // laske reitti

          if (url) { //ei rajoita ehtoa pelkÃ¤stÃ¤Ã¤n klikattavaan featureen
	    document.getElementById('nodelist').innerHTML = '<iframe seamless src="' + url  + '"></iframe>';        
 
	    // ensimmainen klikkaus, maaritellaan uusiksi, jos sita ei oo maaritelty sijainnin mukaan
	    if (startPoint.getGeometry() == null) {
    	      startPoint.setGeometry(new ol.geom.Point(event.coordinate));
  	    } 

	    // paamaara on talla hetkella vain kayttajan maarama joten se taytyy muokata
  	    else if (destPoint.getGeometry() == null) { //else if
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
