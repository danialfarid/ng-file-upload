import {Directive, Input, Output, EventEmitter, SimpleChanges, ElementRef} from "@angular/core";
import {ImagePreview} from "../image.preview";

@Directive({
    selector: '[ngfThumbnail],[ngfSrc],[ngfBackground],[ngfThumbBackground]',
})
export class ThumbnailDirective {
    @Input() ngfThumbnail;
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
        if (changes['ngfThumbnail']) {
            ImagePreview.toDataUrl(this.elem, changes['ngfThumbnail'].currentValue, this.ngfResize || {})
                .then(url => {
                    this.ngfOnProcessing.emit(false);
                    ImagePreview.setSrc(this.elem, url);
                });
        }
        if (changes['ngfThumbBackground']) {
            ImagePreview.toDataUrl(this.elem, changes['ngfThumbnail'].currentValue,
                this.ngfResize || {}).then((url) => {
                this.ngfOnProcessing.emit(false);
                ImagePreview.setSrc(this.elem, url, true);
            });
        }
        if (changes['ngfSrc']) {
            ImagePreview.toDataUrl(this.elem, changes['ngfThumbnail'].currentValue,
                this.ngfResize).then((url) => {
                this.ngfOnProcessing.emit(false);
                ImagePreview.setSrc(this.elem, url);
            });
        }
        if (changes['ngfBackground']) {
            ImagePreview.toDataUrl(this.elem, changes['ngfThumbnail'].currentValue,
                this.ngfResize).then((url) => {
                this.ngfOnProcessing.emit(false);
                ImagePreview.setSrc(this.elem, url, true);
            });
        }
    }
}