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
var image_orientation_1 = require("../image.orientation");
var ImageOrientationDirective = (function () {
    function ImageOrientationDirective(el) {
        this.ngfOnFixOrientation = new core_1.EventEmitter();
        this.orientationPromise = function (file) {
            return image_orientation_1.ImageOrientation.applyExifRotation(file);
        };
        this.elem = el.nativeElement;
    }
    ImageOrientationDirective.prototype.ngOnInit = function () {
        if (!this.elem.__ngfModelDirective__)
            return;
        this.elem.__ngfModelDirective__.formatters.push(this.orientationPromise);
    };
    return ImageOrientationDirective;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], ImageOrientationDirective.prototype, "ngfFixOrientation", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", Object)
], ImageOrientationDirective.prototype, "ngfOnFixOrientation", void 0);
ImageOrientationDirective = __decorate([
    core_1.Directive({
        selector: '[ngModel][ngfFixOrientation]',
    }),
    __metadata("design:paramtypes", [core_1.ElementRef])
], ImageOrientationDirective);
exports.ImageOrientationDirective = ImageOrientationDirective;
//# sourceMappingURL=image.orientation.directive.js.map