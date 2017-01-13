import {Component, ElementRef, Input, Output, EventEmitter, SimpleChanges, OnDestroy} from "@angular/core";
import {Select} from "../select.js";
import {ClickForward} from "../click.forward";
import {AttrDirective} from "./attr.directive";

@Component({
    selector: 'ngf-select',
    template: '<label><input style="visibility:hidden;position:absolute;' +
    'overflow:hidden;width:0px;height:0px;border:none;margin:0px;padding:0px" tabindex="-1" ' +
    'type="file" [accept]="ngfAccept" ' +
    '[multiple]="ngfMultiple">{{ngfText}}<div *ngIf="ngfHtml" [innerHTML]="ngfHtml"></div></label>'
})
export class SelectComponent extends AttrDirective implements OnDestroy {
    @Output() ngfSelect = new EventEmitter();
    @Output() ngfChange = new EventEmitter();
    @Input() ngfText;
    @Input() ngfHtml;
    @Input() ngfResetOnClick = true;
    @Input() ngfCapture;
    @Input() ngfMultiple;
    @Input() ngfAccept;
    @Input() disabled;

    private select;
    private elem;

    constructor(el: ElementRef) {
        super();
        this.elem = el.nativeElement;
        this.ngfHtml = this.elem.innerHTML;
    }

    ngOnInit() {
        this.select = new Select(this.elem, this.elem.firstChild.firstChild, this.attrGetter);
        this.elem.addEventListener('change', (e) => {
            this.ngfSelect.emit(e.target && e.target.files);
            this.ngfChange.emit(e.target && e.target.files);
        }, false);
        new ClickForward(this.elem, this.elem.firstChild);
        // this.elem.firstChild.firstChild.addEventListener('change', (e:any) => {
        //     this.elem.dispatchEvent(new CustomEvent('change',
        //         e.detail ? e.detail : {detail: {files: e.target.files, origEvent: e}}));
        // });
    }

    ngOnDestroy() {
        this.select.destroy();
    }

    ngOnChange(changes: SimpleChanges) {
        //had to manually set capture since angular doesn't know of capture on input
        if (changes['ngfCapture']) {
            this.elem.setAttribute('capture', changes['ngfCapture'].currentValue);
        }
    }
}