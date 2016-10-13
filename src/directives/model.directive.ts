import {Directive, Input, ElementRef, forwardRef} from "@angular/core";
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from "@angular/forms";

@Directive({
    selector: 'ngf-select[ngModel],input[type=file][ngModel],[ngfDrop][ngModel],[ngfQueue][ngModel]',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => FileModelDirective),
        multi: true
    }]
})
export class FileModelDirective implements ControlValueAccessor {
    @Input() ngfMultiple;
    @Input() multiple;

    private modelChangeFn;
    private modelTouchFn;
    private elem;

    constructor(el: ElementRef) {
        this.elem = el.nativeElement;
    }

    public onChange = (e) => {
        var files = (e.target && e.target.files) || (e.detail && e.detail.files);
        if (!files.length) files = null;
        if (!this.ngfMultiple && this.multiple === undefined) {
            files = files && files.length ? files[0] : files;
        }
        if (this.modelTouchFn) this.modelTouchFn(files);
        if (this.modelChangeFn) this.modelChangeFn(files);
    };

    ngOnInit() {
        var elem = this.elem;
        elem.addEventListener('fileDrop', this.onChange);
        if (elem.tagName.toLowerCase() === 'ngf-select') {
            elem = elem.getElementsByTagName('input')[0];
        }
        elem.addEventListener('change', this.onChange);

        this.elem.addEventListener('click', () => {
            if (this.modelTouchFn) this.modelTouchFn();
        });
        this.elem.addEventListener('dragover', () => {
            if (this.modelTouchFn) this.modelTouchFn();
        });
    }

    writeValue(obj: any): void {
    }

    registerOnChange(fn: any): void {
        this.modelChangeFn = fn;
    }

    registerOnTouched(fn: any): void {
        this.modelTouchFn = fn;
    }
}