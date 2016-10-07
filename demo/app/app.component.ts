import { Component } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'ngf-demo',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    aa(a) {
        console.log(a);
    }
    json(val) {
        return JSON.stringify(val);
    }
}