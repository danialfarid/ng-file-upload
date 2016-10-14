import {Directive, Input} from "@angular/core";
import {Validator, AbstractControl, NG_ASYNC_VALIDATORS} from "@angular/forms";
import {AttrDirective} from "./attr.directive";
import {MediaValidator} from "../validator.media";
@Directive({
    selector: 'ngf-select[ngModel],input[type=file][ngModel],[ngfDrop][ngModel],[ngfQueue][ngModel]',
    providers: [{provide: NG_ASYNC_VALIDATORS, useExisting: MediaValidatorDirective, multi: true}]
})
export class MediaValidatorDirective extends AttrDirective implements Validator {
    @Input() ngfDuration;
    @Input() ngfMinDuration;
    @Input() ngfMaxDuration;
    @Input() ngfVideoDimensions;
    @Input() ngfVideoMinHeight;
    @Input() ngfVideoMaxHeight;
    @Input() ngfVideoMinWidth;
    @Input() ngfVideoMaxWidth;
    @Input() ngfVideoRatio;
    @Input() ngfVideoMinRatio;
    @Input() ngfVideoMaxRatio;


    constructor() {
        super();
    }

    validate(c: AbstractControl): {} {
        var files = c.value;
        return new MediaValidator(files, this.attrGetter).validate();
    }
}