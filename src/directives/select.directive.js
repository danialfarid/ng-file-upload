"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var select_js_1 = require("../select.js");
var attr_directive_1 = require("./attr.directive");
var SelectDirective = (function (_super) {
    __extends(SelectDirective, _super);
    function SelectDirective(el) {
        var _this = this;
        _super.call(this);
        this.ngfSelect = new core_1.EventEmitter();
        this.ngfChange = new core_1.EventEmitter();
        this.select = new select_js_1.Select(el.nativeElement, this.attrGetter);
        el.nativeElement.addEventListener('fileSelect', function (e) {
            _this.ngfSelect.emit(e.detail);
            _this.ngfChange.emit(e.detail);
        });
    }
    SelectDirective.prototype.ngOnDestroy = function () {
        this.select.destroy();
    };
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], SelectDirective.prototype, "ngfSelect", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], SelectDirective.prototype, "ngfChange", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], SelectDirective.prototype, "ngfSelectDisabled", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], SelectDirective.prototype, "ngfClickDisabled", void 0);
    SelectDirective = __decorate([
        core_1.Directive({
            selector: '[ngfSelect]',
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], SelectDirective);
    return SelectDirective;
}(attr_directive_1.AttrDirective));
exports.SelectDirective = SelectDirective;
//# sourceMappingURL=select.directive.js.map