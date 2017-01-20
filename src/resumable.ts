// export abstract class CancellableUpload<T> extends Promise<T> {
//     private progressListener;
//     protected abstract xhr(progressListener: Function);
//     abort() {
//         this.xhr(fn).abort();
//     }
//     progress(fn) {
//         this.progressListener = fn;
//     }
// }
//
// export abstract class FileUploader {
//     protected abstract xhrUpload(file: Blob): any;
//     upload(file: Blob) {
//         return this.xhrUpload(file);
//     }
// }
//
// export abstract class ResumableUploader implements FileUploader {
//     private resumeSizePromise;
//
//     private begin;
//     private isPaused = false;
//
//     constructor(private chunkSize, private chunkDelay) {
//         if (!ResumableUploader.isResumeSupported()) throw 'Resumable upload is not supported: File.slice()';
//     }
// }
//
//     abstract resumeSize();
//     abstract init(file);
//
//     uploadChunk() {
//         if (this.isPaused || this.begin >= this.file.size) return;
//         var end = Math.min(this.file.size, this.begin + this.chunkSize);
//         var slice: any = this.file.slice(this.begin, end);
//         slice.name = this.file.name;
//         slice.ngfName = this.file.ngfName;
//         var extraParams = {};
//         if (this.chunkSize) {
//             extraParams['_chunkSize'] = this.chunkSize;
//             extraParams['_currentChunkSize'] = end - this.begin;
//             extraParams['_chunkNumber'] = Math.floor(this.begin / this.chunkSize);
//             extraParams['_totalSize'] = this.file.size;
//         }
//         return this.uploadPromise(slice, extraParams).then(() => {
//             this.begin = end;
//             if (this.chunkDelay) {
//                 setTimeout(() => this.uploadChunk(), this.chunkDelay);
//             } else {
//                 this.uploadChunk();
//             }
//         });
//     }
//
//     start() {
//         this.isPaused = false;
//         if (!this.begin) {
//             this.resumeSizePromise().then(size => {
//                 this.begin = size;
//                 this.uploadChunk();
//             });
//         } else {
//             this.uploadChunk();
//         }
//     }
//
//     pause() {
//         this.isPaused = true;
//     }
//
//     totalProgress(progress) {
//         return {
//             loaded: ((progress && progress.loaded) || 0) + this.begin,
//             total: (this.file && this.file.size) || progress.total,
//             type: (progress && progress.type) || 'progress',
//             lengthComputable: true, target: (progress && progress.target)
//         };
//     }
//
//     static isResumeSupported() {
//         return typeof Blob !== undefined && Blob.prototype.slice;
//     }
//
// }