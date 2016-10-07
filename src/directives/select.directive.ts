import {Directive, ElementRef, Input, Output, EventEmitter, OnDestroy} from '@angular/core';

import {Select} from "../select.js";
import {AttrDirective} from "./attr.directive";

@Directive({
    selector: '[ngfSelect]',
})
export class SelectDirective extends AttrDirective implements OnDestroy {
    @Output() ngfSelect = new EventEmitter();
    @Output() ngfChange = new EventEmitter();
    @Input() ngfSelectDisabled;
    @Input() ngfClickDisabled;

    private select;

    constructor(el: ElementRef) {
        super();
        this.select = new Select(el.nativeElement, this.attrGetter);
        el.nativeElement.addEventListener('fileSelect', (e) => {
            this.ngfSelect.emit(e.detail);
            this.ngfChange.emit(e.detail);
        });
    }

    ngOnDestroy() {
        this.select.destroy();
    }
}