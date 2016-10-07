import {Directive, ElementRef} from '@angular/core';
import {forwardRef} from '@angular/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/forms';

import {Defaults} from "../defaults.js";

@Directive({
    selector: '[ngfDrop],[ngfSelect]',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => FileModelDirective),
        multi: true
    }]
})
export class FileModelDirective implements ControlValueAccessor {
    private modelChangeFn;
    private modelTouchFn;

    constructor(el: ElementRef) {
        var listener = (e) => {
            this.onChange(e.detail.files);
            el.nativeElement.dispatchEvent(new CustomEvent('fileChange', {detail: e.detail}));
        };
        el.nativeElement.addEventListener('fileDrop', listener);
        el.nativeElement.addEventListener('fileSelect', listener);
        // upload.registerModelChangeValidator(ngModel, attr, scope);
        // unwatches.push(attr.$observe('id', this.updateId));
        // scope.$on('$destroy', function () {
        // });
        //     if (window.FileAPI && window.FileAPI.ngfFixIE) {
        //         window.FileAPI.ngfFixIE(elem, fileElem, changeFn);
        //     }
    }

    public attrGetter = (name) => {
        var n = 'ngf' + name.charAt(0).toUpperCase() + name.substring(1);
        return this[n] || this[name] || Defaults.defaults[n] || Defaults.defaults[name];
    };

    public onChange = (files) => {
        this.modelTouchFn(files);
        this.modelChangeFn(files);
    };

    writeValue(obj: any): void {
    }

    registerOnChange(fn: any): void {
        this.modelChangeFn = fn;
    }

    registerOnTouched(fn: any): void {
        this.modelTouchFn = fn;
    }
}