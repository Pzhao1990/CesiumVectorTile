var arrayRemoveDuplicates=require('./arrayRemoveDuplicates');
var BoundingSphere=require('./BoundingSphere');
var Cartesian3=require('./Cartesian3');
var Check=require('./Check');
var ComponentDatatype=require('./ComponentDatatype');
var CoplanarPolygonGeometryLibrary=require('./CoplanarPolygonGeometryLibrary');
var defaultValue=require('./defaultValue');
var defined=require('./defined');
var Geometry=require('./Geometry');
var GeometryAttribute=require('./GeometryAttribute');
var GeometryAttributes=require('./GeometryAttributes');
var GeometryInstance=require('./GeometryInstance');
var GeometryPipeline=require('./GeometryPipeline');
var IndexDatatype=require('./IndexDatatype');
var PolygonGeometryLibrary=require('./PolygonGeometryLibrary');
var PolygonPipeline=require('./PolygonPipeline');
var PrimitiveType=require('./PrimitiveType');

    'use strict';

    function createGeometryFromPositions(positions){
        var length = positions.length;
        var flatPositions = new Float64Array(length * 3);
        var indices = IndexDatatype.createTypedArray(length, length * 2);

        var positionIndex = 0;
        var index = 0;

        for (var i = 0; i < length; i++) {
            var position = positions[i];
            flatPositions[positionIndex++] = position.x;
            flatPositions[positionIndex++] = position.y;
            flatPositions[positionIndex++] = position.z;

            indices[index++] = i;
            indices[index++] = (i + 1) % length;
        }

        var attributes = new GeometryAttributes({
            position: new GeometryAttribute({
                componentDatatype : ComponentDatatype.DOUBLE,
                componentsPerAttribute : 3,
                values : flatPositions
            })
        });

        return new Geometry({
            attributes : attributes,
            indices : indices,
            primitiveType : PrimitiveType.LINES
        });
    }

    /**
     * A description of the outline of a polygon composed of arbitrary coplanar positions.
     *
     * @alias CoplanarPolygonOutlineGeometry
     * @constructor
     *
     * @param {Object} options Object with the following properties:
     * @param {PolygonHierarchy} options.polygonHierarchy A polygon hierarchy that can include holes.
     *
     * @see CoplanarPolygonOutlineGeometry.createGeometry
     *
     * @example
     * var polygonOutline = new Cesium.CoplanarPolygonOutlineGeometry({
     *   positions : Cesium.Cartesian3.fromDegreesArrayHeights([
     *      -90.0, 30.0, 0.0,
     *      -90.0, 30.0, 1000.0,
     *      -80.0, 30.0, 1000.0,
     *      -80.0, 30.0, 0.0
     *   ])
     * });
     * var geometry = Cesium.CoplanarPolygonOutlineGeometry.createGeometry(polygonOutline);
     */
    function CoplanarPolygonOutlineGeometry(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        var polygonHierarchy = options.polygonHierarchy;
        //>>includeStart('debug', pragmas.debug);
        Check.defined('options.polygonHierarchy', polygonHierarchy);
        //>>includeEnd('debug');

        this._polygonHierarchy = polygonHierarchy;
        this._workerName = 'createCoplanarPolygonOutlineGeometry';

        /**
         * The number of elements used to pack the object into an array.
         * @type {Number}
         */
        this.packedLength = PolygonGeometryLibrary.computeHierarchyPackedLength(polygonHierarchy) + 1;
    }

    /**
     * A description of a coplanar polygon outline from an array of positions.
     *
     * @param {Object} options Object with the following properties:
     * @param {Cartesian3[]} options.positions An array of positions that defined the corner points of the polygon.
     * @returns {CoplanarPolygonOutlineGeometry}
     */
    CoplanarPolygonOutlineGeometry.fromPositions = function(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        //>>includeStart('debug', pragmas.debug);
        Check.defined('options.positions', options.positions);
        //>>includeEnd('debug');

        var newOptions = {
            polygonHierarchy : {
                positions : options.positions
            }
        };
        return new CoplanarPolygonOutlineGeometry(newOptions);
    };

    /**
     * Stores the provided instance into the provided array.
     *
     * @param {CoplanarPolygonOutlineGeometry} value The value to pack.
     * @param {Number[]} array The array to pack into.
     * @param {Number} [startingIndex=0] The index into the array at which to start packing the elements.
     *
     * @returns {Number[]} The array that was packed into
     */
    CoplanarPolygonOutlineGeometry.pack = function(value, array, startingIndex) {
        //>>includeStart('debug', pragmas.debug);
        Check.typeOf.object('value', value);
        Check.defined('array', array);
        //>>includeEnd('debug');

        startingIndex = defaultValue(startingIndex, 0);

        startingIndex = PolygonGeometryLibrary.packPolygonHierarchy(value._polygonHierarchy, array, startingIndex);

        array[startingIndex] = value.packedLength;

        return array;
    };

    var scratchOptions = {
        polygonHierarchy : {}
    };
    /**
     * Retrieves an instance from a packed array.
     *
     * @param {Number[]} array The packed array.
     * @param {Number} [startingIndex=0] The starting index of the element to be unpacked.
     * @param {CoplanarPolygonOutlineGeometry} [result] The object into which to store the result.
     * @returns {CoplanarPolygonOutlineGeometry} The modified result parameter or a new CoplanarPolygonOutlineGeometry instance if one was not provided.
     */
    CoplanarPolygonOutlineGeometry.unpack = function(array, startingIndex, result) {
        //>>includeStart('debug', pragmas.debug);
        Check.defined('array', array);
        //>>includeEnd('debug');

        startingIndex = defaultValue(startingIndex, 0);

        var polygonHierarchy = PolygonGeometryLibrary.unpackPolygonHierarchy(array, startingIndex);
        startingIndex = polygonHierarchy.startingIndex;
        delete polygonHierarchy.startingIndex;
        var packedLength = array[startingIndex];

        if (!defined(result)) {
            result = new CoplanarPolygonOutlineGeometry(scratchOptions);
        }

        result._polygonHierarchy = polygonHierarchy;
        result.packedLength = packedLength;

        return result;
    };

    /**
     * Computes the geometric representation of an arbitrary coplanar polygon, including its vertices, indices, and a bounding sphere.
     *
     * @param {CoplanarPolygonOutlineGeometry} polygonGeometry A description of the polygon.
     * @returns {Geometry|undefined} The computed vertices and indices.
     */
    CoplanarPolygonOutlineGeometry.createGeometry = function(polygonGeometry) {
        var polygonHierarchy = polygonGeometry._polygonHierarchy;

        var outerPositions = polygonHierarchy.positions;
        outerPositions = arrayRemoveDuplicates(outerPositions, Cartesian3.equalsEpsilon, true);
        if (outerPositions.length < 3) {
            return;
        }
        var isValid = CoplanarPolygonGeometryLibrary.validOutline(outerPositions);
        if (!isValid) {
            return undefined;
        }

        var polygons = PolygonGeometryLibrary.polygonOutlinesFromHierarchy(polygonHierarchy, false);

        if (polygons.length === 0) {
            return undefined;
        }

        var geometries = [];

        for (var i = 0; i < polygons.length; i++) {
            var geometryInstance = new GeometryInstance({
                geometry : createGeometryFromPositions(polygons[i])
            });
            geometries.push(geometryInstance);
        }

        var geometry = GeometryPipeline.combineInstances(geometries)[0];
        var boundingSphere = BoundingSphere.fromPoints(polygonHierarchy.positions);

        return new Geometry({
            attributes : geometry.attributes,
            indices : geometry.indices,
            primitiveType : geometry.primitiveType,
            boundingSphere : boundingSphere
        });
    };

    module.exports= CoplanarPolygonOutlineGeometry;
