export class FileQueue {
    private files: Array<any> = [];
    private isPaused = true;
    private currIndex = 0;

    constructor(private attrGetter, private uploadFn) {
    }

    add(files) {
        files = files instanceof Array ? files : (files ? [files] : []);
        if (!this.attrGetter('allowDuplicates')) {
            files = (files || []).filter(f => !this.isInPrevFiles(f))
        }
        this.files = this.files.concat(files);
        this.upload();
    }

    private isInPrevFiles(f) {
        return this.files.find(pf => FileQueue.areFilesEqual(pf, f) || undefined);
    }

    private static areFilesEqual(f1, f2) {
        return f1.name === f2.name && (f1.$ngfOrigSize || f1.size) === (f2.$ngfOrigSize || f2.size) &&
            f1.type === f2.type;
    }

    remove(index) {
        this.files = this.files.slice(0, index).concat(this.files.slice(index + 1, this.files.length))
    }

    clear() {
        this.files = [];
    }

    start() {
        // var upFiles = this.files.slice(this.currIndex, this.currIndex += this.attrGetter('chunkSize'));
        // upFiles.forEach((f, i) => {
        //     this.uploadFn(f).then(() => {
        //         this.stats[i] = 'success';
        //     }).catch(() => {
        //         this.stats[i] =
        //     });
        // });
    }

    resume() {
        this.start();
    }

    pause() {

    }

    private upload() {
        if (this.isPaused) return;
    }
}

export interface FileUploader {
    upload(file: Blob);
}