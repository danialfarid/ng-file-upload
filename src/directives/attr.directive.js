"use strict";
var defaults_1 = require("../defaults");
var AttrDirective = (function () {
    function AttrDirective() {
        var _this = this;
        this.attrGetter = function (name) {
            var n = 'ngf' + name.charAt(0).toUpperCase() + name.substring(1);
            return _this[n] || _this[name] || defaults_1.Defaults.defaults[n] || defaults_1.Defaults.defaults[name];
        };
    }
    return AttrDirective;
}());
exports.AttrDirective = AttrDirective;
//# sourceMappingURL=attr.directive.js.map