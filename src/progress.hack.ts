import {Http, BrowserXhr} from "@angular/http";
export class ProgressHelper {
    static progressEnabled(http: any|Http) {
        if (http._backend && http._backend._browserXHR) {
            if (http._backend._browserXHR instanceof ProgressBrowserXhr) return http;
            http._backend._browserXHR = new ProgressBrowserXhr(http._backend._browserXHR);
            this.wrapHttpMethod(http, 'post');
            this.wrapHttpMethod(http, 'put');
        }
        return http;
    }

    private static wrapHttpMethod(http: any|Http, method:string) {
        var origMethod = http[method];
        http[method] = function () {
            var observable = origMethod.apply(http, arguments);
            observable.progress = function (fn) {
                http._backend._browserXHR.currentCallback = fn;
                return observable;
            };
            observable.abort = function() {
                http._backend._browserXHR.abort();
            };
            observable.xhr = function(fn) {
                fn(http._backend._browserXHR);
            };
            return observable;
        };
    }
}

export class ProgressBrowserXhr implements BrowserXhr {
    public currentCallback;

    constructor(private origXhr: BrowserXhr) {
    }

    build(): any {
        let xhr = this.origXhr.build();
        var callback = this.currentCallback;
        xhr.upload.addEventListener('progress', (e: any) => {
            e.percent = Math.floor(100.0 * e.loaded / e.total);
            callback(e);
        }, false);
        return <any>(xhr);
    }
}
