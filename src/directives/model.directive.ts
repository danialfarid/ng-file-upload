import {Directive, Input, Output, EventEmitter, ElementRef, forwardRef} from "@angular/core";
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from "@angular/forms";

@Directive({
    selector: 'ngf-select[ngModel],input[type=file][ngModel],[ngfDrop][ngModel],[ngfQueue][ngModel]',
    providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FileModelDirective), multi: true}]
})
export class FileModelDirective implements ControlValueAccessor {
    @Input() ngfMultiple: boolean;
    @Input() multiple;
    @Input() ngfProcessChunk;
    @Input() ngfProcessDelay;
    @Input() ngfKeep;
    @Output() ngfOnProcessing = new EventEmitter();

    private modelChangeFn;
    private modelTouchFn;
    private formatters = [];
    private elem;
    private prevFiles = [];
    private processing;

    constructor(el: ElementRef) {
        this.elem = el.nativeElement;
        this.elem.__ngfModelDirective__ = this;
    }

    ngOnInit() {
        var elem = this.elem;
        elem.addEventListener('fileDrop', this.onChange, false);
        elem.addEventListener('change', this.onChange, false);

        this.elem.addEventListener('click', () => {
            if (this.modelTouchFn) this.modelTouchFn();
        }, false);
        this.elem.addEventListener('dragover', () => {
            if (this.modelTouchFn) this.modelTouchFn();
        }, false);
    }

    onChange = (e) => {
        var files = (e.target && e.target.files && Array.prototype.slice.apply(e.target.files)) ||
            (e.detail && e.detail.files);
        if (this.processing && !this.ngfKeep) {
            this.stopProcessing();
        }
        if (this.ngfKeep === 'distinct') {
            files = (files || []).filter(f => !this.isInPrevFiles(f))
        }
        if (!files || !files.length) return this.fireChange(null);

        this.ngfProcessChunk = this.ngfProcessChunk || files.length;
        if (this.formatters.length) {
            this.processing = true;
            this.runFileChunks(files, 0, parseInt(this.ngfProcessChunk));
        } else {
            this.fireChange(files);
        }
    };

    private fireChange(files: any) {
        if (this.ngfKeep && (!files || !files.length)) return;
        if (this.ngfKeep) {
            files = this.prevFiles.concat(files || []);
        }
        this.prevFiles = files || [];
        if (this.modelChangeFn) {
            var isMultiple = this.ngfMultiple || this.multiple !== undefined;
            this.modelChangeFn(isMultiple ? files : (files ? files[0] : null));
        }
        return files;
    }

    private isInPrevFiles(f) {
        return this.prevFiles.find(pf => FileModelDirective.areFilesEqual(pf, f) || undefined);
    }

    private runFileChunks(files, start, chunk) {
        if (start >= files.length || !this.processing) return this.stopProcessing();
        this.ngfOnProcessing.emit(true);
        var filesChunk = files.slice(start, Math.min(files.length, start + chunk));
        this.runFormatters(filesChunk).then(() => {
            if (this.processing) {
                this.fireChange(filesChunk);
                setTimeout(() => this.runFileChunks(files, start + chunk, chunk), this.ngfProcessDelay || 0);
            }
        });
    }

    private runFormatters(files) {
        return new Promise(resolve => {
            var runNext = (formatterIndex, fileIndex) => {
                if (fileIndex >= files.length || !this.processing) return resolve(files);
                var file = files[fileIndex];
                if (formatterIndex < this.formatters.length) {
                    this.formatters[formatterIndex](file).then(res => {
                        files.splice(fileIndex, 1, res);
                        runNext(formatterIndex + 1, fileIndex);
                    });
                } else {
                    runNext(0, fileIndex + 1);
                }
            };
            runNext(0, 0);
        });
    }

    private stopProcessing() {
        this.processing = false;
        if (!this.ngfKeep) this.prevFiles = [];
        return this.ngfOnProcessing.emit(false);
    }

    private static areFilesEqual(f1, f2) {
        return f1.name === f2.name && (f1.$ngfOrigSize || f1.size) === (f2.$ngfOrigSize || f2.size) &&
            f1.type === f2.type;
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