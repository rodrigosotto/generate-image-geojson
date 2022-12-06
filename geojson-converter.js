const { default: rewind } = require("@turf/rewind");
const { default: center } = require("@turf/center");
const axios = require("axios");
const { centerOfMass } = require("@turf/turf");

const geojsonData = require("./1db.json");

var mapnik = require("mapnik");

// var mapnikify = require('mapnikify');
// var myRequest = require('needle').defaults({
//   timeout: 10000,
//   followRedirect: false
// });

var fs = require("fs");

const GEOJSON_CONSTANTS = {
  featureCollection: "FeatureCollection",
  feature: "Feature",
  geometries: {
    point: "Point",
    polygon: "Polygon",
  },
};

//CRIANDO UM ARQUIVO COM O JSON GEOJSON CORRETO
//TODO: QUANDO UM POLIGONO É PROCESSADO SE ELE ESTIVER TORCIDO ELE NEM PROCESSA??  (confirmar com o RENAN)
//TODO: PRECISA GERAR A LEGENDA COM OS VALORES DA LEGENDA PARA MOSTRAR AS CORES. POPULAR A PROPERTY COM VALUE OPERATION (ver como esta sendo feito no front)
//TODO: CRIAR A FUNÇÃO PARA GERAR IMAGENS ATRAVÉS DO GEOJSON

//CONVERTE DADOS DE GEOLOCALIZAÇÃO EM UMA IMG QUE SERA USADA COMO BKGND PARA OS RASTROS (TRAILS)
async function getMapboxImage(lat, long, geoJsonCorret) {
  const mapBoxAPIKey =
    "pk.eyJ1IjoidGF0dWFnZ2lvIiwiYSI6ImNrc3piOGw1YzB4dG4ycnFpdmt6NGY2N2kifQ.Nqyq6en7l-YO3XMWa1gebw";
  const mapboxPrefix =
    "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/";
  const width = "400";
  const heigth = "400";
  const zoom = "13.86";

  // const url = `${mapboxPrefix}/${long},${lat},${zoom}/${width}x${heigth}@2x?access_token=${mapBoxAPIKey}`;

  const url =
    "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/44.62714,4.84732,14,0/600x500@2x?access_token=pk.eyJ1IjoidGF0dWFnZ2lvIiwiYSI6ImNrc3piOGw1YzB4dG4ycnFpdmt6NGY2N2kifQ.Nqyq6en7l-YO3XMWa1gebw";

  let staticMapImage = await axios
    .get(url, { responseType: "arraybuffer" })
    .catch((error) => {
      console.log(error);
      // let returnedB64 = Buffer.from(staticMapImage).toString("base64"); //covertido para base64
      // return returnedB64;
    });

  fs.writeFileSync("bkgnd.jpg", staticMapImage.data);
}

function _createFeature(geometryType, coordinates, properties = {}) {
  const coordinateConverter =
    _getCustomCoordToGeoJsonStdConverter(geometryType);

  return {
    type: GEOJSON_CONSTANTS.feature,
    geometry: {
      type: geometryType,
      coordinates: coordinateConverter(coordinates),
    },
    properties: properties,
  };
}

function _getCustomCoordToGeoJsonStdConverter(geometryType) {
  const converter = {
    [GEOJSON_CONSTANTS.geometries.polygon]: _customPolygonToGeoJsonStandart,
    [GEOJSON_CONSTANTS.geometries.point]:
      _customAltimetryPointsToGeoJsonStandart,
  }[geometryType];

  if (!converter) throw new Error(`Geometry ${geometryType} not supported`);

  return converter;
}

function _customPolygonToGeoJsonStandart(coordinateArray) {
  let customPolyOnGeoJsonStd = _customPointsToGeoJsonStandart(coordinateArray);
  if (_firstAndLastCoordinatesDifferent(customPolyOnGeoJsonStd)) {
    const lastCoordinate = [coordinateArray[0].lng, coordinateArray[0].lat];
    customPolyOnGeoJsonStd.push(lastCoordinate);
  }

  return [customPolyOnGeoJsonStd];
}

