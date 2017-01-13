import {Component} from "@angular/core";
import {Http} from "@angular/http";
import {FormDataHelper} from "../../src/index";
import {UploadWithProgress} from "./upload.progress";

@Component({
    moduleId: module.id,
    selector: 'ngf-image-sample',
    templateUrl: 'image.component.html',
})
export class ImageDemoComponent extends UploadWithProgress {
    constructor(http: Http) {
        super(http);
    }

    upload(images) {
        super.upload(FormDataHelper.toFormData({images: images}))
    }
}