"use strict";
var Defaults = (function () {
    function Defaults() {
    }
    Defaults.set = function (obj) {
        this.defaults = obj;
    };
    Defaults.defaults = {};
    return Defaults;
}());
exports.Defaults = Defaults;
//# sourceMappingURL=defaults.js.map