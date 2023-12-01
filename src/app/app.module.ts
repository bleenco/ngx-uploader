import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxUploaderModule } from 'ngx-uploader';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NgxUploaderModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
