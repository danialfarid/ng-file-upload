"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _this = this;
var resumable_1 = require("./resumable");
var progress_hack_1 = require("./progress.hack");
var server_1 = require("../demo/app/server");
var ProgressBrowserXhr = (function () {
    function ProgressBrowserXhr(origXhr, buildCallback) {
        this.origXhr = origXhr;
        this.buildCallback = buildCallback;
    }
    ProgressBrowserXhr.prototype.build = function () {
        var xhr = this.origXhr.build();
        this.buildCallback(xhr);
        return (xhr);
    };
    return ProgressBrowserXhr;
}());
exports.ProgressBrowserXhr = ProgressBrowserXhr;
var Uploader = (function (_super) {
    __extends(Uploader, _super);
    function Uploader(http) {
        this.http = http;
        if (http._backend && http._backend._browserXHR) {
            if (http._backend._browserXHR instanceof ProgressBrowserXhr)
                return http;
            http._backend._browserXHR = new ProgressBrowserXhr(http._backend._browserXHR, this.xhr);
        }
    }
    Uploader.prototype.xhr = function (xhr) {
        var _this = this;
        xhr.upload.addEventListener('progress', function (e) {
            if (_this.progressFn) {
                e.percent = Math.floor(100.0 * e.loaded / e.total);
                _this.progressFn(e);
            }
        }, false);
        this.xhrFn(xhr);
    };
    Uploader.prototype.upload = function (file, data, options) {
        this.http.post();
    };
    return Uploader;
}(resumable_1.CancellableUpload));
exports.Uploader = Uploader;
this.progress = 0;
this.result = '';
var http = progress_hack_1.ProgressHelper.progressEnabled(this.http);
http.post(server_1.DemoServer.url, formData)
    .progress(function (e) { return _this.progress = e.percent; })
    .subscribe(function (res) { return _this.result = res.json(); }, function (err) { return _this.err = err.name; });
//# sourceMappingURL=uploader.js.map