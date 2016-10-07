import {Util} from "./util";
import {BlobUtil} from "./blob.util";
import {DimensionValidator} from "./validator.dimension";

export class MediaValidator extends DimensionValidator {
    constructor(files, attrGetter) {
        super(files, attrGetter);
    }

    public validate() {
        if (!this.files.length || !this.hasAny(['maxDuration', 'minDuration', 'duration',
                'maxVideoHeight', 'minVideoHeight', 'maxVideoWidth', 'minVideoWidth',
                'videoRatio', 'maxVideoRatio', 'minVideoRatio', 'videoDimensions'])) {
            return Util.emptyPromise(this.result);
        }

        for (var i = 0; i < this.files.length; i++) {
            this.validateFile(i);
        }

        return this.result;
    };

    validateFile(i) {
        var file = this.files[i];
        this.mediaDuration(file).then((res) => {
            this.validateMinMax(i, 'Duration', res.duration, 0);
            if (res.width) {
                this.validateMinMax(i, 'Width', res.width, 0);
                this.validateMinMax(i, 'Height', res.height, 0);
                this.validateDimensions(res, 'Video');
            }
            var durationExpr = this.attrGetter('duration');
            if (durationExpr) {
                var ngfDurFn: Function = null;
                eval('var ngfDurFn = function(duration){ return ' + durationExpr + ';}');
                if (!ngfDurFn(res.duration)) {
                    this.markFileError(i, 'duration', false);
                }
            }
        }).catch((e) => {
            if (e !== 'not audio or video' && this.attrGetter('validateForce')) {
                this.markFileError(i, 'loadError', e);
            }
        });
    }

    mediaDuration(file) {
        if (file.$ngfDuration) {
            return Util.emptyPromise(file.$ngfDuration);
        }
        if (file.$ngfDurationPromise) return file.$ngfDurationPromise;
        return file.$ngfDurationPromise = new Promise((resolve, reject) => {
            if (!file.type.startsWith('video') || !file.type.startsWith('audio')) {
                return reject('not audio or video');
            }
            BlobUtil.dataUrl(file).then(function (dataUrl) {
                var elem: any = document.createElement(file.type.indexOf('audio') === 0 ? 'audio' : 'video');
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
                            } else if (secondsCounter++ > 10) {
                                error();
                            } else {
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
        }).then(()=> {
            delete file.$ngfDurationPromise;
        }).catch(()=> {
            delete file.$ngfDurationPromise;
        });
    }
}