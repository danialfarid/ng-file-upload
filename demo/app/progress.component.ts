import {Component, Input} from "@angular/core";

@Component({
    moduleId: module.id,
    selector: 'demo-progress',
    templateUrl: 'progress.component.html'
})
export class ProgressComponent {
    @Input() progress;
}