import {Directive, Input, Output, EventEmitter, SimpleChanges, ElementRef} from "@angular/core";
import {ImagePreview} from "../image.preview";

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