import {Directive, ElementRef, EventEmitter, Input, OnDestroy, Output} from "@angular/core";
import {Drop} from "../drop.js";
import {AttrDirective} from "./attr.directive";

/**
 * Enables file drag&drop and paste events on this element.
 *
 * @prop ngfStopPropagation {boolean=} if true would stop the drag&drop event propagation to other event handlers.
 * @prop ngfAllowDir {boolean=} allow dropping folders for Chrome only.
 * @prop ngfMultiple {boolean=} allow dropping multiple files.
 * @prop multiple {boolean=} enable multiple file select.
 * @prop ngfMaxFiles {number=} max number of files that can be dropped.
 * @prop ngfMaxTotalSize {number=} max total size of the files that can be dropped.
 * @prop ngfIncludeDir {boolean=} include the directory as a file item in the list of dropped files.
 * @prop ngfDragPattern {string=} the pattern to validate if the files that are dragged over are valid for Chrome only.
 * This pattern should only validate the file type since that's the only information available during the drag.
 * @prop ngfEnableFirefoxPaste {boolean=} (Experimental) allow file paste on this element in FireFox browser.
 * @prop ngfDragOver {EventEmitter=} Emitted on drag over and `$event` indicates number of valid dragged files.
 * You can use this value to know if there is any valid file is being dragged and change the css class of the drop
 * area accordingly. Only for Chrome.
 * @prop ngfChange {EventEmitter=} this event will be emitted on files drop.
 * @prop ngfDrop {EventEmitter=} this event will be emitted on files drop.
 * @prop ngfDropAvailable {EventEmitter=} this event will be emitted only one time and `$event` value
 * is a boolean indicating whether file drag&drop is available for this browser.
 *
 * @example
 *  <div ngfDrop [(ngModel)]="files"
 * [multiple]="multiple" [ngfPattern]="pattern"
 * [ngfMaxFiles]="maxFiles"
 * [ngfAllowDir]="allowDir"
 * (ngfDropAvailable)="dropAvailable=$event"
 * [hidden]="!dropAvailable"
 * class="drop-box">
 *
 * @name DropDirective [ngfDrop]
 */
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
        }, false);
        el.nativeElement.addEventListener('filedragover', (e) => {
            this.ngfDragOver.emit(e.detail);
        }, false);
        el.nativeElement.addEventListener('filedragleave', (e) => {
            this.ngfDragOver.emit(-1);
        }, false);
    }

    ngOnDestroy(): void {
        //todo remove event listeners
    }
}