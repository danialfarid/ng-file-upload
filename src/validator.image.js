"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var util_1 = require("./util");
var blob_util_1 = require("./blob.util");
var validator_dimension_1 = require("./validator.dimension");
var ImageValidator = (function (_super) {
    __extends(ImageValidator, _super);
    function ImageValidator(files, attrGetter) {
        _super.call(this, files, attrGetter);
    }
    ImageValidator.prototype.validateFile = function (i) {
        var _this = this;
        var file = this.files[i];
        return ImageValidator.imageDimensions(file).then(function (d) {
            _this.validateMinMax(i, 'Height', d.height, 0);
            _this.validateMinMax(i, 'Width', d.width, 0);
            _this.validateDimensions(d);
        }).catch(function (e) {
            if (e !== 'not image' && _this.attrGetter('validateForce')) {
                _this.markFileError(i, 'loadError', e);
            }
        });
    };
    ImageValidator.imageDimensions = function (file) {
        if (file.$ngfWidth && file.$ngfHeight) {
            return util_1.Util.emptyPromise({ width: file.$ngfWidth, height: file.$ngfHeight });
        }
        if (file.$ngfDimensionPromise)
            return file.$ngfDimensionPromise;
        return file.$ngfDimensionPromise = new Promise(function (resolve, reject) {
            if (file.type.indexOf('image') !== 0) {
                return reject('not image');
            }
            blob_util_1.BlobUtil.dataUrl(file).then(function (dataUrl) {
                var img = document.createElement('img');
                img.setAttribute('src', dataUrl);
                img.setAttribute('style', 'visibility: hidden; position: fixed; ' +
                    'max-width: none !important; max-height: none !important');
                function success() {
                    var width = img.naturalWidth || img.clientWidth;
                    var height = img.naturalHeight || img.clientHeight;
                    img.parentNode.removeChild(img);
                    file.$ngfWidth = width;
                    file.$ngfHeight = height;
                    resolve({ width: width, height: height });
                }
                function error() {
                    img.parentNode.removeChild(img);
                    reject('load error');
                }
                img.onload = success;
                img.onerror = error;
                var secondsCounter = 0;
                function giveUpLoadWithError() {
                    setTimeout(function () {
                        if (img.parentNode) {
                            if (img.naturalWidth || img.clientWidth) {
                                success();
                            }
                            else if (secondsCounter++ > 10) {
                                error();
                            }
                            else {
                                giveUpLoadWithError();
                            }
                        }
                    }, 1000);
                }
                giveUpLoadWithError();
                document.getElementsByTagName('body')[0].appendChild(img);
            }, function (e) {
                reject('load error\n' + e);
            });
        })['finally'](function () {
            delete file.$ngfDurationPromise;
        });
    };
    ;
    return ImageValidator;
}(validator_dimension_1.DimensionValidator));
exports.ImageValidator = ImageValidator;
//# sourceMappingURL=validator.image.js.map