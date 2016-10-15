"use strict";
var Resumable = (function () {
    function Resumable(file) {
        this.file = file;
        this.isPaused = false;
        if (!Resumable.isResumeSupported())
            throw 'Resumable upload is not supported: File.slice()';
    }
    Resumable.prototype.withUploadPromise = function (fn) {
        this.uploadPromise = fn;
    };
    // '/uploaded/size/url?file=' + file.name // uploaded file size so far on the server.
    Resumable.prototype.withUploadedSizePromise = function (fn) {
        this.resumeSizePromise = fn;
    };
    Resumable.prototype.withChunkSize = function (chunkSize) {
        this.chunkSize = chunkSize;
    };
    Resumable.prototype.withDelayBetweenChunks = function (chunkDelay) {
        this.chunkDelay = chunkDelay;
    };
    Resumable.prototype.uploadChunk = function () {
        var _this = this;
        if (this.isPaused || this.begin >= this.file.size)
            return;
        var end = Math.min(this.file.size, this.begin + this.chunkSize);
        var slice = this.file.slice(this.begin, end);
        slice.name = this.file.name;
        slice.ngfName = this.file.ngfName;
        var extraParams = {};
        if (this.chunkSize) {
            extraParams['_chunkSize'] = this.chunkSize;
            extraParams['_currentChunkSize'] = end - this.begin;
            extraParams['_chunkNumber'] = Math.floor(this.begin / this.chunkSize);
            extraParams['_totalSize'] = this.file.size;
        }
        return this.uploadPromise(slice, extraParams).then(function () {
            _this.begin = end;
            if (_this.chunkDelay) {
                setTimeout(function () { return _this.uploadChunk(); }, _this.chunkDelay);
            }
            else {
                _this.uploadChunk();
            }
        });
    };
    Resumable.prototype.start = function () {
        var _this = this;
        this.isPaused = false;
        if (!this.begin) {
            this.resumeSizePromise().then(function (size) {
                _this.begin = size;
                _this.uploadChunk();
            });
        }
        else {
            this.uploadChunk();
        }
    };
    Resumable.prototype.pause = function () {
        this.isPaused = true;
    };
    Resumable.prototype.totalProgress = function (progress) {
        return {
            loaded: ((progress && progress.loaded) || 0) + this.begin,
            total: (this.file && this.file.size) || progress.total,
            type: (progress && progress.type) || 'progress',
            lengthComputable: true, target: (progress && progress.target)
        };
    };
    Resumable.isResumeSupported = function () {
        return typeof Blob !== undefined && Blob.prototype.slice;
    };
    return Resumable;
}());
exports.Resumable = Resumable;
//# sourceMappingURL=resumable.js.map