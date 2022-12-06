const { default: rewind } = require("@turf/rewind");
const { default: center } = require("@turf/center");
const { centerOfMass } = require("@turf/turf");

const geojsonData = require("./geo.json");
// const geojsonDataNew = `{
//     "type": "FeatureCollection",
//     "features": [
//       {
//         "type": "Feature",
//         "properties": {},
//         "geometry": {
//           "coordinates": [
//             [
//               [
//                 -23.281396477060184,
//                 35.27576707017387
//               ],
//               [
//                 -23.281396477060184,
//                 -18.87450334024051
//               ],
//               [
//                 122.52847330805724,
//                 -18.87450334024051
//               ],
//               [
//                 122.52847330805724,
//                 35.27576707017387
//               ],
//               [
//                 -23.281396477060184,
//                 35.27576707017387
//               ]
//             ]
//           ],
//           "type": "Polygon"
//         }
//       },
//       {
//         "type": "Feature",
//         "properties": {},
//         "geometry": {
//           "coordinates": [
//             [
//               [
//                 -208.79145198498082,
//                 22.323208724918814
//               ],
//               [
//                 -208.79145198498082,
//                 -15.211823299859375
//               ],
//               [
//                 -56.39465145730918,
//                 -15.211823299859375
//               ],
//               [
//                 -56.39465145730918,
//                 22.323208724918814
//               ],
//               [
//                 -208.79145198498082,
//                 22.323208724918814
//               ]
//             ]
//           ],
//           "type": "Polygon"
//         }
//       }
//     ]
//   }
// `


var mapnik = require("mapnik");
var fs = require("fs");
var map = new mapnik.Map(256, 256);

mapnik.register_default_fonts();
mapnik.register_default_input_plugins();

var vt = new mapnik.VectorTile(1, 1, 1, {
    tile_size: 256,
});

vt.addGeoJSON(JSON.stringify(geojsonData), "layer-name", {});
var im = new mapnik.Image(256, 256);

 

// var vt = new mapnik.VectorTile(0,0,0);
var tileSize = vt.tileSize;
var map = new mapnik.Map(tileSize, tileSize);
vt.render(map, im, function(err, image) {
  if (err) throw err;   
  // save the rendered image to an existing image file somewhere
  // see mapnik.Image for available methods
  image.save('fileNew.png', 'png');
});