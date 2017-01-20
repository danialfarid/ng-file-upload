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
var QueueDirective = (function () {
    function QueueDirective() {
    }
    QueueDirective.prototype.ngOnChanges = function (changes) {
        if (changes['ngfSource'])
            this.mergeFiles(this.ngfQueue, this.ngfSource);
        if (changes['ngModel'])
            this.mergeFiles(this.ngfQueue, this.ngModel);
    };
    QueueDirective.prototype.mergeFiles = function (list, newFiles) {
        // if (this.ngfAllowDuplicates) {
        //     files = (files || []).filter(f => !this.isInPrevFiles(f))
        // }
        // Array.prototype.push.apply(list, newFiles);
    };
    QueueDirective.prototype.isInPrevFiles = function (f) {
        // return this.prevFiles.find(pf => FileModelDirective.areFilesEqual(pf, f) || undefined);
    };
    return QueueDirective;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], QueueDirective.prototype, "ngfQueue", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], QueueDirective.prototype, "ngfAllowDuplicates", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], QueueDirective.prototype, "ngModel", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], QueueDirective.prototype, "ngfSource", void 0);
QueueDirective = __decorate([
    core_1.Directive({
        selector: '[ngfQueue]',
    })
], QueueDirective);
exports.QueueDirective = QueueDirective;
//# sourceMappingURL=queue.directive.js.map