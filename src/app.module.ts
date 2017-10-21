import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgUploaderModule } from './ngx-uploader/module/ngx-uploader.module';
import { AppComponent } from './app.component';
import { AppHomeComponent } from './components/app-home';

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    NgUploaderModule
  ],
  providers: [
    { provide: APP_BASE_HREF, useValue: '/' }
  ],
  declarations: [ AppComponent, AppHomeComponent ],
  bootstrap: [ AppComponent ]
})
export class AppModule {}
