import {Directive, ElementRef, Input} from '@angular/core';
import {Validator, AbstractControl, NG_VALIDATORS} from '@angular/forms';
import {FileValidator} from "../validator.file";
import {AttrDirective} from "./attr.directive";
@Directive({
    selector: '[ngfDrop],[ngfSelect]',
    providers: [{provide: NG_VALIDATORS, useExisting: FileValidatorDirective, multi: true}]
})
export class FileValidatorDirective extends AttrDirective implements Validator {
    @Input() ngfMaxSize;
    @Input() ngfMinSize;
    @Input() ngfMaxFiles;
    @Input() ngfMaxTotalSize;
    @Input() ngfValidateFn;
    @Input() ngfPattern;

    constructor(el: ElementRef) {
        super();
        // upload.registerModelChangeValidator(ngModel, attr, scope);
        // unwatches.push(attr.$observe('id', this.updateId));
        // scope.$on('$destroy', function () {
        // });
        //     if (window.FileAPI && window.FileAPI.ngfFixIE) {
        //         window.FileAPI.ngfFixIE(elem, fileElem, changeFn);
        //     }
    }

    validate(c: AbstractControl): {} {
        // self value
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