import {Directive, Input, Output, EventEmitter, ElementRef} from "@angular/core";
import {ImageOrientation} from "../image.orientation";

@Directive({
    selector: '[ngModel][ngfFixOrientation]',
})
export class ImageOrientationDirective {
    @Input() ngfFixOrientation;
    @Output() ngfOnFixOrientation = new EventEmitter();

    private elem;

    constructor(el: ElementRef) {
        this.elem = el.nativeElement;
    }

    ngOnInit() {
        if (!this.elem.__ngfModelDirective__) return;
        this.elem.__ngfModelDirective__.formatters.push(this.orientationPromise);
    }

    orientationPromise = (file) => {
        return ImageOrientation.applyExifRotation(file);
    };
}