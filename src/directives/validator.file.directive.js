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
var forms_1 = require('@angular/forms');
var validator_file_1 = require("../validator.file");
var attr_directive_1 = require("./attr.directive");
var FileValidatorDirective = (function (_super) {
    __extends(FileValidatorDirective, _super);
    function FileValidatorDirective(el) {
        _super.call(this);
        // upload.registerModelChangeValidator(ngModel, attr, scope);
        // unwatches.push(attr.$observe('id', this.updateId));
        // scope.$on('$destroy', function () {
        // });
        //     if (window.FileAPI && window.FileAPI.ngfFixIE) {
        //         window.FileAPI.ngfFixIE(elem, fileElem, changeFn);
        //     }
    }
    FileValidatorDirective.prototype.validate = function (c) {
        // self value
        var files = c.value;
        return new validator_file_1.FileValidator(files, this.attrGetter, 0).validate();
        // // control vlaue
        // let e = c.root.get(this.validateEqual);
        //
        // // value not equal
        // if (e && v !== e.value && !this.isReverse) {
        //     return {
        //         validateEqual: false
        //     }
        // }
        // // value equal and reverse
        // if (e && v === e.value && this.isReverse) {
        //     delete e.errors['validateEqual'];
        //     if (!Object.keys(e.errors).length) e.setErrors(null);
        // }
        // value not equal and reverse
        // if (e && v !== e.value && this.isReverse) {
        //     e.setErrors({ validateEqual: false });
        // }
        // return null;
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], FileValidatorDirective.prototype, "ngfMaxSize", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], FileValidatorDirective.prototype, "ngfMinSize", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], FileValidatorDirective.prototype, "ngfMaxFiles", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], FileValidatorDirective.prototype, "ngfMaxTotalSize", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], FileValidatorDirective.prototype, "ngfValidateFn", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], FileValidatorDirective.prototype, "ngfPattern", void 0);
    FileValidatorDirective = __decorate([
        core_1.Directive({
            selector: '[ngfDrop],[ngfSelect]',
            providers: [{ provide: forms_1.NG_VALIDATORS, useExisting: FileValidatorDirective, multi: true }]
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], FileValidatorDirective);
    return FileValidatorDirective;
}(attr_directive_1.AttrDirective));
exports.FileValidatorDirective = FileValidatorDirective;
//# sourceMappingURL=validator.file.directive.js.map