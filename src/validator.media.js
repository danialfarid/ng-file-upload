"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var util_1 = require("./util");
var blob_util_1 = require("./blob.util");
var validator_dimension_1 = require("./validator.dimension");
var MediaValidator = (function (_super) {
    __extends(MediaValidator, _super);
    function MediaValidator(files, attrGetter) {
        _super.call(this, files, attrGetter);
    }
    MediaValidator.prototype.validateFile = function (i) {
        var _this = this;
        var file = this.files[i];
        return MediaValidator.mediaDuration(file).then(function (res) {
            _this.validateMinMax(i, 'Duration', res.duration, 0);
            if (res.width) {
                _this.validateMinMax(i, 'Width', res.width, 0);
                _this.validateMinMax(i, 'Height', res.height, 0);
                _this.validateDimensions(res, 'Video');
            }
            var durationExpr = _this.attrGetter('duration');
            if (durationExpr) {
                var ngfDurFn = null;
                eval('var ngfDurFn = function(duration){ return ' + durationExpr + ';}');
                if (!ngfDurFn(res.duration)) {
                    _this.markFileError(i, 'duration', false);
                }
            }
        }).catch(function (e) {
            if (e !== 'not audio or video' && _this.attrGetter('validateForce')) {
                _this.markFileError(i, 'loadError', e);
            }
        });
    };
    MediaValidator.mediaDuration = function (file) {
        if (file.$ngfDuration) {
            return util_1.Util.emptyPromise(file.$ngfDuration);
        }
        if (file.$ngfDurationPromise)
            return file.$ngfDurationPromise;
        return file.$ngfDurationPromise = new Promise(function (resolve, reject) {
            if (!file.type.startsWith('video') || !file.type.startsWith('audio')) {
                return reject('not audio or video');
            }
            blob_util_1.BlobUtil.dataUrl(file).then(function (dataUrl) {
                var elem = document.createElement(file.type.indexOf('audio') === 0 ? 'audio' : 'video');
                elem.setAttribute('src', dataUrl);
                elem.setAttribute('style', 'visibility: hidden; position: fixed; ' +
                    'max-width: none !important; max-height: none !important');
                function success() {
                    elem.parentNode.removeChild(elem);
                    resolve({
                        duration: file.$ngfDuration = elem.duration,
                        width: file.$ngfWidth = elem.videoWidth,
                        height: file.$ngfHeight = elem.videoHeight
                    });
                }
                function error() {
                    elem.parentNode.removeChild(elem);
                    reject('load error');
                }
                elem.onloadedmetadata = success;
                elem.onerror = error;
                var secondsCounter = 0;
                function checkLoadTimeout() {
                    setTimeout(function () {
                        if (elem.parentNode) {
                            if (elem.duration) {
                                success();
                            }
                            else if (secondsCounter++ > 10) {
                                error();
                            }
                            else {
                                checkLoadTimeout();
                            }
                        }
                    }, 1000);
                }
                checkLoadTimeout();
                document.getElementsByTagName('body')[0].appendChild(elem);
            }, function (e) {
                reject('load error\n' + e);
            });
        })['finally'](function () {
            delete file.$ngfDurationPromise;
        });
    };
    return MediaValidator;
}(validator_dimension_1.DimensionValidator));
exports.MediaValidator = MediaValidator;
//# sourceMappingURL=validator.media.js.map