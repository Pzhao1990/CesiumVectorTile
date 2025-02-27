var defined=require('./defined');

    'use strict';

    var context2DsByWidthAndHeight = {};

    /**
     * Extract a pixel array from a loaded image.  Draws the image
     * into a canvas so it can read the pixels back.
     *
     * @exports getImagePixels
     *
     * @param {Image} image The image to extract pixels from.
     * @param {Number} width The width of the image. If not defined, then image.width is assigned.
     * @param {Number} height The height of the image. If not defined, then image.height is assigned.
     * @returns {CanvasPixelArray} The pixels of the image.
     */
    function getImagePixels(image, width, height) {
        if (!defined(width)) {
            width = image.width;
        }
        if (!defined(height)) {
            height = image.height;
        }

        var context2DsByHeight = context2DsByWidthAndHeight[width];
        if (!defined(context2DsByHeight)) {
            context2DsByHeight = {};
            context2DsByWidthAndHeight[width] = context2DsByHeight;
        }

        var context2d = context2DsByHeight[height];
        if (!defined(context2d)) {
            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            context2d = canvas.getContext('2d');
            context2d.globalCompositeOperation = 'copy';
            context2DsByHeight[height] = context2d;
        }

        context2d.drawImage(image, 0, 0, width, height);
        return context2d.getImageData(0, 0, width, height).data;
    }

    module.exports= getImagePixels;
