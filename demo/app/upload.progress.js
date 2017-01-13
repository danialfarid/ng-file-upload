"use strict";
var index_1 = require("../../src/index");
var server_1 = require("./server");
var UploadWithProgress = (function () {
    function UploadWithProgress(http) {
        this.http = http;
    }
    UploadWithProgress.prototype.upload = function (formData) {
        var _this = this;
        this.progress = 0;
        this.result = '';
        var http = index_1.ProgressHelper.progressEnabled(this.http);
        http.post(server_1.DemoServer.url, formData)
            .progress(function (e) { return _this.progress = e.percent; })
            .subscribe(function (res) { return _this.result = res.json(); }, function (err) { return _this.err = err.name; });
    };
    return UploadWithProgress;
}());
exports.UploadWithProgress = UploadWithProgress;
//# sourceMappingURL=upload.progress.js.map