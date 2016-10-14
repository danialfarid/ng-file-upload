"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var util_1 = require("./util");
var validator_1 = require("./validator");
var DimensionValidator = (function (_super) {
    __extends(DimensionValidator, _super);
    function DimensionValidator(files, attrGetter) {
        _super.call(this, files, attrGetter);
    }
    DimensionValidator.prototype.validate = function () {
        var _this = this;
        var promises = [util_1.Util.emptyPromise()];
        for (var i = 0; i < this.files.length; i++) {
            promises.push(this.validateFile(i));
        }
        return Promise.all(promises).then(function () {
            return _this.result;
        });
    };
    ;
    DimensionValidator.prototype.validateFile = function (index) {
        return null;
    };
    ;
    DimensionValidator.prototype.validateDimensions = function (dimensions, prefix) {
        prefix = prefix || '';
        var ratioName = this.addPrefix('ratio', prefix), expectedRatio = this.attrGetter(ratioName), actualRatio = dimensions.width / dimensions.height;
        this.validateMinMax(i, this.capitalize(prefix) + 'Ratio', actualRatio, 0.01);
        if (expectedRatio) {
            var split = expectedRatio.toString().split(','), ratioMatch;
            for (var i = 0; i < split.length; i++) {
                if (Math.abs(actualRatio - DimensionValidator.ratioToFloat(split[i])) < 0.01) {
                    ratioMatch = true;
                    break;
                }
            }
            if (!ratioMatch) {
                this.markFileError(i, ratioName, actualRatio);
            }
        }
        var dimName = this.addPrefix('dimensions', prefix), dimensionsExpr = this.attrGetter(dimName);
        if (dimensionsExpr) {
            var ngfDimFn = null;
            eval('var ngfDimFn = function(width, height){ return ' + dimensionsExpr + ';}');
            if (!ngfDimFn(dimensions.width, dimensions.height)) {
                this.markFileError(i, dimName, false);
            }
        }
    };
    DimensionValidator.prototype.addPrefix = function (str, prefix) {
        return prefix + this.capitalize(str);
    };
    DimensionValidator.prototype.capitalize = function (str) {
        return str ? str.charAt(0).toUpperCase() + str.substring(1) : str;
    };
    DimensionValidator.ratioToFloat = function (val) {
        var r = val.toString(), xIndex = r.search(/[x:]/i);
        if (xIndex > -1) {
            r = parseFloat(r.substring(0, xIndex)) / parseFloat(r.substring(xIndex + 1));
        }
        else {
            r = parseFloat(r);
        }
        return r;
    };
    ;
    return DimensionValidator;
}(validator_1.Validator));
exports.DimensionValidator = DimensionValidator;
//# sourceMappingURL=validator.dimension.js.map