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
var image_preview_1 = require("../image.preview");
var ThumbDirective = (function () {
    function ThumbDirective(el) {
        this.ngfOnProcessing = new core_1.EventEmitter();
        this.elem = el.nativeElement;
    }
    ThumbDirective.prototype.ngOnChanges = function (changes) {
        var _this = this;
        this.ngfOnProcessing.emit(true);
        if (changes['ngfThumb']) {
            image_preview_1.ImagePreview.resizeToDataUrl(this.elem, changes['ngfThumb'].currentValue, this.ngfResize || {})
                .then(function (url) {
                _this.ngfOnProcessing.emit(false);
                image_preview_1.ImagePreview.setSrc(_this.elem, url);
            });
        }
        if (changes['ngfThumbBackground']) {
            image_preview_1.ImagePreview.resizeToDataUrl(this.elem, changes['ngfThumbBackground'].currentValue, this.ngfResize || {}).then(function (url) {
                _this.ngfOnProcessing.emit(false);
                image_preview_1.ImagePreview.setSrc(_this.elem, url, true);
            });
        }
        if (changes['ngfSrc']) {
            image_preview_1.ImagePreview.resizeToDataUrl(this.elem, changes['ngfSrc'].currentValue, this.ngfResize).then(function (url) {
                _this.ngfOnProcessing.emit(false);
                image_preview_1.ImagePreview.setSrc(_this.elem, url);
            });
        }
        if (changes['ngfBackground']) {
            image_preview_1.ImagePreview.resizeToDataUrl(this.elem, changes['ngfBackground'].currentValue, this.ngfResize).then(function (url) {
                _this.ngfOnProcessing.emit(false);
                image_preview_1.ImagePreview.setSrc(_this.elem, url, true);
            });
        }
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ThumbDirective.prototype, "ngfThumb", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ThumbDirective.prototype, "ngfThumbBackground", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ThumbDirective.prototype, "ngfSrc", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ThumbDirective.prototype, "ngfBackground", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ThumbDirective.prototype, "ngfResize", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], ThumbDirective.prototype, "ngfOnProcessing", void 0);
    ThumbDirective = __decorate([
        core_1.Directive({
            selector: '[ngfThumb],[ngfSrc],[ngfBackground],[ngfThumbBackground]',
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], ThumbDirective);
    return ThumbDirective;
}());
exports.ThumbDirective = ThumbDirective;
//# sourceMappingURL=thumb.directive.js.map