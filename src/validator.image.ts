import {Util} from "./util";
import {BlobUtil} from "./blob.util";
import {DimensionValidator} from "./validator.dimension";

export class ImageValidator extends DimensionValidator {
    constructor(files, attrGetter) {
        super(files, attrGetter);
    }

    public validate() {
        if (!this.files.length || !this.hasAny(['maxHeight', 'minHeight', 'maxWidth', 'minWidth',
                'ratio', 'maxRatio', 'minRatio', 'dimensions'])) {
            return Util.emptyPromise(this.result);
        }

        for (var i = 0; i < this.files.length; i++) {
            this.validateFile(i);
        }

        return this.result;
    };

    validateFile(i) {
        var file = this.files[i];
        ImageValidator.imageDimensions(file).then((d) => {
            this.validateMinMax(i, 'Height', d.height, 0);
            this.validateMinMax(i, 'Width', d.width, 0);
            this.validateDimensions(d);
        }).catch((e) => {
            if (e !== 'not image' && this.attrGetter('validateForce')) {
                this.markFileError(i, 'loadError', e);
            }
        });
    }

    public static imageDimensions(file) {
        if (file.$ngfWidth && file.$ngfHeight) {
            return Util.emptyPromise({width: file.$ngfWidth, height: file.$ngfHeight});
        }
        if (file.$ngfDimensionPromise) return file.$ngfDimensionPromise;

        return file.$ngfDimensionPromise = new Promise((resolve, reject) => {
            if (file.type.indexOf('image') !== 0) {
                return reject('not image');
            }
            BlobUtil.dataUrl(file).then(function (dataUrl) {
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
                    resolve({width: width, height: height});
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
                            } else if (secondsCounter++ > 10) {
                                error();
                            } else {
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
        }).then(()=> {
            delete file.$ngfDimensionPromise;
        }).catch(()=> {
            delete file.$ngfDimensionPromise;
        });
    };
}