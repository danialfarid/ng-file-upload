"use strict";
var FileQueue = (function () {
    function FileQueue(config) {
        this.files = [];
        this.isPaused = true;
        this.uploadConfig = {};
        this.uploadConfig = config;
    }
    FileQueue.prototype.add = function (files) {
        if (files instanceof Array) {
            this.files = this.files.concat(files);
        }
        else {
            if (files) {
                this.files.push(files);
            }
        }
        this.upload();
    };
    FileQueue.prototype.remove = function (index) {
        this.files.splice(index, 1);
    };
    FileQueue.prototype.clear = function () {
        this.files = [];
    };
    FileQueue.prototype.start = function () {
    };
    FileQueue.prototype.resume = function () {
        this.start();
    };
    FileQueue.prototype.pause = function () {
    };
    FileQueue.prototype.upload = function () {
        if (this.isPaused)
            return;
    };
    return FileQueue;
}());
exports.FileQueue = FileQueue;
//# sourceMappingURL=queue.js.map