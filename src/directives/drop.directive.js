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
var core_1 = require("@angular/core");
var drop_js_1 = require("../drop.js");
var attr_directive_1 = require("./attr.directive");
var DropDirective = (function (_super) {
    __extends(DropDirective, _super);
    function DropDirective(el) {
        var _this = this;
        _super.call(this);
        this.ngfDragOver = new core_1.EventEmitter();
        this.ngfChange = new core_1.EventEmitter();
        this.ngfDrop = new core_1.EventEmitter();
        this.ngfDropAvailable = new core_1.EventEmitter();
        new drop_js_1.Drop(el.nativeElement, this.attrGetter);
        setTimeout(function (drop) {
            drop.ngfDropAvailable.emit(drop_js_1.Drop.dropAvailable());
        }, 0, this);
        el.nativeElement.addEventListener('fileDrop', function (e) {
            _this.ngfDrop.emit(e.detail);
            _this.ngfChange.emit(e.detail);
        });
        el.nativeElement.addEventListener('filedragover', function (e) {
            _this.ngfDragOver.emit(e.detail);
        });
        el.nativeElement.addEventListener('filedragleave', function (e) {
            _this.ngfDragOver.emit(-1);
        });
    }
    DropDirective.prototype.ngOnDestroy = function () {
        //todo remove event listeners
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], DropDirective.prototype, "ngfStopPropagation", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], DropDirective.prototype, "ngfAllowDir", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], DropDirective.prototype, "ngfMultiple", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], DropDirective.prototype, "ngfEnableFirefoxPaste", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], DropDirective.prototype, "ngfMaxFiles", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], DropDirective.prototype, "ngfMaxTotalSize", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], DropDirective.prototype, "ngfIncludeDir", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], DropDirective.prototype, "ngfPattern", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], DropDirective.prototype, "ngfDragPattern", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], DropDirective.prototype, "ngfDragOver", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], DropDirective.prototype, "ngfChange", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], DropDirective.prototype, "ngfDrop", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], DropDirective.prototype, "ngfDropAvailable", void 0);
    DropDirective = __decorate([
        core_1.Directive({
            selector: '[ngfDrop]',
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], DropDirective);
    return DropDirective;
}(attr_directive_1.AttrDirective));
exports.DropDirective = DropDirective;
//# sourceMappingURL=drop.directive.js.map