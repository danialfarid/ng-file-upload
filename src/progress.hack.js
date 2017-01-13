"use strict";
var ProgressHelper = (function () {
    function ProgressHelper() {
    }
    ProgressHelper.progressEnabled = function (http) {
        if (http._backend && http._backend._browserXHR) {
            if (http._backend._browserXHR instanceof ProgressBrowserXhr)
                return http;
            http._backend._browserXHR = new ProgressBrowserXhr(http._backend._browserXHR);
            this.wrapHttpMethod(http, 'post');
            this.wrapHttpMethod(http, 'put');
        }
        return http;
    };
    ProgressHelper.wrapHttpMethod = function (http, method) {
        var origMethod = http[method];
        http[method] = function () {
            var observable = origMethod.apply(http, arguments);
            observable.progress = function (fn) {
                http._backend._browserXHR.currentCallback = fn;
                return observable;
            };
            return observable;
        };
    };
    return ProgressHelper;
}());
exports.ProgressHelper = ProgressHelper;
var ProgressBrowserXhr = (function () {
    function ProgressBrowserXhr(origXhr) {
        this.origXhr = origXhr;
    }
    ProgressBrowserXhr.prototype.build = function () {
        var xhr = this.origXhr.build();
        var callback = this.currentCallback;
        xhr.upload.addEventListener('progress', function (e) {
            e.percent = Math.floor(100.0 * e.loaded / e.total);
            callback(e);
        }, false);
        return (xhr);
    };
    return ProgressBrowserXhr;
}());
exports.ProgressBrowserXhr = ProgressBrowserXhr;
//# sourceMappingURL=progress.hack.js.map