var mapnik = require("mapnik");
var mapnikify = require("@mapbox/geojson-mapnikify");
const { default: bbox } = require("@turf/bbox");
const axios = require("axios");

var fs = require("fs");
const sphericalmercator = require("@mapbox/sphericalmercator");
const { mainModule } = require("process");

var width = 1024;
var height = 1024;
var outputFilename = "xexample2.png";

/* read GeoJSON into variable */
var filename = "./simple.geojson";
var geojson = JSON.parse(fs.readFileSync(filename));

/* convert GeoJSON to Mapnik XML */
mapnikify(geojson, false, function (err, xml) {
  if (err) throw err;

  const geojsonBBox = bbox(geojson);
  /* render the Mapnik XML */
  var map = new mapnik.Map(width, height);

  mapnik.register_default_input_plugins();

  map.fromString(xml, {}, function (err, map) {
    //console.log("XML AQUI--->", xml, "<---XML AQUI");
    if (err) throw err;

    var im = new mapnik.Image(width, height, {
      premultiplied: false,
    });

    var merc = new sphericalmercator({
      size: 1024,
      antimeridian: false,
    });

    map.zoomToBox(merc.convert(geojsonBBox, "900913"));

    map.render(im, function (err, im) {
      if (err) throw err;
      //console.log("IM-->", im);
      getMapboxImage(geojsonBBox).then(
        (backgroundImage) => {
            im.encode("png", function (err, buffer) {
              if (err) throw err;
              let returnedB64Raster = Buffer.from(buffer).toString("base64");
              // fs.writeFile(outputFilename, buffer, function (err) {
              //   if (err) throw err;
              //   console.log("saved map image to " + outputFilename);
              // });
              fs.writeFileSync("XrasterBase64.txt", returnedB64Raster);
            });
            
          console.log("SUCESSO");
        },
        (err) => {
          console.log(err);
        }
      );
    });
  });
});

//generate background image
async function getMapboxImage(bbox) {
  const mapBoxAPIKey =
    "pk.eyJ1IjoidGF0dWFnZ2lvIiwiYSI6ImNrc3piOGw1YzB4dG4ycnFpdmt6NGY2N2kifQ.Nqyq6en7l-YO3XMWa1gebw";
  const mapboxPrefix =
    "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static";
  const sizeMap = "512x512";

  // const url = `${mapboxPrefix}/${long},${lat},${zoom}/${width}x${heigth}@2x?access_token=${mapBoxAPIKey}`;

  const url = `${mapboxPrefix}/[${bbox}]/${sizeMap}@2x?access_token=${mapBoxAPIKey}`;

  let staticMapImage = await axios
    .get(url, { responseType: "arraybuffer" })
    .catch((error) => {
      console.log(error);
      return returnedB64;
    });
    let returnedB64 = Buffer.from(staticMapImage.data).toString("base64"); //covertido para base64
    //console.log("base64-->",returnedB64);
    
  //fs.writeFileSync("Xbkgnd2.jpg", staticMapImage.data);
  fs.writeFileSync("Xbase64Bckgnd.txt", returnedB64);

  return returnedB64;
}
