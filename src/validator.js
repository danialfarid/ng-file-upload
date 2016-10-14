"use strict";
var util_1 = require("./util");
var Validator = (function () {
    function Validator(files, attrGetter) {
        this.result = {};
        this.files = files ? (files instanceof Array ? Array.prototype.slice.call(files, 0) : [files]) : [];
        this.attrGetter = attrGetter;
    }
    Validator.prototype.validateMinMax = function (i, name, val, delta) {
        if (val - delta > util_1.Util.translateScalars(this.attrGetter('max' + name))) {
            this.markFileError(i, 'max' + name, val);
        }
        if (val + delta < util_1.Util.translateScalars(this.attrGetter('min' + name))) {
            this.markFileError(i, 'min' + name, val);
        }
    };
    Validator.prototype.markFileError = function (i, name, actual) {
        var file = this.files[i];
        (file.errors = (file.errors || {}))[name] = { expected: this.attrGetter(name), actual: actual };
        this.result[name] = true;
    };
    Validator.prototype.hasAny = function (names) {
        for (var i = 0; i < names.length; i++) {
            var name = names[i];
            if (this.attrGetter(name)) {
                return true;
            }
        }
        return false;
    };
    return Validator;
}());
exports.Validator = Validator;
//# sourceMappingURL=validator.js.map