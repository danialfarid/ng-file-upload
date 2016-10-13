import { Component } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'ngf-form',
    templateUrl: 'form.component.html'
})
export class FormDemoComponent {
    json(str) {
        return JSON.stringify(str);
    }
}