function _customAltimetryPointsToGeoJsonStandart(coordinateArray) {
  const coordinates = coordinateArray[0];
  return [coordinates.longitude, coordinates.latitude];
}

function _firstAndLastCoordinatesDifferent(coordinates) {
  return (
    coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
    coordinates[0][1] !== coordinates[coordinates.length - 1][1]
  );
}

function _customPointsToGeoJsonStandart(coordinateArray) {
  let customCoordOnGeoJsonStd = [];
  if (coordinateArray instanceof Array) {
    coordinateArray.forEach((coordinate) => {
      customCoordOnGeoJsonStd.push([coordinate.lng, coordinate.lat]);
    });
  } else {
    console.log("sei la o que vai dar");
  }

  return customCoordOnGeoJsonStd;
}

function convertTrailsToGeoJson(trails, geometryType) {
  const geoJsonFeatures = trails.map((poly) => {
    return _createFeature(geometryType, poly.paths);
  });

  const geoJson = {
    type: GEOJSON_CONSTANTS.featureCollection,
    features: geoJsonFeatures,
  };
  return geoJson;
}

module.exports = {
  convertTrailsToGeoJson,
  GEOJSON_CONSTANTS,
};

if (process.env.NODE_ENV == "test") {
  module.exports = {
    convertTrailsToGeoJson,
    _createFeature,
    _getCutstomCoordToGeoJsonStdConverter: _getCustomCoordToGeoJsonStdConverter,
    _customPolygonToGeoJsonStandart,
    _customAltimetryPointsToGeoJsonStandart,
    _firstAndLastCoordinatesDifferent,
    _customPointsToGeoJsonStandart,
    GEOJSON_CONSTANTS,
  };
}

async function getUrlJsonTrails() {
  const url = "http://localhost:3000/evento/";

  let evento = await axios.get(url, {});
  //console.log(JSON.stringify("Todos os dados-->"evento.data.trails, "<--Final Todos os dados"));
  // console.log("dados geoJson-->", evento.data.trails.inst_rate, "<-- dados geoJson");
  convertTrailsToGeoJson(geojsonData.evento.trails.inst_rate, "Polygon");

  const geoJsonCorret = rewind(
    convertTrailsToGeoJson(geojsonData.evento.trails.inst_rate, "Polygon")
  );

  const [long, lat] = center(geoJsonCorret).geometry.coordinates;

  //gera o background satellite
  await getMapboxImage(lat, long, geoJsonCorret);

  console.log(center(geoJsonCorret).geometry.coordinates);
}

getUrlJsonTrails();

// function convertGeoJsonInXmlFile(){
//     mapnik.register_default_fonts();
//     mapnik.register_default_input_plugins();
//     const geoData = gejson;

//     var width = 1024;
//     var height = 768;
//     map.load(geoJson, function(err, map) {
//     var map = new mapnik.Map(width, height);
//       map.render(image, function(err, image) {
//         map.save('./xnovoDolomito.xml');
//     //   image.save('trailsImage.xml', function() {
//     //     console.log("imagem foi salva!")
//     //   });
//     });
// });

// }

// convertGeoJsonInXmlFile();

function convertXmlInImg() {
// register fonts and datasource plugins
mapnik.register_default_fonts();
mapnik.register_default_input_plugins();

var width = 1024;
var height = 768;

var map = new mapnik.Map(width, height);
var xmlFile = './dolomitoGeojson.xml';

map.load(xmlFile, function(err, map) {

    map.zoomAll();

    var image = new mapnik.Image(width, height, {
        premultiplied: true,
    });

    map.render(image, function(err, image) {

      image.save('rastrosImage.png', function() {
        console.log("imagem foi salva!")
      });
    });
});
}
convertXmlInImg();
