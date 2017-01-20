"use strict";
var Defaults = (function () {
    function Defaults() {
    }
    Defaults.set = function (obj) {
        this.defaults = obj;
    };
    return Defaults;
}());
Defaults.defaults = {};
exports.Defaults = Defaults;
//# sourceMappingURL=defaults.js.map