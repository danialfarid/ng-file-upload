import {Http, Response} from "@angular/http";
import {ProgressHelper} from "../../src/index";
import {DemoServer} from "./server";

export class UploadWithProgress {
    private progress;
    private result;
    private err;

    constructor(private http: Http) {
    }

    upload(formData) {
        this.progress = 0;
        this.result = '';
        var http = ProgressHelper.progressEnabled(this.http);
        http.post(DemoServer.url, formData)
            .progress((e) => this.progress = e.percent)
            .subscribe(
                (res: Response) => this.result = res.json(),
                (err: Error) => this.err = err.name);
    }
}