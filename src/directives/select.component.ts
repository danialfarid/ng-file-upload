import {Component, ElementRef, Input, Output, EventEmitter, SimpleChanges, OnDestroy} from "@angular/core";
import {Select} from "../select.js";
import {ClickForward} from "../click.forward";
import {AttrDirective} from "./attr.directive";

/**
 * Component for selecting files. It would create a input type file element underneath.
 *
 * @prop ngfAccept {string=} the input type file `accept` attribute to filter the selectable files in the popup.
 * more details [here](https://www.w3schools.com/tags/att_input_accept.asp) or
 * [here](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input)
 * @prop ngfMultiple {boolean=} allows selecting multiple files, default false.
 * more details [here](https://www.w3schools.com/tags/att_input_multiple.asp) or
 * [here](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input)
 * @prop ngfCapture {string=} the input type file `capture` attribute value for mobile devices.
 * more details [here](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input)
 * @prop ngfResetOnClick {boolean=} if true the files will be set to empty once this element is clicked/touched.
 * @prop ngfText {string=} the text to be shown on this element.
 * @prop ngfHtml {string=} the inner html to be set on this element.
 * @prop ngfSelect {EventEmitter=} emitted when the files are selected or changed.
 * @prop ngfChange {EventEmitter=} emitted when the files are selected or changed.
 * @example
 * <ngf-select [(ngModel)]="files", ngfAccept="image/*"></ngf-select>
 * @name SelectComponent [ngf-select]
 */
@Component({
    selector: 'ngf-select',
    template: '<label><input style="visibility:hidden;position:absolute;' +
    'overflow:hidden;width:0px;height:0px;border:none;margin:0px;padding:0px" tabindex="-1" ' +
    'type="file" [accept]="ngfAccept" [attr.capture]="ngfCapture" ' +
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