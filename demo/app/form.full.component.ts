import { Component } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'ngf-form-full',
    templateUrl: 'form.full.component.html'
})
export class FormFullDemoComponent {
    json(str) {
        return JSON.stringify(str);
    }
}