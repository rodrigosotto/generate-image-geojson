const geoJsonConverter = require('./geojson-converter');

const polygon = {
    coordinates : [
        {
          lat: -25.70196624868716,
          lng: -49.74740953576418,
        },
        {
          lat: -25.701949084229874,
          lng: -49.747514007596166,
        },
        {
          lat: -25.7019362808124,
          lng: -49.74750852898626,
        },
        {
          lat: -25.701924310027028,
          lng: -49.74750312731423,
        },
    ],
    properties: {
        prop: 12
    },
}

const expectedFeature = {
    type: geoJsonConverter.GEOJSON_CONSTANTS.feature,
    geometry: {
        type: geoJsonConverter.GEOJSON_CONSTANTS.geometries.polygon,
        coordinates: [
            [
                [
                    -49.74740953576418,
                    -25.70196624868716,
                ],
                [
                    -49.747514007596166,
                    -25.701949084229874,
                ],
                [
                    -49.74750852898626,
                    -25.7019362808124,
                ],
                [
                    -49.74750312731423,
                    -25.701924310027028,
                ],
                [
                    -49.74740953576418,
                    -25.70196624868716,
                ],
            ],
        ],
    },
    properties: {
        prop: 12,
    },
};

const expectedGeoJson = {
    'type': geoJsonConverter.GEOJSON_CONSTANTS.featureCollection,
    'features': [expectedFeature],
}

describe('_customPointsToGeoJsonStandart function' , () => {
    const arrayOfPoints = [
        {
            lng: 1,
            lat: 2,
        },
        {
            lng: 3,
            lat: 4,
        },
    ];

    it('should return an array of the same size as input', () => {
        const result = geoJsonConverter._customPointsToGeoJsonStandart(arrayOfPoints);
        expect(result.length).toEqual(arrayOfPoints.length);
    });

    it('shoud take an array of objects containing "lat" and "lng" fields and return them as array of [lng, lat]', () => {
        const result = geoJsonConverter._customPointsToGeoJsonStandart(arrayOfPoints);
        expect(result[0][0]).toEqual(arrayOfPoints[0].lng);
        expect(result[0][1]).toEqual(arrayOfPoints[0].lat);
        expect(result[1][0]).toEqual(arrayOfPoints[1].lng);
        expect(result[1][1]).toEqual(arrayOfPoints[1].lat);
    });
});

describe('_firstAndLastCoordinatesDifferent function', () => {
    const coords = [
        [0,0],
        [0,1],
        [1,1],
        [1,0],
    ]
    it('should return true if the first and last coordinates of an array are different', () => {
        expect(geoJsonConverter._firstAndLastCoordinatesDifferent(coords))
        .toEqual(true);
    });

    it('should return false if the first and last coordinates of an array are equal', () => {
        coords.push(coords[0]);
        expect(geoJsonConverter._firstAndLastCoordinatesDifferent(coords))
        .toEqual(false);
    });
});

describe('_customAltimetryPointsToGeoJsonStandart function', () => {
    it('should return the first element from the input array of objects as an array of [longitude, latitude]', () => {
        const arrayOfCoord = [
            {
                latitude: 10,
                longitude: 20,
            }
        ];

        const expectedResult =
            [arrayOfCoord[0].longitude, arrayOfCoord[0].latitude];

        const result =
            geoJsonConverter._customAltimetryPointsToGeoJsonStandart(arrayOfCoord);

        expect(result).toEqual(expectedResult);
    });
});

describe('_customPolygonToGeoJsonStandart function', () => {
    const polygons = [
        {
            lat: 0,
            lng: 0,
        },
        {
            lat: 1,
            lng: 0,
        },
        {
            lat: 1,
            lng: 1,
        },
        {
            lat: 0,
            lng: 1,
        },
    ];

    it('should convert a polygon with {lat:, lng:} fields to an array in geoJson standart [lng, lat]', () => {
        const result = geoJsonConverter._customPolygonToGeoJsonStandart(polygons);
        const firstVertexFromFirstPolygon = result[0][0];
        expect(firstVertexFromFirstPolygon[0]).toEqual(polygons[0].lng);
        expect(firstVertexFromFirstPolygon[1]).toEqual(polygons[0].lat);
    });

    it('should return an array with coordinates where the last one is equal to the first', () => {
        const result = geoJsonConverter._customPolygonToGeoJsonStandart(polygons);
        const lastVertexFromFirstPolygon = result[0][result[0].length - 1];
        expect(lastVertexFromFirstPolygon[0]).toEqual(polygons[0].lng);
        expect(lastVertexFromFirstPolygon[1]).toEqual(polygons[0].lat);
    });
});

describe('_getCutstomCoordToGeoJsonStdConverter function', () => {
    it('should throw an error if not supported geometry type is given', () => {
        expect(() => {
            geoJsonConverter._customCoordinatesToGeoJsonStandart('whatever');
        })
        .toThrow();
    });

    it('should return _customPolygonToGeoJsonStandart function if Polygon is given as geometry type', () => {
        const converterFunction =
            geoJsonConverter._getCutstomCoordToGeoJsonStdConverter(
                geoJsonConverter.GEOJSON_CONSTANTS.geometries.polygon
            );

        expect(converterFunction)
        .toBe(geoJsonConverter._customPolygonToGeoJsonStandart);
    });

    it('should return _customAltimetryPointsToGeoJsonStandart function if Point is given as geometry type', () => {
        const converterFunction =
            geoJsonConverter._getCutstomCoordToGeoJsonStdConverter(
                geoJsonConverter.GEOJSON_CONSTANTS.geometries.point
            );

        expect(converterFunction)
        .toBe(geoJsonConverter._customAltimetryPointsToGeoJsonStandart);
    });
});

describe('_createFeature method', () => {
    it('should return a geoJson feature based on input data', () => {
        const result =
            geoJsonConverter._createFeature(
                'Polygon',
                polygon.coordinates,
                polygon.properties);

        expect(result).toEqual(expectedFeature);
    });
});

describe('convertTrailsToGeoJson', () => {
    it('should generate a geojson based on trails and geometry type', () => {
        const trails = [polygon]
        const result =
            geoJsonConverter.convertTrailsToGeoJson(
                trails,
                geoJsonConverter.GEOJSON_CONSTANTS.geometries.polygon);

        expect(result).toEqual(expectedGeoJson);
    });
});