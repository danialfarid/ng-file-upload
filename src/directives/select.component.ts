import {Component, ElementRef, Input, Output, EventEmitter, SimpleChanges, OnDestroy} from "@angular/core";
import {Select} from "../select.js";
import {ClickForward} from "../click.forward";

@Component({
    selector: 'ngf-select',
    template: '<label><input style="visibility:hidden;position:absolute;' +
    'overflow:hidden;width:0px;height:0px;border:none;margin:0px;padding:0px" tabindex="-1" ' +
    'type="file" [accept]="ngfAccept" ' +
    '[multiple]="ngfMultiple">{{ngfText}}<div *ngIf="ngfHtml" [innerHTML]="ngfHtml"></div></label>'
})
export class SelectComponent implements OnDestroy {
    @Output() ngfSelect = new EventEmitter();
    @Output() ngfChange = new EventEmitter();
    @Input() ngfText;
    @Input() ngfHtml;
    @Input() ngfResetOnClick;
    @Input() ngfCapture;
    @Input() ngfMultiple;
    @Input() ngfAccept;
    @Input() disabled;

    private select;
    private elem;

    constructor(el: ElementRef) {
        this.elem = el.nativeElement;
        this.select = new Select(el.nativeElement, this.ngfResetOnClick);
        this.elem.addEventListener('chnge', (e) => {
            this.ngfSelect.emit(e.target && e.target.files);
            this.ngfChange.emit(e.target && e.target.files);
        });
        this.ngfHtml = this.elem.innerHTML;
    }

    ngOnInit() {
        new ClickForward(this.elem, this.elem.firstChild);
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