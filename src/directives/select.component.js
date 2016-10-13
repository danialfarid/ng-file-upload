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
var select_js_1 = require("../select.js");
var click_forward_1 = require("../click.forward");
var SelectComponent = (function () {
    function SelectComponent(el) {
        var _this = this;
        this.ngfSelect = new core_1.EventEmitter();
        this.ngfChange = new core_1.EventEmitter();
        this.elem = el.nativeElement;
        this.select = new select_js_1.Select(el.nativeElement, this.ngfResetOnClick);
        this.elem.addEventListener('chnge', function (e) {
            _this.ngfSelect.emit(e.target && e.target.files);
            _this.ngfChange.emit(e.target && e.target.files);
        });
        this.ngfHtml = this.elem.innerHTML;
    }
    SelectComponent.prototype.ngOnInit = function () {
        new click_forward_1.ClickForward(this.elem, this.elem.firstChild);
    };
    SelectComponent.prototype.ngOnDestroy = function () {
        this.select.destroy();
    };
    SelectComponent.prototype.ngOnChange = function (changes) {
        //had to manually set capture since angular doesn't know of capture on input
        if (changes['ngfCapture']) {
            this.elem.setAttribute('capture', changes['ngfCapture'].currentValue);
        }
    };
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], SelectComponent.prototype, "ngfSelect", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], SelectComponent.prototype, "ngfChange", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], SelectComponent.prototype, "ngfText", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], SelectComponent.prototype, "ngfHtml", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], SelectComponent.prototype, "ngfResetOnClick", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], SelectComponent.prototype, "ngfCapture", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], SelectComponent.prototype, "ngfMultiple", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], SelectComponent.prototype, "ngfAccept", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], SelectComponent.prototype, "disabled", void 0);
    SelectComponent = __decorate([
        core_1.Component({
            selector: 'ngf-select',
            template: '<label><input style="visibility:hidden;position:absolute;' +
                'overflow:hidden;width:0px;height:0px;border:none;margin:0px;padding:0px" tabindex="-1" ' +
                'type="file" [accept]="ngfAccept" ' +
                '[multiple]="ngfMultiple">{{ngfText}}<div *ngIf="ngfHtml" [innerHTML]="ngfHtml"></div></label>'
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], SelectComponent);
    return SelectComponent;
}());
exports.SelectComponent = SelectComponent;
//# sourceMappingURL=select.component.js.map