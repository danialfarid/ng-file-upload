import {Component, Input} from "@angular/core";

@Component({
    moduleId: module.id,
    selector: 'demo-response',
    templateUrl: 'response.component.html'
})
export class ResponseComponent {
    @Input() result;
    @Input() error;
    private showDetail = false;
}