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
var ThumbnailDirective = (function () {
    function ThumbnailDirective(el) {
        this.ngfOnProcessing = new core_1.EventEmitter();
        this.elem = el.nativeElement;
    }
    ThumbnailDirective.prototype.ngOnChanges = function (changes) {
        var _this = this;
        this.ngfOnProcessing.emit(true);
        if (changes['ngfThumbnail']) {
            image_preview_1.ImagePreview.toDataUrl(this.elem, changes['ngfThumbnail'].currentValue, this.ngfResize || {})
                .then(function (url) {
                _this.ngfOnProcessing.emit(false);
                image_preview_1.ImagePreview.setSrc(_this.elem, url);
            });
        }
        if (changes['ngfThumbBackground']) {
            image_preview_1.ImagePreview.toDataUrl(this.elem, changes['ngfThumbnail'].currentValue, this.ngfResize || {}).then(function (url) {
                _this.ngfOnProcessing.emit(false);
                image_preview_1.ImagePreview.setSrc(_this.elem, url, true);
            });
        }
        if (changes['ngfSrc']) {
            image_preview_1.ImagePreview.toDataUrl(this.elem, changes['ngfThumbnail'].currentValue, this.ngfResize).then(function (url) {
                _this.ngfOnProcessing.emit(false);
                image_preview_1.ImagePreview.setSrc(_this.elem, url);
            });
        }
        if (changes['ngfBackground']) {
            image_preview_1.ImagePreview.toDataUrl(this.elem, changes['ngfThumbnail'].currentValue, this.ngfResize).then(function (url) {
                _this.ngfOnProcessing.emit(false);
                image_preview_1.ImagePreview.setSrc(_this.elem, url, true);
            });
        }
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ThumbnailDirective.prototype, "ngfThumbnail", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ThumbnailDirective.prototype, "ngfThumbBackground", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ThumbnailDirective.prototype, "ngfSrc", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ThumbnailDirective.prototype, "ngfBackground", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ThumbnailDirective.prototype, "ngfResize", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], ThumbnailDirective.prototype, "ngfOnProcessing", void 0);
    ThumbnailDirective = __decorate([
        core_1.Directive({
            selector: '[ngfThumbnail],[ngfSrc],[ngfBackground],[ngfThumbBackground]',
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], ThumbnailDirective);
    return ThumbnailDirective;
}());
exports.ThumbnailDirective = ThumbnailDirective;
//# sourceMappingURL=thumbnail.directive.js.map