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
var image_resize_1 = require("../image.resize");
var ImageResizeDirective = (function () {
    function ImageResizeDirective(el) {
        var _this = this;
        this.ngfOnResize = new core_1.EventEmitter();
        this.resizePromise = function (file) {
            return image_resize_1.ImageResizer.resize(file, _this.ngfResize);
        };
        this.elem = el.nativeElement;
    }
    ImageResizeDirective.prototype.ngOnInit = function () {
        if (!this.elem.__ngfModelDirective__)
            return;
        this.elem.__ngfModelDirective__.formatters.splice(0, 0, this.resizePromise);
    };
    return ImageResizeDirective;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], ImageResizeDirective.prototype, "ngfResize", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", Object)
], ImageResizeDirective.prototype, "ngfOnResize", void 0);
ImageResizeDirective = __decorate([
    core_1.Directive({
        selector: '[ngModel][ngfResize]',
    }),
    __metadata("design:paramtypes", [core_1.ElementRef])
], ImageResizeDirective);
exports.ImageResizeDirective = ImageResizeDirective;
//# sourceMappingURL=image.resize.directive.js.map