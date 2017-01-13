"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var FileModelDirective = (function () {
    function FileModelDirective(el) {
        var _this = this;
        this.ngfOnProcessing = new core_1.EventEmitter();
        this.formatters = [];
        this.prevFiles = [];
        this.onChange = function (e) {
            var files = (e.target && e.target.files && Array.prototype.slice.apply(e.target.files)) ||
                (e.detail && e.detail.files);
            if (_this.processing && !_this.ngfKeep) {
                _this.stopProcessing();
            }
            if (_this.ngfKeep === 'distinct') {
                files = (files || []).filter(function (f) { return !_this.isInPrevFiles(f); });
            }
            if (!files || !files.length)
                return _this.fireChange(null);
            _this.ngfProcessChunk = _this.ngfProcessChunk || files.length;
            if (_this.formatters.length) {
                _this.processing = true;
                _this.runFileChunks(files, 0, parseInt(_this.ngfProcessChunk));
            }
            else {
                _this.fireChange(files);
            }
        };
        this.elem = el.nativeElement;
        this.elem.__ngfModelDirective__ = this;
    }
    FileModelDirective.prototype.ngOnInit = function () {
        var _this = this;
        var elem = this.elem;
        elem.addEventListener('fileDrop', this.onChange, false);
        elem.addEventListener('change', this.onChange, false);
        this.elem.addEventListener('click', function () {
            if (_this.modelTouchFn)
                _this.modelTouchFn();
        }, false);
        this.elem.addEventListener('dragover', function () {
            if (_this.modelTouchFn)
                _this.modelTouchFn();
        }, false);
    };
    FileModelDirective.prototype.fireChange = function (files) {
        if (this.ngfKeep && (!files || !files.length))
            return;
        if (this.ngfKeep) {
            files = this.prevFiles.concat(files || []);
        }
        this.prevFiles = files || [];
        if (this.modelChangeFn) {
            var isMultiple = this.ngfMultiple || this.multiple !== undefined;
            this.modelChangeFn(isMultiple ? files : files[0] || null);
        }
        return files;
    };
    FileModelDirective.prototype.isInPrevFiles = function (f) {
        return this.prevFiles.find(function (pf) { return FileModelDirective.areFilesEqual(pf, f) || undefined; });
    };
    FileModelDirective.prototype.runFileChunks = function (files, start, chunk) {
        var _this = this;
        if (start >= files.length || !this.processing)
            return this.stopProcessing();
        this.ngfOnProcessing.emit(true);
        var filesChunk = files.slice(start, Math.min(files.length, start + chunk));
        this.runFormatters(filesChunk).then(function () {
            if (_this.processing) {
                _this.fireChange(filesChunk);
                setTimeout(function () { return _this.runFileChunks(files, start + chunk, chunk); }, _this.ngfProcessDelay || 0);
            }
        });
    };
    FileModelDirective.prototype.runFormatters = function (files) {
        var _this = this;
        return new Promise(function (resolve) {
            var runNext = function (formatterIndex, fileIndex) {
                if (fileIndex >= files.length || !_this.processing)
                    return resolve(files);
                var file = files[fileIndex];
                if (formatterIndex < _this.formatters.length) {
                    _this.formatters[formatterIndex](file).then(function (res) {
                        files.splice(fileIndex, 1, res);
                        runNext(formatterIndex + 1, fileIndex);
                    });
                }
                else {
                    runNext(0, fileIndex + 1);
                }
            };
            runNext(0, 0);
        });
    };
    FileModelDirective.prototype.stopProcessing = function () {
        this.processing = false;
        if (!this.ngfKeep)
            this.prevFiles = [];
        return this.ngfOnProcessing.emit(false);
    };
    FileModelDirective.areFilesEqual = function (f1, f2) {
        return f1.name === f2.name && (f1.$ngfOrigSize || f1.size) === (f2.$ngfOrigSize || f2.size) &&
            f1.type === f2.type;
    };
    FileModelDirective.prototype.writeValue = function (obj) {
    };
    FileModelDirective.prototype.registerOnChange = function (fn) {
        this.modelChangeFn = fn;
    };
    FileModelDirective.prototype.registerOnTouched = function (fn) {
        this.modelTouchFn = fn;
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], FileModelDirective.prototype, "ngfMultiple", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], FileModelDirective.prototype, "multiple", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], FileModelDirective.prototype, "ngfProcessChunk", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], FileModelDirective.prototype, "ngfProcessDelay", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], FileModelDirective.prototype, "ngfKeep", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], FileModelDirective.prototype, "ngfOnProcessing", void 0);
    FileModelDirective = __decorate([
        core_1.Directive({
            selector: 'ngf-select[ngModel],input[type=file][ngModel],[ngfDrop][ngModel],[ngfQueue][ngModel]',
            providers: [{ provide: forms_1.NG_VALUE_ACCESSOR, useExisting: core_1.forwardRef(function () { return FileModelDirective; }), multi: true }]
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], FileModelDirective);
    return FileModelDirective;
}());
exports.FileModelDirective = FileModelDirective;
//# sourceMappingURL=model.directive.js.map