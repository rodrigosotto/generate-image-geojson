var mapnik = require("mapnik");
var mapnikify = require("@mapbox/geojson-mapnikify");

const { default: bbox } = require("@turf/bbox");
const { default: rewind } = require("@turf/rewind");

const axios = require("axios");

var fs = require("fs");
const sphericalmercator = require("@mapbox/sphericalmercator");

var width = 1024;
var height = 1024;

var outputFilename = (rasterName) => `./assets/imagesFiles/imageRaster_${rasterName}.png`;


/* read GeoJSON into variable */
// var filename = "./assets/geojsonFiles/dolomito.geojson";

var filename = "./assets/jsonFiles/PIGENTE.NVG.JSON";

var geojson = JSON.parse(fs.readFileSync(filename));

const features = geojson.evento.trails.inst_rate.map(
  (instRate) => rewind({
          type: 'Feature',
          properties: {
            "fill":"#ff0000"
          },
          geometry: {
              type: 'Polygon',
              coordinates: [
                  [
                      ...instRate.paths.map(
                          (element) => [
                              element.lng,
                              element.lat,
                          ]
                      ),
                      [instRate.paths[0].lng, instRate.paths[0].lat],
                  ],
              ],
          },
      })
);

const featuresSpeed = geojson.evento.trails.speed.map(
  (speed) => rewind({
          type: 'Feature',
          properties: {},
          geometry: {
              type: 'Polygon',
              coordinates: [
                  [
                      ...speed.paths.map(
                          (element) => [
                              element.lng,
                              element.lat,
                          ]
                      ),
                      [speed.paths[0].lng, speed.paths[0].lat],
                  ],
              ],
          },
      })
);

const featureCollection = {
  type: 'FeatureCollection',
  features,
};

const featureCollectionSpeed = {
  type: 'FeatureCollection',
  features: featuresSpeed
};

// const result = await generateThumbnailImage(featureCollection).catch(
//   (err) => err
// );

// if (result.backgroundImage && result.rasterImage) {
//   console.log("Resultado Background",result.backgroundImage);
//   console.log("Resultado Rastros",result.rasterImage);
// }


// console.log(4, params, 4);
// console.log(5, params.data?.event, 5);


/* convert GeoJSON to Mapnik XML */
generateImageFromGeojson(featureCollection, "instRate");

generateImageFromGeojson(featureCollectionSpeed, "speed");


function generateImageFromGeojson(featureCollection, trailsFileName) {
  mapnikify(featureCollection, false, function (err, xml) {
    if (err)
      throw err;

    const geojsonBBox = bbox(featureCollection);
    /* render the Mapnik XML */
    var map = new mapnik.Map(width, height);

    mapnik.register_default_input_plugins();

    map.fromString(xml, {}, function (err, map) {
      if (err)
        throw err;

      var im = new mapnik.Image(width, height, {
        premultiplied: false,
      });

      var merc = new sphericalmercator({
        size: 1024,
        antimeridian: false,
      });

      map.zoomToBox(merc.convert(geojsonBBox, "900913"));

      map.render(im, function (err, im) {
        if (err)
          throw err;
        getMapboxImage(geojsonBBox).then(
          (backgroundImage) => {
            im.encode("png", function (err, buffer) {
              if (err)
                throw err;
                let returnedB64Raster = Buffer.from(buffer).toString("base64");
                console.log("Rastro->",returnedB64Raster, "<- Rastro");
            //   fs.writeFile(outputFilename(trailsFileName), buffer, function (err) {
            //     if (err)
            //       throw err;
            //     console.log("Imagem do rastro salva em: " + outputFilename(trailsFileName));
            //   });
            //   fs.writeFileSync(`./assets/txtFiles/${(new Date().getTime())}-rasterMapBase64File.txt`, returnedB64Raster);
            });

            //console.log("SUCESSO IMAGEM DO RASTRO GERADA!");

          },
          (err) => {
            console.log(err);
          }
        );
      });
    });
  });
}

//generate background image
async function getMapboxImage(bbox) {
  const mapBoxAPIKey =
    "pk.eyJ1IjoidGF0dWFnZ2lvIiwiYSI6ImNrc3piOGw1YzB4dG4ycnFpdmt6NGY2N2kifQ.Nqyq6en7l-YO3XMWa1gebw";
  const mapboxPrefix =
    "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static";
  const sizeMap = "512x512";

  const url = `${mapboxPrefix}/[${bbox}]/${sizeMap}@2x?access_token=${mapBoxAPIKey}`;

  let staticMapImage = await axios
    .get(url, { responseType: "arraybuffer" })
    .catch((error) => {
      console.log(error);
      return returnedB64Background;
    });
    let returnedB64Background = Buffer.from(staticMapImage.data).toString("base64");
    //gera um arquivo de imagem com background da imagem de satelite
//   fs.writeFileSync(`./assets/imagesFiles/${(new Date().getTime())}-backgroundImageMap.jpeg`, staticMapImage.data);
//   fs.writeFileSync(`./assets/txtFiles/${(new Date().getTime())}-backgroundBase64.txt`, returnedB64);

  console.log("Background ->",returnedB64Background,"<- Background");
  return returnedB64Background;

}
