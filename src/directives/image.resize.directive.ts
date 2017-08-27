import {Directive, Input, Output, EventEmitter, ElementRef} from "@angular/core";
import {ImageResizer} from "../image.resize";

/**
 * Aspect ratio string in the format `x:y` for example `2:3` or a float value like `0.8`.
 * @typedef {(string|float)} AspectRatio
 */

/**
 * Resize options.
 * @typedef {object} ResizeOptions
 * @prop ngfResize {object=} the resize options.
 * @prop ngfResize.ratio {AspectRatio=} the aspect ratio of the resized image.
 * @prop ngfResize.width {object=} the width of the resized image.
 * @prop ngfResize.height {object=} the height of the resized image.
 * @prop ngfResize.centerCrop {boolean=} if true will center crop the image if it does not fit within
 * the given width/height or ratio otherwise will fit the image within the given boundaries so the resulting
 * image width (or height) could be less than given width (or height) if the original image is taller or wider than
 * the target aspect ratio. Default false.
 * @prop ngfResize.quality {float=} quality of the resized image produced, between 0.1 and 1.0.
 * @prop ngfResize.pattern {string=} resize only if the files name or type matches the pattern.
 * @prop ngfResize.restoreExif {boolean=} default true, will restore exif info on the resized image.
 * @prop ngfResize.type {string=} convert it to the given image type format.
 * @prop ngfOnResize {EventEmitter=} convert it to the given image type format.
 */

/**
 * Enables resizing the image file captured in `ngModel`.
 *
 * @prop ngfResize {ResizeOptions} the resize options.
 *
 * @example
 *  <div ngfDrop [(ngModel)]="files"
 *    ngfResize="{ratio:'2:3', pattern:'image/jpeg', centerCrop:true, quality:0.5}"
 *    (ngfOnResize)="endOfResize($event)">
 *  </div>
 * @name ImageResizeDirective [ngfResize]
 */
@Directive({
    selector: '[ngModel][ngfResize]',
})
export class ImageResizeDirective {
    @Input() ngfResize;
    @Output() ngfOnResize = new EventEmitter();

    private elem;

    constructor(el: ElementRef) {
        this.elem = el.nativeElement;
    }

    ngOnInit() {
        if (!this.elem.__ngfModelDirective__) return;
        this.elem.__ngfModelDirective__.formatters.splice(0, 0, this.resizePromise);
    }

    resizePromise = (file) => {
        return ImageResizer.resize(file, this.ngfResize)
            .then((r) => this.ngfOnResize.emit(r))
            .catch((e) => this.ngfOnResize.emit(e));
    };
}