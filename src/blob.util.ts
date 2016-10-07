import {Util} from "./util";
import {Defaults} from "./defaults";
export class BlobUtil {
    private static blobUrls = [];
    private static blobUrlsTotalSize = 0;

    static dataUrltoBlob(dataurl, name, origSize) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        var blob: any = new Blob([u8arr], {type: mime});
        blob.name = name;
        blob.$ngfOrigSize = origSize;
        return blob;
    }

    static urlToBlob(url) {
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open('get', url);
            xhr.responseType = 'arraybuffer';
            xhr.send();
            xhr.onload = () => {
                if (xhr.status == 200) {
                    var arrayBufferView = new Uint8Array(xhr.response);
                    var type = xhr.getResponseHeader('content-type') || 'image/WebP';
                    var blob = new Blob([arrayBufferView], {type: type});
                    resolve(blob);
                    //var split = type.split('[/;]');
                    //blob.name = url.substring(0, 150).replace(/\W+/g, '') + '.' + (split.length > 1 ? split[1] : 'jpg');
                } else {
                    reject(xhr.response);
                }
            }
        });
    };

    public static dataUrl(file:any, disallowObjectUrl?:boolean) {
        if (!file) return Util.emptyPromise(file);
        if ((disallowObjectUrl && file.$ngfDataUrl != null) || (!disallowObjectUrl && file.$ngfBlobUrl != null)) {
            return Util.emptyPromise(disallowObjectUrl ? file.$ngfDataUrl : file.$ngfBlobUrl, file);
        }
        if (file.$$ngfDataUrlPromise) return file.$$ngfDataUrlPromise;

        return file.$$ngfDataUrlPromise = new Promise((resolve, reject) => {
            if (!FileReader || !file) {
                setTimeout(() => {
                    file[disallowObjectUrl ? '$ngfDataUrl' : '$ngfBlobUrl'] = '';
                    reject(!file ? 'No file' : 'Not supported');
                });
            }
            //prefer URL.createObjectURL for handling refrences to files of all sizes
            //since it doesn´t build a large string in memory
            var w:any = window;
            var URL = w.URL || w.webkitURL;
            if (URL && URL.createObjectURL && !disallowObjectUrl) {
                var url;
                try {
                    url = URL.createObjectURL(file);
                } catch (e) {
                    return setTimeout(function () {
                        file.$ngfBlobUrl = '';
                        reject();
                    }, 0);
                }
                file.$ngfBlobUrl = url;
                BlobUtil.blobUrls.push({url: url, size: file.size});
                BlobUtil.blobUrlsTotalSize += file.size || 0;
                this.clearBlobUrlsCache();
                setTimeout(() => {
                    resolve(url);
                }, 0);
            } else {
                var fileReader = new FileReader();
                fileReader.onload = function (e:any) {
                    setTimeout(function () {
                        file.$ngfDataUrl = e.target.result;
                        resolve(e.target.result);
                        setTimeout(function () {
                            delete file.$ngfDataUrl;
                        }, 1000);
                    });
                };
                fileReader.onerror = function (e) {
                    setTimeout(function () {
                        file.$ngfDataUrl = '';
                        reject(e);
                    });
                };
                fileReader.readAsDataURL(file);
            }
        }).then(() => {
            delete file.$$ngfDataUrlPromise
        }).catch(() => {
            delete file.$$ngfDataUrlPromise
        });
    }

    private static clearBlobUrlsCache() {
        var maxMemory = Defaults.defaults.blobUrlsMaxMemory || 268435456;
        var maxLength = Defaults.defaults.blobUrlsMaxQueueSize || 200;
        while ((BlobUtil.blobUrlsTotalSize > maxMemory || BlobUtil.blobUrls.length > maxLength) &&
        BlobUtil.blobUrls.length > 1) {
            var obj = BlobUtil.blobUrls.splice(0, 1)[0];
            URL.revokeObjectURL(obj.url);
            BlobUtil.blobUrlsTotalSize -= obj.size;
        }

    }
}
