import {Directive, ElementRef, Input} from "@angular/core";
import {ClickForward} from "../click.forward";

/**
 * Forwards the click and touch events on this element to the target element.
 *
 * @prop ngfClickForward {string=} - target element id. If not specified the first <code>ngf-select</code>
 * child element of this element (or whole document if not available) will be chosen as target.
 *
 * @example
 * <button ngfClickForward>
 *     <ngf-select [(ngModel)]="audioFile" ngfText="Select Audio"></ngf-select>
 * </button>
 * <button ngfClickForward="myFileElem">
 * Or
 * </button>
 * <input type="file" id="myFileElem">
 * @name ClickForwardDirective [ngfClickForward]
 */
@Directive({
    selector: '[ngfClickForward]',
})

export class ClickForwardDirective {
    @Input() ngfClickForward;
    private elem;
    private targetEl;
    private clickForward;

    constructor(el: ElementRef) {
        this.elem = el.nativeElement;
    }

    ngOnChanges() {
        if (this.clickForward) this.clickForward.destroy();
        this.targetEl = this.ngfClickForward ?
            document.getElementById(this.ngfClickForward).firstChild :
            (this.findNgfSelect(this.elem) || this.findNgfSelect(document));
        this.clickForward = new ClickForward(this.elem, this.targetEl);
    }

    private findNgfSelect(el) {
        return el.getElementsByTagName('ngf-select').length &&
            el.getElementsByTagName('ngf-select')[0].firstChild;
    }
}