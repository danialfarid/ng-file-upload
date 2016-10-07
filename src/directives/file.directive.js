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
var core_1 = require('@angular/core');
var core_2 = require('@angular/core');
var forms_1 = require('@angular/forms');
var defaults_js_1 = require("../defaults.js");
var FileModelDirective = (function () {
    function FileModelDirective(el) {
        var _this = this;
        this.attrGetter = function (name) {
            var n = 'ngf' + name.charAt(0).toUpperCase() + name.substring(1);
            return _this[n] || _this[name] || defaults_js_1.Defaults.defaults[n] || defaults_js_1.Defaults.defaults[name];
        };
        this.onChange = function (files) {
            _this.modelTouchFn(files);
            _this.modelChangeFn(files);
        };
        var listener = function (e) {
            _this.onChange(e.detail.files);
            el.nativeElement.dispatchEvent(new CustomEvent('fileChange', { detail: e.detail }));
        };
        el.nativeElement.addEventListener('fileDrop', listener);
        el.nativeElement.addEventListener('fileSelect', listener);
        // upload.registerModelChangeValidator(ngModel, attr, scope);
        // unwatches.push(attr.$observe('id', this.updateId));
        // scope.$on('$destroy', function () {
        // });
        //     if (window.FileAPI && window.FileAPI.ngfFixIE) {
        //         window.FileAPI.ngfFixIE(elem, fileElem, changeFn);
        //     }
    }
    FileModelDirective.prototype.writeValue = function (obj) {
    };
    FileModelDirective.prototype.registerOnChange = function (fn) {
        this.modelChangeFn = fn;
    };
    FileModelDirective.prototype.registerOnTouched = function (fn) {
        this.modelTouchFn = fn;
    };
    FileModelDirective = __decorate([
        core_1.Directive({
            selector: '[ngfDrop],[ngfSelect]',
            providers: [{
                    provide: forms_1.NG_VALUE_ACCESSOR,
                    useExisting: core_2.forwardRef(function () { return FileModelDirective; }),
                    multi: true
                }]
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], FileModelDirective);
    return FileModelDirective;
}());
exports.FileModelDirective = FileModelDirective;
//# sourceMappingURL=file.directive.js.map