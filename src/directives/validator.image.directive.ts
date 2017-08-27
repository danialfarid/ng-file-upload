import {Directive, Input} from "@angular/core";
import {AbstractControl, NG_ASYNC_VALIDATORS, Validator} from "@angular/forms";
import {AttrDirective} from "./attr.directive";
import {ImageValidator} from "../validator.image";

/**
 * Validates the `ngModel` files on this element.
 * The error message name would be the validation name without `ngf` prefix.
 *
 * @prop ngfDimensions {string=} Maximum allowed file size.
 * @prop ngfMinHeight {string=} Minimum allowed file size.
 * @prop ngfMaxHeight {number=} Maximum number of files allowed.
 * @prop ngfMinWidth {number=} Maximum number of files allowed.
 * @prop ngfMaxWidth {number=} Maximum number of files allowed.
 * @prop ngfRatio {boolean=} Maximum total sum of the file sizes allowed.
 * @prop ngfMinRatio {FilePattern=} The file pattern allowed on this element.
 * @prop ngfMaxRatio {FilePattern=} The file pattern allowed on this element.
 *
 * @example
 * <div ngfDrop [(ngModel)]="images", ngfRatio="image/*", ngfMaxSize="2MB"></div>
 * @name ImageValidatorDirective
 */
@Directive({
    selector: 'ngf-select[ngModel],input[type=file][ngModel],[ngfDrop][ngModel],[ngfQueue][ngModel]',
    providers: [{provide: NG_ASYNC_VALIDATORS, useExisting: ImageValidatorDirective, multi: true}]
})
export class ImageValidatorDirective extends AttrDirective implements Validator {
    @Input() ngfDimensions;
    @Input() ngfMinHeight;
    @Input() ngfMaxHeight;
    @Input() ngfMinWidth;
    @Input() ngfMaxWidth;
    @Input() ngfRatio;
    @Input() ngfMinRatio;
    @Input() ngfMaxRatio;

    validate(c: AbstractControl): {} {
        var files = c.value;
        return new ImageValidator(files, this.attrGetter).validate();
    }
}