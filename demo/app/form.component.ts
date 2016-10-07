import { Component } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'ngf-form',
    templateUrl: 'form.component.html'
})
export class FormDemoComponent {
    public picFile = null;
    public username = null;
}