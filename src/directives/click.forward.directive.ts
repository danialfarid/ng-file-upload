import {Directive, ElementRef, Input} from "@angular/core";
import {AttrDirective} from "./attr.directive";
import {ClickForward} from "../click.forward";

@Directive({
    selector: '[ngfClickForward]',
})
export class ClickForwardDirective extends AttrDirective {
    @Input() ngfClickForward;
    private elem;
    private targetEl;
    private clickForward;

    constructor(el: ElementRef) {
        this.elem = el.nativeElement;
        super();
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