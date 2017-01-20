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
var click_forward_1 = require("../click.forward");
var ClickForwardDirective = (function () {
    function ClickForwardDirective(el) {
        this.elem = el.nativeElement;
    }
    ClickForwardDirective.prototype.ngOnChanges = function () {
        if (this.clickForward)
            this.clickForward.destroy();
        this.targetEl = this.ngfClickForward ?
            document.getElementById(this.ngfClickForward).firstChild :
            (this.findNgfSelect(this.elem) || this.findNgfSelect(document));
        this.clickForward = new click_forward_1.ClickForward(this.elem, this.targetEl);
    };
    ClickForwardDirective.prototype.findNgfSelect = function (el) {
        return el.getElementsByTagName('ngf-select').length &&
            el.getElementsByTagName('ngf-select')[0].firstChild;
    };
    return ClickForwardDirective;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], ClickForwardDirective.prototype, "ngfClickForward", void 0);
ClickForwardDirective = __decorate([
    core_1.Directive({
        selector: '[ngfClickForward]',
    }),
    __metadata("design:paramtypes", [core_1.ElementRef])
], ClickForwardDirective);
exports.ClickForwardDirective = ClickForwardDirective;
//# sourceMappingURL=click.forward.directive.js.map