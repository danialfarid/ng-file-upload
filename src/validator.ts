import {Util} from "./util";
export class Validator {
    protected files;
    protected attrGetter;
    protected result = {};

    constructor(files, attrGetter) {
        this.files = files == null ? [] : (files.length === undefined ? [files] : files.slice(0));
        this.attrGetter = attrGetter;
    }

    public validateMinMax(i, name, val, delta) {
        if (val - delta > Util.translateScalars(this.attrGetter('max' + name))) {
            this.markFileError(i, 'max' + name, val);
        }
        if (val + delta < Util.translateScalars(this.attrGetter('min' + name))) {
            this.markFileError(i, 'min' + name, val);
        }
    }

    protected markFileError(i: any, name: any, actual: any) {
        var file = this.files[i];
        (file.errors = (file.errors || {}))[name] = {expected: this.attrGetter(name), actual: actual};
        this.result[name] =  true;
    }


    protected hasAny(names) {
        for (var i = 0; i < names.length; i++) {
            var name = names[i];
            if (this.attrGetter(name)) {
                return true;
            }
        }
        return false;
    }
}