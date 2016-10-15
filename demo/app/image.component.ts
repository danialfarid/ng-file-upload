import {Component} from "@angular/core";
import {FormDemoComponent} from "./form.component";
import {Http, Response} from "@angular/http";
import {FormDataHelper, ProgressHelper} from "../../src/index";

@Component({
    moduleId: module.id,
    selector: 'ngf-image-sample',
    templateUrl: 'image.component.html',
})
export class ImageDemoComponent extends FormDemoComponent {
    private uploadUrl = 'http://angular-file-upload.appspot.com/upload';
    private result;
    private progress;

    constructor(private http: Http) {
        super();
    }

    upload(images) {
        var http = ProgressHelper.progressEnabled(this.http);
        http.post(this.uploadUrl, FormDataHelper.toFormData({images: images})).subscribe(
            (res: Response) => this.result = res.text(),
            (err: Error) => this.result = err.name,
            ()=>{},
            (e) => this.progress = e.percent);
    }
}