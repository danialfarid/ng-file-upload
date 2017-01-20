"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var MapToIterable = (function () {
    function MapToIterable() {
    }
    MapToIterable.prototype.transform = function (dict) {
        var a = [];
        for (var key in dict) {
            if (dict.hasOwnProperty(key) && key.indexOf("__zone_") == -1) {
                a.push({ key: key, value: dict[key] });
            }
        }
        return a;
    };
    return MapToIterable;
}());
MapToIterable = __decorate([
    core_1.Pipe({
        name: 'mapToIterable'
    })
], MapToIterable);
exports.MapToIterable = MapToIterable;
//# sourceMappingURL=mapToIterable.pipe.js.map