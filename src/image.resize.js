"use strict";
var util_1 = require("./util");
var blob_util_1 = require("./blob.util");
var image_exif_restorer_1 = require("./image.exif.restorer");
var ImageResizer = (function () {
    function ImageResizer() {
        if (ImageResizer.isResizeSupported()) {
            // add name getter to the blob constructor prototype
            Object.defineProperty(Blob.prototype, 'name', {
                get: function () {
                    return this.$ngfName;
                },
                set: function (v) {
                    this.$ngfName = v;
                },
                configurable: true
            });
        }
    }
    ImageResizer.resize = function (file, options) {
        if (file.type.indexOf('image') !== 0 || !options || !(options instanceof Object))
            return util_1.Util.emptyPromise(file);
        return new Promise(function (resolve) {
            options = Object.assign({}, options);
            blob_util_1.BlobUtil.dataUrl(file, true).then(function (url) {
                ImageResizer.resizeDataUrl(file, url, options).then(function (dataUrl) {
                    if (file.type === 'image/jpeg' && options.restoreExif) {
                        try {
                            dataUrl = image_exif_restorer_1.ExifRestorer.restore(url, dataUrl);
                        }
                        catch (e) {
                            setTimeout(function () {
                                throw e;
                            }, 1);
                        }
                    }
                    try {
                        file = blob_util_1.BlobUtil.dataUrltoBlob(dataUrl, file.name, file.size);
                    }
                    catch (e) {
                        file.resizeError = 'Cannot convert to Blob ' + (e ? e : '');
                    }
                    resolve(file);
                }).catch(function (e) {
                    file.resizeError = 'Cannot create dataUrl ' + (e ? e : '');
                    resolve(file);
                });
            }).catch(function (e) {
                file.resizeError = 'Cannot convert to Blob ' + (e ? e : '');
                resolve(file);
            });
        });
    };
    ;
    // Extracted from https://github.com/romelgomez/angular-firebase-image-upload/blob/master/app/scripts/fileUpload.js#L89
    ImageResizer.resizeDataUrl = function (file, dataUrl, options) {
        return new Promise(function (resolve, reject) {
            var canvasElement = document.createElement('canvas');
            var imgEl = document.createElement('img');
            imgEl.onload = function () {
                if (options.resizeIf != null) {
                    var ngfResizeIfFn = null;
                    eval('var ngfResizeIfFn = function(width, height, file){ return ' + options.resizeIf + ';}');
                    if (ngfResizeIfFn(imgEl.width, imgEl.height) === false)
                        return reject('resizeIf');
                }
                try {
                    var width = options.width, height = options.height;
                    if (options.ratio) {
                        var ratioFloat = util_1.Util.ratioToFloat(options.ratio);
                        var imgRatio = imgEl.width / imgEl.height;
                        if (imgRatio < ratioFloat) {
                            width = imgEl.width;
                            height = width / ratioFloat;
                        }
                        else {
                            height = imgEl.height;
                            width = height * ratioFloat;
                        }
                    }
                    if (!width) {
                        width = imgEl.width;
                    }
                    if (!height) {
                        height = imgEl.height;
                    }
                    var dimensions = ImageResizer.calculateAspectRatioFit(imgEl.width, imgEl.height, width, height, options.centerCrop);
                    canvasElement.width = Math.min(dimensions.width, width);
                    canvasElement.height = Math.min(dimensions.height, height);
                    var context = canvasElement.getContext('2d');
                    context.drawImage(imgEl, Math.min(0, -dimensions.marginX / 2), Math.min(0, -dimensions.marginY / 2), dimensions.width, dimensions.height);
                    resolve(canvasElement.toDataURL(options.type || file.type || 'image/WebP', options.quality || 0.934));
                }
                catch (e) {
                    reject(e);
                }
            };
            imgEl.onerror = function () {
                reject();
            };
            imgEl.src = dataUrl;
        });
    };
    ;
    /**
     * Conserve aspect ratio of the original region. Useful when shrinking/enlarging
     * images to fit into a certain area.
     * Source:  http://stackoverflow.com/a/14731922
     *
     * @param {Number} srcWidth Source area width
     * @param {Number} srcHeight Source area height
     * @param {Number} maxWidth Nestable area maximum available width
     * @param {Number} maxHeight Nestable area maximum available height
     * @return {Object} { width, height }
     */
    ImageResizer.calculateAspectRatioFit = function (srcWidth, srcHeight, maxWidth, maxHeight, centerCrop) {
        var ratio = centerCrop ? Math.max(maxWidth / srcWidth, maxHeight / srcHeight) :
            Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
        return {
            width: srcWidth * ratio, height: srcHeight * ratio,
            marginX: srcWidth * ratio - maxWidth, marginY: srcHeight * ratio - maxHeight
        };
    };
    ;
    ImageResizer.isResizeSupported = function () {
        return util_1.Util.isCanvasSupported();
    };
    return ImageResizer;
}());
exports.ImageResizer = ImageResizer;
//# sourceMappingURL=image.resize.js.map