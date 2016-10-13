export class FileQueue {
    private files:Array<any> = [];
    private isPaused = true;
    private uploadConfig = {};

    constructor(config: {}) {
        this.uploadConfig = config;
    }

    add(files) {
        if (files instanceof Array) {
            this.files = this.files.concat(files);
        } else {
            if (files) {
                this.files.push(files);
            }
        }
        this.upload();
    }

    remove(index) {
        this.files.splice(index, 1);
    }

    clear() {
        this.files = [];
    }

    start() {

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