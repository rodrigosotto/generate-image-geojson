var mapnik = require('mapnik');

// Load the fonts
mapnik.register_default_input_plugins();
mapnik.register_default_fonts();
mapnik.register_system_fonts();

// Projection info
var srs = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 " +
  "+x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs";
var epsg = "+init=epsg:3857";

// Image size
var width = 1024;
var height = 768;
var xml = './geoJson.xml';


var map = new mapnik.Map(width, height);
map.load(xml, {
  strict: true
});
map.srs = srs; // Set the map projection that all layer will be translated too

var extentOfRouteWgs84 = null;
var layers = map.layers();

// Get the extent of the route layer this plus a buffer should dictate the bounds of the map
for (var i = 0; i < layers.length; i++) {
  var layer = layers[i];
  if (layer.name === 'route') {
    extentOfRouteWgs84 = layer.datasource.extent();
  }
}

var projection = new mapnik.Projection(epsg);

// Convert the bounds from Wgs84 (layer srs) to Lambert 93 (map srs)
map.extent = projection.forward(extentOfRouteWgs84);
map.zoomToBox(map.extent);

var img = new mapnik.Image(width, height);

map.render(img, {}, function(renderError, img) {
  img.saveSync('./myimage1.jpeg', 'jpeg');

  img = new mapnik.Image(width, height);

  var routeLayer = map.get_layer('route');
  console.log(routeLayer);
  routeLayer.active = false;

  map.render(img, {}, function(renderError, img) {
    img.saveSync('./myimage2.jpeg', 'jpeg');
  });
});