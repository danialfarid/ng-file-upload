"use strict";
var Uploader = (function () {
    function Uploader() {
    }
    Uploader.rename = function (file, name) {
        file.ngfName = name;
        return file;
    };
    return Uploader;
}());
exports.Uploader = Uploader;
//# sourceMappingURL=uploader.js.map