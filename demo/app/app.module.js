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
var platform_browser_1 = require("@angular/platform-browser");
var forms_1 = require("@angular/forms");
var http_1 = require("@angular/http");
var index_1 = require("../../src/index");
var app_component_1 = require("./app.component");
var form_component_1 = require("./form.component");
var image_component_1 = require("./image.component");
var multiple_component_1 = require("./multiple.component");
var response_component_1 = require("./response.component");
var mapToIterable_pipe_1 = require("./mapToIterable.pipe");
var list_errors_component_1 = require("./list.errors.component");
var progress_component_1 = require("./progress.component");
var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            imports: [platform_browser_1.BrowserModule, forms_1.FormsModule, forms_1.ReactiveFormsModule, http_1.HttpModule],
            declarations: [
                app_component_1.AppComponent, form_component_1.FormDemoComponent, image_component_1.ImageDemoComponent, multiple_component_1.MultipleDemoComponent,
                response_component_1.ResponseComponent, mapToIterable_pipe_1.MapToIterable, list_errors_component_1.ListErrorsComponent, progress_component_1.ProgressComponent,
                index_1.SelectComponent, index_1.ClickForwardDirective, index_1.DropDirective, index_1.FileModelDirective, index_1.FileValidatorDirective,
                index_1.ImageValidatorDirective, index_1.MediaValidatorDirective, index_1.ThumbDirective,
                index_1.ImageResizeDirective,
                index_1.ImageOrientationDirective
            ],
            bootstrap: [app_component_1.AppComponent]
        }), 
        __metadata('design:paramtypes', [])
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map