var Check=require('./Check');
var ComponentDatatype=require('./ComponentDatatype');
var defaultValue=require('./defaultValue');
var defined=require('./defined');
var defineProperties=require('./defineProperties');

    'use strict';

    /**
     * Value and type information for per-instance geometry attribute that determines the geometry instance offset
     *
     * @alias OffsetGeometryInstanceAttribute
     * @constructor
     *
     * @param {Number} [x=0] The x translation
     * @param {Number} [y=0] The y translation
     * @param {Number} [z=0] The z translation
     *
     * @private
     *
     * @see GeometryInstance
     * @see GeometryInstanceAttribute
     */
    function OffsetGeometryInstanceAttribute(x, y, z) {
        x = defaultValue(x, 0);
        y = defaultValue(y, 0);
        z = defaultValue(z, 0);

        /**
         * The values for the attributes stored in a typed array.
         *
         * @type Float32Array
         */
        this.value = new Float32Array([x, y, z]);
    }

    defineProperties(OffsetGeometryInstanceAttribute.prototype, {
        /**
         * The datatype of each component in the attribute, e.g., individual elements in
         * {@link OffsetGeometryInstanceAttribute#value}.
         *
         * @memberof OffsetGeometryInstanceAttribute.prototype
         *
         * @type {ComponentDatatype}
         * @readonly
         *
         * @default {@link ComponentDatatype.FLOAT}
         */
        componentDatatype : {
            get : function() {
                return ComponentDatatype.FLOAT;
            }
        },

        /**
         * The number of components in the attributes, i.e., {@link OffsetGeometryInstanceAttribute#value}.
         *
         * @memberof OffsetGeometryInstanceAttribute.prototype
         *
         * @type {Number}
         * @readonly
         *
         * @default 3
         */
        componentsPerAttribute : {
            get : function() {
                return 3;
            }
        },

        /**
         * When <code>true</code> and <code>componentDatatype</code> is an integer format,
         * indicate that the components should be mapped to the range [0, 1] (unsigned)
         * or [-1, 1] (signed) when they are accessed as floating-point for rendering.
         *
         * @memberof OffsetGeometryInstanceAttribute.prototype
         *
         * @type {Boolean}
         * @readonly
         *
         * @default false
         */
        normalize : {
            get : function() {
                return false;
            }
        }
    });

    /**
     * Creates a new {@link OffsetGeometryInstanceAttribute} instance given the provided an enabled flag and {@link DistanceDisplayCondition}.
     *
     * @param {Cartesian3} offset The cartesian offset
     * @returns {OffsetGeometryInstanceAttribute} The new {@link OffsetGeometryInstanceAttribute} instance.
     */
    OffsetGeometryInstanceAttribute.fromCartesian3 = function(offset) {
        //>>includeStart('debug', pragmas.debug);
        Check.defined('offset', offset);
        //>>includeEnd('debug');

        return new OffsetGeometryInstanceAttribute(offset.x, offset.y, offset.z);
    };

    /**
     * Converts a distance display condition to a typed array that can be used to assign a distance display condition attribute.
     *
     * @param {Cartesian3} offset The cartesian offset
     * @param {Float32Array} [result] The array to store the result in, if undefined a new instance will be created.
     * @returns {Float32Array} The modified result parameter or a new instance if result was undefined.
     *
     * @example
     * var attributes = primitive.getGeometryInstanceAttributes('an id');
     * attributes.modelMatrix = Cesium.OffsetGeometryInstanceAttribute.toValue(modelMatrix, attributes.modelMatrix);
     */
    OffsetGeometryInstanceAttribute.toValue = function(offset, result) {
        //>>includeStart('debug', pragmas.debug);
        Check.defined('offset', offset);
        //>>includeEnd('debug');

        if (!defined(result)) {
            result = new Float32Array([offset.x, offset.y, offset.z]);
        }

        result[0] = offset.x;
        result[1] = offset.y;
        result[2] = offset.z;
        return result;
    };

    module.exports= OffsetGeometryInstanceAttribute;
