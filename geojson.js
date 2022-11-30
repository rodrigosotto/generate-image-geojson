const { default: rewind } = require("@turf/rewind");
const { default: center } = require("@turf/center");
const axios = require("axios");
const { centerOfMass } = require("@turf/turf");

var mapnik = require("mapnik");
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

async function getMapboxImage(lat, long, geoJsonCorret) {
    const mapBoxAPIKey =
        "pk.eyJ1IjoidGF0dWFnZ2lvIiwiYSI6ImNrc3piOGw1YzB4dG4ycnFpdmt6NGY2N2kifQ.Nqyq6en7l-YO3XMWa1gebw";
    const mapboxPrefix =
        "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/";
    const width = "1200";
    const heigth = "500";
    const zoom = "12.86";

    // const url = `${mapboxPrefix}/${long},${lat},${zoom}/${width}x${heigth}@2x?access_token=${mapBoxAPIKey}`;

    const url = 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/-122.3486,37.8169,14,0/1200x500@2x?access_token=pk.eyJ1IjoidGF0dWFnZ2lvIiwiYSI6ImNrc3piOGw1YzB4dG4ycnFpdmt6NGY2N2kifQ.Nqyq6en7l-YO3XMWa1gebw'


    let staticMapImage = await axios
        .get(url, { responseType: "arraybuffer" })
        .catch((error) => {
            console.log(error);
            // let returnedB64 = Buffer.from(staticMapImage).toString("base64"); //covertido para base64
            // return returnedB64;

        });

        fs.writeFileSync("bkgnd.jpg", staticMapImage.data);
}

async function getUrlJsonTrails() {
    const url = "http://localhost:3000/evento/";

    let evento = await axios.get(url, { responseType: "json" });
    //console.log(JSON.stringify("Todos os dados-->"evento.data.trails, "<--Final Todos os dados"));
    // console.log("dados geoJson-->", evento.data.trails.inst_rate, "<-- dados geoJson");

    convertTrailsToGeoJson(evento.data.trails.inst_rate, "Polygon");

    const geoJsonCorret = rewind(
        convertTrailsToGeoJson(evento.data.trails.inst_rate, "Polygon")
    );

    const [long, lat] = center(geoJsonCorret).geometry.coordinates;

    //gera o background satellite
    await getMapboxImage(lat, long, geoJsonCorret);

    //console.log(center(geoJsonCorret).geometry.coordinates)
}
getUrlJsonTrails();

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

function _createFeature(geometryType, coordinates, properties = {}) {
    const coordinateConverter =
        _getCutstomCoordToGeoJsonStdConverter(geometryType);

    return {
        type: GEOJSON_CONSTANTS.feature,
        geometry: {
            type: geometryType,
            coordinates: coordinateConverter(coordinates),
        },
        properties: properties,
    };
}

function _getCutstomCoordToGeoJsonStdConverter(geometryType) {
    const converter = {
        [GEOJSON_CONSTANTS.geometries.polygon]: _customPolygonToGeoJsonStandart,
        [GEOJSON_CONSTANTS.geometries.point]:
            _customAltimetryPointsToGeoJsonStandart,
    }[geometryType];

    if (!converter) throw new Error(`Geometry ${geometryType} not supported`);

    return converter;
}

function _customPolygonToGeoJsonStandart(coordinateArray) {
    let customPolyOnGeoJsonStd =
        _customPointsToGeoJsonStandart(coordinateArray);
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
        console.log();
    }

    return customCoordOnGeoJsonStd;
}

module.exports = {
    convertTrailsToGeoJson,
    GEOJSON_CONSTANTS,
};

if (process.env.NODE_ENV == "test") {
    module.exports = {
        convertTrailsToGeoJson,
        _createFeature,
        _getCutstomCoordToGeoJsonStdConverter,
        _customPolygonToGeoJsonStandart,
        _customAltimetryPointsToGeoJsonStandart,
        _firstAndLastCoordinatesDifferent,
        _customPointsToGeoJsonStandart,
        GEOJSON_CONSTANTS,
    };
}

// function convertToXml() {
//    // 1o PASSO precisa gerar automaticamnte o XML
//     mapnik.register_default_input_plugins();
//     var map = new mapnik.Map(1200, 500);
//     //const layer = new mapnik.Layer('./bkgnd.jpg')

//     map.add_layer(layer);
//     map.loadSync("./geoJson.xml");
//     map.zoomAll();
//     map.renderFileSync("exampleImageGeoJson.jpeg");

// }
// convertToXml();




