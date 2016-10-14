"use strict";
var Util = (function () {
    function Util() {
    }
    Util.translateScalars = function (str) {
        if (typeof str === 'string') {
            if (str.search(/kb/i) === str.length - 2) {
                return parseFloat(str.substring(0, str.length - 2)) * 1024;
            }
            else if (str.search(/mb/i) === str.length - 2) {
                return parseFloat(str.substring(0, str.length - 2)) * 1048576;
            }
            else if (str.search(/gb/i) === str.length - 2) {
                return parseFloat(str.substring(0, str.length - 2)) * 1073741824;
            }
            else if (str.search(/b/i) === str.length - 1) {
                return parseFloat(str.substring(0, str.length - 1));
            }
            else if (str.search(/s/i) === str.length - 1) {
                return parseFloat(str.substring(0, str.length - 1));
            }
            else if (str.search(/m/i) === str.length - 1) {
                return parseFloat(str.substring(0, str.length - 1)) * 60;
            }
            else if (str.search(/h/i) === str.length - 1) {
                return parseFloat(str.substring(0, str.length - 1)) * 3600;
            }
        }
        return str;
    };
    Util.emptyPromise = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve.apply(_this, args);
            }, 0);
        });
    };
    ;
    Util.rejectPromise = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                reject.apply(_this, args);
            }, 0);
        });
    };
    ;
    Util.happyPromise = function (promise, data) {
        return new Promise(function (resolve) {
            promise.then(function (res) {
                resolve(res);
            }).catch(function (e) {
                setTimeout(function () {
                    throw e;
                }, 0);
                resolve(data);
            });
        });
    };
    ;
    return Util;
}());
exports.Util = Util;
//# sourceMappingURL=util.js.map