import {Directive, ElementRef, Input, SimpleChanges} from "@angular/core";
import {AttrDirective} from "./attr.directive";

@Directive({
    selector: '[ngfQueue]',
})
export class QueueDirective extends AttrDirective {
    @Input() ngfQueue;

    constructor(el: ElementRef) {
        super();
        // el.nativeElement.dispatchEvent(new CustomEvent('fileQueue', {detail: e.detail}));
    }

    ngOnChanges(changes: SimpleChanges) {
        console.log(changes['ngfQueue']);
    }
}