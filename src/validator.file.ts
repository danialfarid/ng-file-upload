import {Util} from "./util";
import {Validator} from "./validator";
import {Pattern} from "./pattern";

export class FileValidator extends Validator {
    private prevLength;

    constructor(files, attrGetter, prevLength) {
        super(files, attrGetter);
        this.files = files == null ? [] : (files.length === undefined ? [files] : files.slice(0));
        this.attrGetter = attrGetter;
        this.prevLength = prevLength;
    }

    validate() {
        if (!this.files.length) {
            return Util.emptyPromise(this.result);
        }
        if (this.files.length + this.prevLength > this.attrGetter('maxFiles')) {
            var maxFiles = this.attrGetter('maxFiles');
            for (var j = maxFiles - 1; j < this.files.length; j++) {
                this.markFileError(j, 'maxFiles', this.files.length + this.prevLength);
            }
        }
        var totalSize = 0, maxTotalSize = Util.translateScalars(this.attrGetter('maxTotalSize'));
        for (var i = 0; i < this.files.length; i++) {
            this.validateFile(i);
            totalSize += this.files[i].size;
            if (totalSize > maxTotalSize) {
                this.markFileError(i, 'maxTotalSize', totalSize);
            }
        }

        return this.result;
    }

    private validateFile(i: number) {
        var file = this.files[i];

        if (!Pattern.validatePattern(file, this.attrGetter('pattern'))) {
            this.markFileError(i, 'pattern', file.type + '|' + file.name);
        }
        this.validateMinMax(i, 'Size', file.size, 0.1);

        var validateFnResult = this.attrGetter('validateFn', file);
        if (validateFnResult && (validateFnResult === false || validateFnResult.length > 0)) {
            this.markFileError(i, 'validateFn', validateFnResult);
        }
        //todo validateFn and validateFnAsync
    }
}