"use strict";
// customized version of https://github.com/exif-js/exif-js
var util_1 = require("./util");
var blob_util_1 = require("./blob.util");
var image_exif_restorer_1 = require("./image.exif.restorer");
var ExifUtil = (function () {
    function ExifUtil() {
    }
    ExifUtil.applyExifRotation = function (file) {
        var _this = this;
        if (file.type.indexOf('image/jpeg') !== 0)
            return util_1.Util.emptyPromise(file);
        return new Promise(function (resolve, reject) {
            _this.readOrientation(file).then(function (result) {
                if (result.orientation < 2 || result.orientation > 8) {
                    return resolve(file);
                }
                blob_util_1.BlobUtil.dataUrl(file, true).then(function (url) {
                    var canvas = document.createElement('canvas');
                    var img = document.createElement('img');
                    img.onload = function () {
                        try {
                            canvas.width = result.orientation > 4 ? img.height : img.width;
                            canvas.height = result.orientation > 4 ? img.width : img.height;
                            var ctx = canvas.getContext('2d');
                            _this.applyTransform(ctx, result.orientation, img.width, img.height);
                            ctx.drawImage(img, 0, 0);
                            var dataUrl = canvas.toDataURL(file.type || 'image/WebP', 0.934);
                            dataUrl = image_exif_restorer_1.ExifRestorer.restore(_this.arrayBufferToBase64(result.fixedArrayBuffer), dataUrl);
                            var blob = blob_util_1.BlobUtil.dataUrltoBlob(dataUrl, file.name);
                            resolve(blob);
                        }
                        catch (e) {
                            reject(e);
                        }
                    };
                    img.onerror = function (e) {
                        reject(e);
                    };
                    img.src = url;
                }).catch(function (e) {
                    reject(e);
                });
            }).catch(function (e) {
                reject(e);
            });
        });
    };
    ;
    ExifUtil.readOrientation = function (file) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            var slicedFile = file.slice ? file.slice(0, 64 * 1024) : file;
            reader.readAsArrayBuffer(slicedFile);
            reader.onerror = function (e) {
                return reject(e);
            };
            reader.onload = function (e) {
                var result = { orientation: 1 };
                var view = new DataView(this.result);
                if (view.getUint16(0, false) !== 0xFFD8)
                    return resolve(result);
                var length = view.byteLength, offset = 2;
                while (offset < length) {
                    var marker = view.getUint16(offset, false);
                    offset += 2;
                    if (marker === 0xFFE1) {
                        if (view.getUint32(offset += 2, false) !== 0x45786966)
                            return resolve(result);
                        var little = view.getUint16(offset += 6, false) === 0x4949;
                        offset += view.getUint32(offset + 4, little);
                        var tags = view.getUint16(offset, little);
                        offset += 2;
                        for (var i = 0; i < tags; i++)
                            if (view.getUint16(offset + (i * 12), little) === 0x0112) {
                                var orientation = view.getUint16(offset + (i * 12) + 8, little);
                                if (orientation >= 2 && orientation <= 8) {
                                    view.setUint16(offset + (i * 12) + 8, 1, little);
                                    result.fixedArrayBuffer = e.target.result;
                                }
                                result.orientation = orientation;
                                return resolve(result);
                            }
                    }
                    else if ((marker & 0xFF00) !== 0xFF00)
                        break;
                    else
                        offset += view.getUint16(offset, false);
                }
                return resolve(result);
            };
        });
    };
    ExifUtil.applyTransform = function (ctx, orientation, width, height) {
        switch (orientation) {
            case 2:
                return ctx.transform(-1, 0, 0, 1, width, 0);
            case 3:
                return ctx.transform(-1, 0, 0, -1, width, height);
            case 4:
                return ctx.transform(1, 0, 0, -1, 0, height);
            case 5:
                return ctx.transform(0, 1, 1, 0, 0, 0);
            case 6:
                return ctx.transform(0, 1, -1, 0, height, 0);
            case 7:
                return ctx.transform(0, -1, -1, 0, height, width);
            case 8:
                return ctx.transform(0, -1, 1, 0, 0, width);
        }
    };
    ExifUtil.arrayBufferToBase64 = function (buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };
    ExifUtil.isExifSupported = function () {
        return typeof FileReader != 'undefined' && new FileReader().readAsArrayBuffer &&
            util_1.Util.isCanvasSupported();
    };
    ;
    return ExifUtil;
}());
exports.ExifUtil = ExifUtil;
//# sourceMappingURL=image.exif.js.map