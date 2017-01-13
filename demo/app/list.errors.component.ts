import {Component, Input} from "@angular/core";

@Component({
    moduleId: module.id,
    selector: 'demo-list-errors',
    templateUrl: 'list.errors.component.html'
})
export class ListErrorsComponent {
    @Input() errors;
}