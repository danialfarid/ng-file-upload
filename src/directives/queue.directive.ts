import {Directive, ElementRef, Input, SimpleChanges} from "@angular/core";
import {AttrDirective} from "./attr.directive";

@Directive({
    selector: '[ngfQueue]',
})
export class QueueDirective {
    @Input() ngfQueue;
    @Input() ngfAllowDuplicates;
    @Input() ngModel;
    @Input() ngfSource;

    ngOnChanges(changes: SimpleChanges) {
        if (changes['ngfSource']) this.mergeFiles(this.ngfQueue, this.ngfSource);
        if (changes['ngModel']) this.mergeFiles(this.ngfQueue, this.ngModel);
    }

    private mergeFiles(list: any, newFiles: any) {
        // if (this.ngfAllowDuplicates) {
        //     files = (files || []).filter(f => !this.isInPrevFiles(f))
        // }
        // Array.prototype.push.apply(list, newFiles);
    }

    private isInPrevFiles(f) {
        // return this.prevFiles.find(pf => FileModelDirective.areFilesEqual(pf, f) || undefined);
    }
}