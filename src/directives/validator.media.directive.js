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
var validator_media_1 = require("../validator.media");
var MediaValidatorDirective = MediaValidatorDirective_1 = (function (_super) {
    __extends(MediaValidatorDirective, _super);
    function MediaValidatorDirective() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MediaValidatorDirective.prototype.validate = function (c) {
        var files = c.value;
        return new validator_media_1.MediaValidator(files, this.attrGetter).validate();
    };
    return MediaValidatorDirective;
}(attr_directive_1.AttrDirective));
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], MediaValidatorDirective.prototype, "ngfDuration", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], MediaValidatorDirective.prototype, "ngfMinDuration", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], MediaValidatorDirective.prototype, "ngfMaxDuration", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], MediaValidatorDirective.prototype, "ngfVideoDimensions", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], MediaValidatorDirective.prototype, "ngfVideoMinHeight", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], MediaValidatorDirective.prototype, "ngfVideoMaxHeight", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], MediaValidatorDirective.prototype, "ngfVideoMinWidth", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], MediaValidatorDirective.prototype, "ngfVideoMaxWidth", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], MediaValidatorDirective.prototype, "ngfVideoRatio", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], MediaValidatorDirective.prototype, "ngfVideoMinRatio", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], MediaValidatorDirective.prototype, "ngfVideoMaxRatio", void 0);
MediaValidatorDirective = MediaValidatorDirective_1 = __decorate([
    core_1.Directive({
        selector: 'ngf-select[ngModel],input[type=file][ngModel],[ngfDrop][ngModel],[ngfQueue][ngModel]',
        providers: [{ provide: forms_1.NG_ASYNC_VALIDATORS, useExisting: MediaValidatorDirective_1, multi: true }]
    })
], MediaValidatorDirective);
exports.MediaValidatorDirective = MediaValidatorDirective;
var MediaValidatorDirective_1;
//# sourceMappingURL=validator.media.directive.js.map