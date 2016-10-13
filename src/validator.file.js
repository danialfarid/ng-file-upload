"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var util_1 = require("./util");
var validator_1 = require("./validator");
var pattern_1 = require("./pattern");
var FileValidator = (function (_super) {
    __extends(FileValidator, _super);
    function FileValidator(files, attrGetter, prevLength) {
        _super.call(this, files, attrGetter);
        this.attrGetter = attrGetter;
        this.prevLength = prevLength;
    }
    FileValidator.prototype.validate = function () {
        if (!this.files.length) {
            return util_1.Util.emptyPromise(this.result);
        }
        if (this.files.length + this.prevLength > this.attrGetter('maxFiles')) {
            var maxFiles = this.attrGetter('maxFiles');
            for (var j = maxFiles - 1; j < this.files.length; j++) {
                this.markFileError(j, 'maxFiles', this.files.length + this.prevLength);
            }
        }
        var totalSize = 0, maxTotalSize = util_1.Util.translateScalars(this.attrGetter('maxTotalSize'));
        for (var i = 0; i < this.files.length; i++) {
            this.validateFile(i);
            totalSize += this.files[i].size;
            if (totalSize > maxTotalSize) {
                this.markFileError(i, 'maxTotalSize', totalSize);
            }
        }
        return this.result;
    };
    FileValidator.prototype.validateFile = function (i) {
        var file = this.files[i];
        if (!pattern_1.Pattern.validatePattern(file, this.attrGetter('pattern'))) {
            this.markFileError(i, 'pattern', file.type + ' ' + file.name);
        }
        this.validateMinMax(i, 'Size', file.size, 0.1);
        var validateFnResult = this.attrGetter('validateFn', file);
        if (validateFnResult && (validateFnResult === false || validateFnResult.length > 0)) {
            this.markFileError(i, 'validateFn', validateFnResult);
        }
        //todo validateFn and validateFnAsync
    };
    return FileValidator;
}(validator_1.Validator));
exports.FileValidator = FileValidator;
//# sourceMappingURL=validator.file.js.map