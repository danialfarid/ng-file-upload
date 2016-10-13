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
var attr_directive_1 = require("./attr.directive");
var QueueDirective = (function (_super) {
    __extends(QueueDirective, _super);
    function QueueDirective(el) {
        _super.call(this);
        // el.nativeElement.dispatchEvent(new CustomEvent('fileQueue', {detail: e.detail}));
    }
    QueueDirective.prototype.ngOnChanges = function (changes) {
        console.log(changes['ngfQueue']);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], QueueDirective.prototype, "ngfQueue", void 0);
    QueueDirective = __decorate([
        core_1.Directive({
            selector: '[ngfQueue]',
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], QueueDirective);
    return QueueDirective;
}(attr_directive_1.AttrDirective));
exports.QueueDirective = QueueDirective;
//# sourceMappingURL=queue.directive.js.map