import {Util} from "./util";
import {BlobUtil} from "./blob.util";
import {ExifRestorer} from "./image.exif.restorer";
export class ImageResizer {
    constructor() {
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

    static resize(file, options: any) {
        if (file.type.indexOf('image') !== 0 || !options || !(options instanceof Object))
            return Util.emptyPromise(file);
        return new Promise((resolve) => {
            options = Object.assign({}, options);
            BlobUtil.dataUrl(file, true).then((url) => {
                ImageResizer.resizeDataUrl(file, url, options).then((dataUrl) => {
                    if (file.type === 'image/jpeg' && options.restoreExif) {
                        try {
                            dataUrl = ExifRestorer.restore(url, dataUrl);
                        } catch (e) {
                            setTimeout(function () {
                                throw e;
                            }, 1);
                        }
                    }
                    try {
                        file = BlobUtil.dataUrltoBlob(dataUrl, file.name, file.size);
                    } catch (e) {
                        file.resizeError = 'Cannot convert to Blob ' + (e ? e : '');
                    }
                    resolve(file);
                }).catch((e) => {
                    file.resizeError = 'Cannot create dataUrl ' + (e ? e : '');
                    resolve(file);
                });
            }).catch(e => {
                file.resizeError = 'Cannot convert to Blob ' + (e ? e : '');
                resolve(file);
            });
        });
    };

    // Extracted from https://github.com/romelgomez/angular-firebase-image-upload/blob/master/app/scripts/fileUpload.js#L89
    static resizeDataUrl(file, dataUrl, options) {
        return new Promise((resolve, reject) => {
            var canvasElement = document.createElement('canvas');
            var imgEl = document.createElement('img');
            imgEl.onload = function () {
                if (options.resizeIf != null) {
                    var ngfResizeIfFn: Function = null;
                    eval('var ngfResizeIfFn = function(width, height, file){ return ' + options.resizeIf + ';}');
                    if (ngfResizeIfFn(imgEl.width, imgEl.height) === false) return reject('resizeIf');
                }
                try {
                    var width = options.width, height = options.height;
                    if (options.ratio) {
                        var ratioFloat = Util.ratioToFloat(options.ratio);
                        var imgRatio = imgEl.width / imgEl.height;
                        if (imgRatio < ratioFloat) {
                            width = imgEl.width;
                            height = width / ratioFloat;
                        } else {
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
                    var dimensions = ImageResizer.calculateAspectRatioFit(imgEl.width, imgEl.height,
                        width, height, options.centerCrop);
                    canvasElement.width = Math.min(dimensions.width, width);
                    canvasElement.height = Math.min(dimensions.height, height);
                    var context = canvasElement.getContext('2d');
                    context.drawImage(imgEl,
                        Math.min(0, -dimensions.marginX / 2), Math.min(0, -dimensions.marginY / 2),
                        dimensions.width, dimensions.height);
                    resolve(canvasElement.toDataURL(options.type || file.type || 'image/WebP',
                        options.quality || 0.934));
                } catch (e) {
                    reject(e);
                }
            };
            imgEl.onerror = function () {
                reject();
            };
            imgEl.src = dataUrl;
        });
    };

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
    static calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight, centerCrop) {
        var ratio = centerCrop ? Math.max(maxWidth / srcWidth, maxHeight / srcHeight) :
            Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
        return {
            width: srcWidth * ratio, height: srcHeight * ratio,
            marginX: srcWidth * ratio - maxWidth, marginY: srcHeight * ratio - maxHeight
        };
    };

    static isResizeSupported() {
        return Util.isCanvasSupported();
    }
}