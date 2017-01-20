import {Directive, Input, Output, EventEmitter, ElementRef} from "@angular/core";
import {ImageResizer} from "../image.resize";

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
        return ImageResizer.resize(file, this.ngfResize);
    };
}