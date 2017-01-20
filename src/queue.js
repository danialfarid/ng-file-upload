"use strict";
var FileQueue = (function () {
    function FileQueue(attrGetter, uploadFn) {
        this.attrGetter = attrGetter;
        this.uploadFn = uploadFn;
        this.files = [];
        this.isPaused = true;
        this.currIndex = 0;
    }
    FileQueue.prototype.add = function (files) {
        var _this = this;
        files = files instanceof Array ? files : (files ? [files] : []);
        if (!this.attrGetter('allowDuplicates')) {
            files = (files || []).filter(function (f) { return !_this.isInPrevFiles(f); });
        }
        this.files = this.files.concat(files);
        this.upload();
    };
    FileQueue.prototype.isInPrevFiles = function (f) {
        return this.files.find(function (pf) { return FileQueue.areFilesEqual(pf, f) || undefined; });
    };
    FileQueue.areFilesEqual = function (f1, f2) {
        return f1.name === f2.name && (f1.$ngfOrigSize || f1.size) === (f2.$ngfOrigSize || f2.size) &&
            f1.type === f2.type;
    };
    FileQueue.prototype.remove = function (index) {
        this.files = this.files.slice(0, index).concat(this.files.slice(index + 1, this.files.length));
    };
    FileQueue.prototype.clear = function () {
        this.files = [];
    };
    FileQueue.prototype.start = function () {
        // var upFiles = this.files.slice(this.currIndex, this.currIndex += this.attrGetter('chunkSize'));
        // upFiles.forEach((f, i) => {
        //     this.uploadFn(f).then(() => {
        //         this.stats[i] = 'success';
        //     }).catch(() => {
        //         this.stats[i] =
        //     });
        // });
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