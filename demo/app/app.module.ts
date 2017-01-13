import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {
    DropDirective,
    FileModelDirective,
    SelectComponent,
    ClickForwardDirective,
    FileValidatorDirective,
    ImageValidatorDirective,
    MediaValidatorDirective,
    ThumbDirective,
    ImageResizeDirective,
    ImageOrientationDirective
} from "../../src/index";
import {AppComponent} from "./app.component";
import {FormDemoComponent} from "./form.component";
import {ImageDemoComponent} from "./image.component";
import {MultipleDemoComponent} from "./multiple.component";
import {ResponseComponent} from "./response.component";
import {MapToIterable} from "./mapToIterable.pipe";
import {ListErrorsComponent} from "./list.errors.component";
import {ProgressComponent} from "./progress.component";

@NgModule({
    imports: [BrowserModule, FormsModule, ReactiveFormsModule, HttpModule],
    declarations: [
        AppComponent, FormDemoComponent, ImageDemoComponent, MultipleDemoComponent,
        ResponseComponent, MapToIterable, ListErrorsComponent, ProgressComponent,
        SelectComponent, ClickForwardDirective, DropDirective, FileModelDirective, FileValidatorDirective,
        ImageValidatorDirective, MediaValidatorDirective, ThumbDirective,
        ImageResizeDirective,
        ImageOrientationDirective
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}