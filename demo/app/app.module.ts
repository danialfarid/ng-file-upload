import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { AppComponent }   from './app.component';
import {FormDemoComponent} from "./form.component";
import {MultipleDemoComponent} from "./multiple.component";
import {DropDirective, FileModelDirective, SelectDirective, FileValidatorDirective} from "../../src/index";


@NgModule({
    imports:      [ BrowserModule, FormsModule ] ,
    declarations: [
        AppComponent, FormDemoComponent, MultipleDemoComponent,
        SelectDirective,
        DropDirective,
        FileModelDirective, FileValidatorDirective
    ],
    bootstrap:    [ AppComponent ]
})
export class AppModule { }