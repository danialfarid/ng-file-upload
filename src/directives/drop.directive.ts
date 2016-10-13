import {Directive, ElementRef, Input, Output, EventEmitter, OnDestroy} from "@angular/core";
import {Drop} from "../drop.js";
import {AttrDirective} from "./attr.directive";

@Directive({
    selector: '[ngfDrop]',
})
export class DropDirective extends AttrDirective implements OnDestroy {
    @Input() ngfStopPropagation;
    @Input() ngfAllowDir;
    @Input() ngfMultiple;
    @Input() ngfEnableFirefoxPaste;
    @Input() ngfMaxFiles;
    @Input() ngfMaxTotalSize;
    @Input() ngfIncludeDir;
    @Input() ngfPattern;
    @Input() ngfDragPattern;
    @Output() ngfDragOver = new EventEmitter();
    @Output() ngfChange = new EventEmitter();
    @Output() ngfDrop = new EventEmitter();
    @Output() ngfDropAvailable = new EventEmitter();

    constructor(el: ElementRef) {
        super();
        new Drop(el.nativeElement, this.attrGetter);
        setTimeout(function (drop) {
            drop.ngfDropAvailable.emit(Drop.dropAvailable());
        }, 0, this);
        el.nativeElement.addEventListener('fileDrop', (e) => {
            this.ngfDrop.emit(e.detail);
            this.ngfChange.emit(e.detail);
        });
        el.nativeElement.addEventListener('filedragover', (e) => {
            this.ngfDragOver.emit(e.detail);
        });
        el.nativeElement.addEventListener('filedragleave', (e) => {
            this.ngfDragOver.emit(-1);
        });
    }

    ngOnDestroy(): void {
        //todo remove event listeners
    }
}