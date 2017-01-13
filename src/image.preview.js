"use strict";
var blob_util_1 = require("./blob.util");
var image_resize_1 = require("./image.resize");
var util_1 = require("./util");
var ImagePreview = (function () {
    function ImagePreview() {
    }
    ImagePreview.getElementDimentions = function (el) {
        if (el._ngfOrigSize_)
            return el._ngfOrigSize_;
        var size = { width: el.clientWidth, height: el.clientHeight };
        if (size.width === 0 && window.getComputedStyle) {
            var style = getComputedStyle(el);
            if (style.width && style.width.indexOf('px') > -1 && style.height && style.height.indexOf('px') > -1) {
                size = {
                    width: parseInt(style.width.slice(0, -2)),
                    height: parseInt(style.height.slice(0, -2))
                };
            }
        }
        el._ngfOrigSize_ = size;
        return size;
    };
    ImagePreview.resizeToDataUrl = function (el, file, resizeOptions) {
        if (!file || typeof file === 'string')
            return util_1.Util.emptyPromise(file);
        if (resizeOptions && image_resize_1.ImageResizer.isResizeSupported()) {
            var options = Object.assign({}, resizeOptions);
            if (!options.width && !options.height) {
                var size = ImagePreview.getElementDimentions(el);
                options.width = size.width;
                options.height = size.height;
            }
            return image_resize_1.ImageResizer.resize(file, options).then(function (resizedFile) { return blob_util_1.BlobUtil.dataUrl(resizedFile); });
        }
        else {
            return blob_util_1.BlobUtil.dataUrl(file);
        }
    };
    ImagePreview.setSrc = function (el, url, asBackground) {
        if (asBackground) {
            el.style.backgroundImage = 'url(\'' + url + '\')';
        }
        else {
            el.src = url;
        }
    };
    return ImagePreview;
}());
exports.ImagePreview = ImagePreview;
//# sourceMappingURL=image.preview.js.map