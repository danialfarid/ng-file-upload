import {Directive, Input, Output, EventEmitter, ElementRef} from "@angular/core";
import {ImageOrientation} from "../image.orientation";

/**
 * Enables fixing the orientation from EXIF data for image files captured in `ngModel`.
 *
 * @prop ngfFixOrientation {boolean=} if true the image file in the model will be processed to
 * apply the orientation that is specified in the EXIF data and generate a new image with the orientation
 * change applied and the EXIF data updated to reflect no orientation.
 * @prop ngfOnFixOrientation {EventEmitter=} the event will be emitted after the orientation fix is applied wethere
 * successful or failure.
 *
 * @example
 *  <div ngfDrop [(ngModel)]="files"
 *    ngfFixOrientation="true" (ngfOnFixOrientation)="endOfOrientationFix($event)">
 *  </div>
 *
 * @name ImageOrientationDirective [ngfFixOrientation]
 */

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
        return ImageOrientation.applyExifRotation(file)
            .then((r) => this.ngfOnFixOrientation.emit(r))
            .catch((e) => this.ngfOnFixOrientation.emit(e));
    };
}