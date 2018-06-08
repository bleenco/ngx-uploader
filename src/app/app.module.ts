import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxUploaderModule } from 'ngx-uploader';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxUploaderModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
