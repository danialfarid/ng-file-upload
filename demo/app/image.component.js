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
var http_1 = require("@angular/http");
var index_1 = require("../../src/index");
var upload_progress_1 = require("./upload.progress");
var ImageDemoComponent = (function (_super) {
    __extends(ImageDemoComponent, _super);
    function ImageDemoComponent(http) {
        return _super.call(this, http) || this;
    }
    ImageDemoComponent.prototype.upload = function (images) {
        _super.prototype.upload.call(this, index_1.FormDataHelper.toFormData({ images: images }));
    };
    return ImageDemoComponent;
}(upload_progress_1.UploadWithProgress));
ImageDemoComponent = __decorate([
    core_1.Component({
        moduleId: module.id,
        selector: 'ngf-image-sample',
        templateUrl: 'image.component.html',
    }),
    __metadata("design:paramtypes", [http_1.Http])
], ImageDemoComponent);
exports.ImageDemoComponent = ImageDemoComponent;
//# sourceMappingURL=image.component.js.map