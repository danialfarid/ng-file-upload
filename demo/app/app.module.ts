import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {AppComponent} from "./app.component";
import {FormDemoComponent} from "./form.component";
import {ImageDemoComponent} from "./image.component";
import {MultipleDemoComponent} from "./multiple.component";
import {
    DropDirective,
    FileModelDirective,
    SelectComponent,
    ClickForwardDirective,
    FileValidatorDirective,
    ImageValidatorDirective,
    MediaValidatorDirective,
    ThumbnailDirective,
    ImageResizeDirective,
    ImageOrientationDirective
} from "../../src/index";


@NgModule({
    imports: [BrowserModule, FormsModule, ReactiveFormsModule, HttpModule],
    declarations: [
        AppComponent, FormDemoComponent, ImageDemoComponent, MultipleDemoComponent,
        SelectComponent, ClickForwardDirective,
        DropDirective,
        FileModelDirective, FileValidatorDirective,
        ImageValidatorDirective, MediaValidatorDirective, ThumbnailDirective,
        ImageResizeDirective,
        ImageOrientationDirective
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}