import {Component} from "@angular/core";
import {Http} from "@angular/http";
import {UploadWithProgress} from "./upload.progress";
import {FormDataHelper} from "../../src/form-data";

@Component({
    moduleId: module.id,
    selector: 'ngf-form-sample',
    templateUrl: 'form.component.html'
})
export class FormDemoComponent extends UploadWithProgress {
    constructor(http: Http) {
        super(http);
    }

    submit(form) {
        super.upload(FormDataHelper.toFormData(form.value));
    }
}