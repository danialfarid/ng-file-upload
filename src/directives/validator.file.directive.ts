import {Directive, Input} from "@angular/core";
import {AbstractControl, NG_VALIDATORS, Validator} from "@angular/forms";
import {FileValidator} from "../validator.file";
import {AttrDirective} from "./attr.directive";

/**
 * Validates the `ngModel` files on this element.
 * The error message name would be the validation name without `ngf` prefix.
 *
 * @prop ngfMaxSize {FileSize=} Maximum allowed file size.
 * @prop ngfMinSize {FileSize=} Minimum allowed file size.
 * @prop ngfMaxFiles {number=} Maximum number of files allowed.
 * @prop ngfMaxTotalSize {FileSize=} Maximum total sum of the file sizes allowed.
 * @prop ngfPattern {FilePattern=} The file pattern allowed on this element.
 *
 * @example
 * <ngf-select [(ngModel)]="files", ngfPattern="application/pdf", ngfMaxSize="2MB"></ngf-select>
 * @name FileValidatorDirective
 */
@Directive({
    selector: 'ngf-select[ngModel],input[type=file][ngModel],[ngfDrop][ngModel],[ngfQueue][ngModel]',
    providers: [{provide: NG_VALIDATORS, useExisting: FileValidatorDirective, multi: true}]
})
export class FileValidatorDirective extends AttrDirective implements Validator {
    @Input() ngfMaxSize;
    @Input() ngfMinSize;
    @Input() ngfMaxFiles;
    @Input() ngfMaxTotalSize;
    @Input() ngfPattern;
    // @Input() ngfValidateFn;

    validate(c: AbstractControl): {} {
        var files = c.value;
        return new FileValidator(files, this.attrGetter, 0).validate();
        // // control vlaue
        // let e = c.root.get(this.validateEqual);
        //
        // // value not equal
        // if (e && v !== e.value && !this.isReverse) {
        //     return {
        //         validateEqual: false
        //     }
        // }

        // // value equal and reverse
        // if (e && v === e.value && this.isReverse) {
        //     delete e.errors['validateEqual'];
        //     if (!Object.keys(e.errors).length) e.setErrors(null);
        // }

        // value not equal and reverse
        // if (e && v !== e.value && this.isReverse) {
        //     e.setErrors({ validateEqual: false });
        // }

        // return null;
    }
}