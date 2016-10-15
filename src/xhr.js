"use strict";
var ProgressHelper = (function () {
    function ProgressHelper() {
    }
    ProgressHelper.progressEnabled = function (http) {
        if (http._backend && http._backend._browserXHR) {
            if (http._backend._browserXHR instanceof ProgressBrowserXhr)
                return http;
            http._backend._browserXHR = new ProgressBrowserXhr(http._backend._browserXHR);
            var origPost = http.post;
            http.post = function () {
                var observable = origPost.apply(http, arguments);
                var origSubs = observable.subscribe;
                observable.subscribe = function () {
                    http._backend._browserXHR.currentCallback = arguments[3];
                    var res = origSubs.apply(observable, arguments);
                    return res;
                };
                return observable;
            };
        }
        return http;
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
//# sourceMappingURL=xhr.js.map