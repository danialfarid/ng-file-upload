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
var forms_1 = require("@angular/forms");
var attr_directive_1 = require("./attr.directive");
var validator_image_1 = require("../validator.image");
var ImageValidatorDirective = (function (_super) {
    __extends(ImageValidatorDirective, _super);
    function ImageValidatorDirective() {
        _super.call(this);
    }
    ImageValidatorDirective.prototype.validate = function (c) {
        // self value
        var files = c.value;
        return new validator_image_1.ImageValidator(files, this.attrGetter).validate();
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ImageValidatorDirective.prototype, "ngfDimensions", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ImageValidatorDirective.prototype, "ngfMinHeight", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ImageValidatorDirective.prototype, "ngfMaxHeight", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ImageValidatorDirective.prototype, "ngfMinWidth", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ImageValidatorDirective.prototype, "ngfMaxWidth", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ImageValidatorDirective.prototype, "ngfRatio", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ImageValidatorDirective.prototype, "ngfMinRatio", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ImageValidatorDirective.prototype, "ngfMaxRatio", void 0);
    ImageValidatorDirective = __decorate([
        core_1.Directive({
            selector: '[ngfDrop],[ngfSelect],ngf-select,input[type=file]',
            providers: [{ provide: forms_1.NG_ASYNC_VALIDATORS, useExisting: ImageValidatorDirective, multi: true }]
        }), 
        __metadata('design:paramtypes', [])
    ], ImageValidatorDirective);
    return ImageValidatorDirective;
}(attr_directive_1.AttrDirective));
exports.ImageValidatorDirective = ImageValidatorDirective;
//# sourceMappingURL=validator.image.directive.js.map