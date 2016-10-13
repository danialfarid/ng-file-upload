import {Directive, Input} from "@angular/core";
import {Validator, AbstractControl, NG_ASYNC_VALIDATORS} from "@angular/forms";
import {AttrDirective} from "./attr.directive";
import {ImageValidator} from "../validator.image";
@Directive({
    selector: '[ngfDrop],[ngfSelect],ngf-select,input[type=file]',
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

    constructor() {
        super();
    }

    validate(c: AbstractControl): {} {
        // self value
        var files = c.value;
        return new ImageValidator(files, this.attrGetter).validate();
    }
}