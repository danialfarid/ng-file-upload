import {Directive, Input, Output, EventEmitter, SimpleChanges, ElementRef} from "@angular/core";
import {ImagePreview} from "../image.preview";

/**
 * Directive for image or media preview. Supports resizing to thumbnail.
 *
 * @prop ngfSrc {(Blob|string)=} the image/video/audio file or url to be set as `src` attribute of this element.
 * @prop ngfBackground {(Blob|string)=} the image file or url to be set as the background image.
 * @prop ngfThumb {Blob=} the image file.
 * @prop ngfThumbBackground {Blob=} the image file to be set as the background image.
 * @prop ngfResize {ResizeOptions=} resize options for `ngfThumb` or `ngfThumbBackground`.
 * @prop ngfOnProcessing {EventEmitter=} emitted when the thumbnail resizing process starts and finishes.
 * For the start the `$event` value will be `true` and for the end would be `false`.
 *
 * @example
 * <img [ngfSrc]="imageFile">
 * <img [ngfBackground]="imageFile">
 * <img [ngfThumb]="imageFile">
 * <img [ngfThumb]="imageFile" ngfResize="{width:24, height:24}">
 * <img [ngfThumbBackground]="imageFile">
 * <img [ngfThumb]="imageFile" ngfResize="{width:24, height:24}" (ngfObProcessing)="processing=$event">{{processing}}
 *
 * @name ThumbDirective [ngfThumb],[ngfSrc],[ngfBackground],[ngfThumbBackground]
 */
@Directive({
    selector: '[ngfThumb],[ngfSrc],[ngfBackground],[ngfThumbBackground]',
})
export class ThumbDirective {
    @Input() ngfThumb;
    @Input() ngfThumbBackground;
    @Input() ngfSrc;
    @Input() ngfBackground;
    @Input() ngfResize;
    @Output() ngfOnProcessing = new EventEmitter();

    private elem;

    constructor(el: ElementRef) {
        this.elem = el.nativeElement;
    }

    ngOnChanges(changes: SimpleChanges) {
        this.ngfOnProcessing.emit(true);
        if (changes['ngfThumb']) {
            ImagePreview.resizeToDataUrl(this.elem, changes['ngfThumb'].currentValue, this.ngfResize || {})
                .then(url => {
                    this.ngfOnProcessing.emit(false);
                    ImagePreview.setSrc(this.elem, url);
                });
        }
        if (changes['ngfThumbBackground']) {
            ImagePreview.resizeToDataUrl(this.elem, changes['ngfThumbBackground'].currentValue,
                this.ngfResize || {}).then((url) => {
                this.ngfOnProcessing.emit(false);
                ImagePreview.setSrc(this.elem, url, true);
            });
        }
        if (changes['ngfSrc']) {
            ImagePreview.resizeToDataUrl(this.elem, changes['ngfSrc'].currentValue,
                this.ngfResize).then((url) => {
                this.ngfOnProcessing.emit(false);
                ImagePreview.setSrc(this.elem, url);
            });
        }
        if (changes['ngfBackground']) {
            ImagePreview.resizeToDataUrl(this.elem, changes['ngfBackground'].currentValue,
                this.ngfResize).then((url) => {
                this.ngfOnProcessing.emit(false);
                ImagePreview.setSrc(this.elem, url, true);
            });
        }
    }
}