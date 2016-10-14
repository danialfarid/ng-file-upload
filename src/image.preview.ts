import {BlobUtil} from "./blob.util";
import {ImageResizer} from "./image.resize";
import {Util} from "./util";
export class ImagePreview {
    static getElementDimentions(el) {
        var size = {width: el.clientWidth, height: el.clientHeight};
        if (size.width === 0 && window.getComputedStyle) {
            var style = getComputedStyle(el);
            size = {
                width: parseInt(style.width.slice(0, -2)),
                height: parseInt(style.height.slice(0, -2))
            };
        }
        return size;
    }

    static addBackground(el, file) {
        BlobUtil.dataUrl(file).then(url =>);
    }

    static addSrc(el, file) {
        BlobUtil.dataUrl(file).then(url =>);
    }

    static toDataUrl(el, file, resizeOptions) {
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