import {Component} from "@angular/core";

@Component({
    moduleId: module.id,
    selector: 'ngf-form-sample',
    templateUrl: 'form.component.html'
})
export class FormDemoComponent {
    keys(obj) {
        if (!obj) return obj;
        return Object.keys(obj).filter((k) => !k.startsWith('_'));
    }
}