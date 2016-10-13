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
        this.onChange = function (e) {
            var files = (e.target && e.target.files) || (e.detail && e.detail.files);
            if (!files.length)
                files = null;
            if (!_this.ngfMultiple && _this.multiple === undefined) {
                files = files && files.length ? files[0] : files;
            }
            if (_this.modelTouchFn)
                _this.modelTouchFn(files);
            if (_this.modelChangeFn)
                _this.modelChangeFn(files);
        };
        this.elem = el.nativeElement;
    }
    FileModelDirective.prototype.ngOnInit = function () {
        var _this = this;
        var elem = this.elem;
        elem.addEventListener('fileDrop', this.onChange);
        if (elem.tagName.toLowerCase() === 'ngf-select') {
            elem = elem.getElementsByTagName('input')[0];
        }
        elem.addEventListener('change', this.onChange);
        this.elem.addEventListener('click', function () {
            if (_this.modelTouchFn)
                _this.modelTouchFn();
        });
        this.elem.addEventListener('dragover', function () {
            if (_this.modelTouchFn)
                _this.modelTouchFn();
        });
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
        __metadata('design:type', Object)
    ], FileModelDirective.prototype, "ngfMultiple", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], FileModelDirective.prototype, "multiple", void 0);
    FileModelDirective = __decorate([
        core_1.Directive({
            selector: 'ngf-select[ngModel],input[type=file][ngModel],[ngfDrop][ngModel],[ngfQueue][ngModel]',
            providers: [{
                    provide: forms_1.NG_VALUE_ACCESSOR,
                    useExisting: core_1.forwardRef(function () { return FileModelDirective; }),
                    multi: true
                }]
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], FileModelDirective);
    return FileModelDirective;
}());
exports.FileModelDirective = FileModelDirective;
//# sourceMappingURL=model.directive.js.map