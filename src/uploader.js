"use strict";
var Uploader = (function () {
    function Uploader() {
    }
    Uploader.rename = function (file, name) {
        file.ngfName = name;
        return file;
    };
    Uploader.prototype.toFormData = function (data) {
        var formData = new FormData();
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                var val = data[key];
                this.addFieldToFormData(formData, val, key);
            }
        }
    };
    Uploader.prototype.addFieldToFormData = function (formData, val, key) {
        if (val !== undefined) {
            if (val instanceof Date) {
                val = val.toISOString();
            }
            if (typeof val === 'string') {
                formData.append(key, val);
            }
            else if (val instanceof Blob) {
                formData.append(key, val, val.ngfName || val.name);
            }
            else {
                if (val instanceof Object) {
                    if (val.__ngfCircularDetection__)
                        throw 'ngFileUpload: Circular reference in config.data. Make sure specified data for Upload.upload() has no circular reference: ' + key;
                    val.__ngfCircularDetection__ = true;
                    try {
                        for (var k in val) {
                            if (val.hasOwnProperty(k) && k !== '__ngfCircularDetection__') {
                                var objectKey = objectKey == null ? '[i]' : objectKey;
                                if (val.length && parseInt(k) > -1) {
                                    objectKey = arrayKey == null ? objectKey : arrayKey;
                                }
                                this.addFieldToFormData(formData, val[k], key + objectKey.replace(/[ik]/g, k));
                            }
                        }
                    }
                    finally {
                        delete val.__ngfCircularDetection__;
                    }
                }
                else {
                    formData.append(key, val);
                }
            }
        }
    };
    return Uploader;
}());
exports.Uploader = Uploader;
//# sourceMappingURL=uploader.js.map