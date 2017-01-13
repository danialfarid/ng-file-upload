"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var CancellableUpload = (function (_super) {
    __extends(CancellableUpload, _super);
    function CancellableUpload() {
        _super.apply(this, arguments);
    }
    CancellableUpload.prototype.cancel = function () {
        this.xhr(fn).abort();
    };
    CancellableUpload.prototype.progress = function (fn) {
        this.progressListener = fn;
    };
    return CancellableUpload;
}(Promise));
exports.CancellableUpload = CancellableUpload;
var FileUploader = (function () {
    function FileUploader() {
    }
    FileUploader.prototype.upload = function (file) {
        return this.xhrUpload(file);
    };
    return FileUploader;
}());
exports.FileUploader = FileUploader;
var ResumableUploader = (function () {
    function ResumableUploader(chunkSize, chunkDelay) {
        this.chunkSize = chunkSize;
        this.chunkDelay = chunkDelay;
        this.isPaused = false;
        if (!ResumableUploader.isResumeSupported())
            throw 'Resumable upload is not supported: File.slice()';
    }
    ResumableUploader.prototype.uploadChunk = function () {
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
    ResumableUploader.prototype.start = function () {
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
    ResumableUploader.prototype.pause = function () {
        this.isPaused = true;
    };
    ResumableUploader.prototype.totalProgress = function (progress) {
        return {
            loaded: ((progress && progress.loaded) || 0) + this.begin,
            total: (this.file && this.file.size) || progress.total,
            type: (progress && progress.type) || 'progress',
            lengthComputable: true, target: (progress && progress.target)
        };
    };
    ResumableUploader.isResumeSupported = function () {
        return typeof Blob !== undefined && Blob.prototype.slice;
    };
    return ResumableUploader;
}());
exports.ResumableUploader = ResumableUploader;
//# sourceMappingURL=resumable.js.map