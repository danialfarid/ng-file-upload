import {BlobUtil} from "./blob.util";
import {ImageResizer} from "./image.resize";
import {Util} from "./util";
export class ImagePreview {
    static getElementDimentions(el) {
        if (el._ngfOrigSize_) return el._ngfOrigSize_;
        var size = {width: el.clientWidth, height: el.clientHeight};
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
    }

    static resizeToDataUrl(el, file, resizeOptions) {
        if (!file || typeof file === 'string') return Util.emptyPromise(file);
        if (resizeOptions && ImageResizer.isResizeSupported()) {
            var options: any = Object.assign({}, resizeOptions);
            if (!options.width && !options.height) {
                var size = ImagePreview.getElementDimentions(el);
                options.width = size.width;
                options.height = size.height;
            }
            return ImageResizer.resize(file, options).then(resizedFile => BlobUtil.dataUrl(resizedFile));
        } else {
            return BlobUtil.dataUrl(file);
        }
    }

    static setSrc(el, url, asBackground?) {
        if (asBackground) {
            el.style.backgroundImage = 'url(\'' + url + '\')';
        } else {
            el.src = url;
        }
    }
}