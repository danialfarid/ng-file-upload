export class FormDataHelper {
    static rename(file, name) {
        file.ngfName = name;
        return file;
    }

    static toFormData(data, objectKeyPattern?: string, arrayKeyPattern?: string) {
        var formData = new FormData();
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                var val = data[key];
                this.addFieldToFormData(formData, val, key, objectKeyPattern, arrayKeyPattern);
            }
        }
        return formData;
    }

    static addFieldToFormData(formData, val, key, objectKey, arrayKey) {
        if (val !== undefined) {
            if (val instanceof Date) {
                val = val.toISOString();
            }
            if (typeof val === 'string') {
                formData.append(key, val);
            } else if (val instanceof Blob) {
                var v:any = val;
                formData.append(key, val, v.ngfName || v.name);
            } else {
                if (val instanceof Object) {
                    if (val.__ngfCircularDetection__) throw 'ngFileUpload: Circular reference in config.data. Make sure specified data for Upload.upload() has no circular reference: ' + key;

                    val.__ngfCircularDetection__ = true;
                    try {
                        for (var k in val) {
                            if (val.hasOwnProperty(k) && k !== '__ngfCircularDetection__') {
                                var objectKey = objectKey == null ? '[i]' : objectKey;
                                if (val.length && parseInt(k) > -1) {
                                    objectKey = arrayKey == null ? objectKey : arrayKey;
                                }
                                this.addFieldToFormData(formData, val[k], key + objectKey.replace(/[ik]/g, k), objectKey, arrayKey);
                            }
                        }
                    } finally {
                        delete val.__ngfCircularDetection__;
                    }
                } else {
                    formData.append(key, val);
                }
            }
        }
    }
}