var Cartesian3=require('./Cartesian3');
var Check=require('./Check');
var defined=require('./defined');
var defineProperties=require('./defineProperties');
var GeocodeType=require('./GeocodeType');
var Rectangle=require('./Rectangle');
var Resource=require('./Resource');

    'use strict';

    /**
     * Provides geocoding via a {@link https://pelias.io/|Pelias} server.
     * @alias PeliasGeocoderService
     * @constructor
     *
     * @param {Resource|String} url The endpoint to the Pelias server.
     *
     * @example
     * // Configure a Viewer to use the Pelias server hosted by https://geocode.earth/
     * var viewer = new Cesium.Viewer('cesiumContainer', {
     *   geocoder: new Cesium.PeliasGeocoderService(new Cesium.Resource({
     *     url: 'https://api.geocode.earth/v1/',
     *       queryParameters: {
     *         api_key: '<Your geocode.earth API key>'
     *     }
     *   }))
     * });
     */
    function PeliasGeocoderService(url) {
        //>>includeStart('debug', pragmas.debug);
        Check.defined('url', url);
        //>>includeEnd('debug');

        this._url = Resource.createIfNeeded(url);
        this._url.appendForwardSlash();
    }

    defineProperties(PeliasGeocoderService.prototype, {
        /**
         * The Resource used to access the Pelias endpoint.
         * @type {Resource}
         * @memberof PeliasGeocoderService.prototype
         * @readonly
         */
        url: {
            get: function () {
                return this._url;
            }
        }
    });

    /**
     * @function
     *
     * @param {String} query The query to be sent to the geocoder service
     * @param {GeocodeType} [type=GeocodeType.SEARCH] The type of geocode to perform.
     * @returns {Promise<GeocoderService~Result[]>}
     */
    PeliasGeocoderService.prototype.geocode = function(query, type) {
        //>>includeStart('debug', pragmas.debug);
        Check.typeOf.string('query', query);
        //>>includeEnd('debug');

        var resource = this._url.getDerivedResource({
            url: type === GeocodeType.AUTOCOMPLETE ? 'autocomplete' : 'search',
            queryParameters: {
                text: query
            }
        });

        return resource.fetchJson()
            .then(function (results) {
                return results.features.map(function (resultObject) {
                    var destination;
                    var bboxDegrees = resultObject.bbox;

                    if (defined(bboxDegrees)) {
                        destination = Rectangle.fromDegrees(bboxDegrees[0], bboxDegrees[1], bboxDegrees[2], bboxDegrees[3]);
                    } else {
                        var lon = resultObject.geometry.coordinates[0];
                        var lat = resultObject.geometry.coordinates[1];
                        destination = Cartesian3.fromDegrees(lon, lat);
                    }

                    return {
                        displayName: resultObject.properties.label,
                        destination: destination
                    };
                });
            });
    };

    module.exports= PeliasGeocoderService;
