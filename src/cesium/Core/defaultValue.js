var freezeObject=require('./freezeObject');

    'use strict';

    /**
     * Returns the first parameter if not undefined, otherwise the second parameter.
     * Useful for setting a default value for a parameter.
     *
     * @exports defaultValue
     *
     * @param {*} a
     * @param {*} b
     * @returns {*} Returns the first parameter if not undefined, otherwise the second parameter.
     *
     * @example
     * param = Cesium.defaultValue(param, 'default');
     */
    function defaultValue(a, b) {
        if (a !== undefined && a !== null) {
            return a;
        }
        return b;
    }

    /**
     * A frozen empty object that can be used as the default value for options passed as
     * an object literal.
     * @type {Object}
     */
    defaultValue.EMPTY_OBJECT = freezeObject({});

    module.exports= defaultValue;
