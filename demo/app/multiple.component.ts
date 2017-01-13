import {Component} from "@angular/core";
import {Http} from "@angular/http";
import {FormDataHelper} from "../../src/index";
import {UploadWithProgress} from "./upload.progress";

@Component({
    moduleId: module.id,
    selector: 'ngf-multiple',
    templateUrl: 'multiple.component.html'
})
export class MultipleDemoComponent extends UploadWithProgress {
    constructor(http: Http) {
        super(http);
    }

    upload(images) {
        super.upload(FormDataHelper.toFormData({images: images}))
    }
}