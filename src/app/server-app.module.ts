import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { UniversalOnInit } from '../universal';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    BrowserModule.withServerTransition({
      appId: 'ngx-uploader'
    }),
    ServerModule,
    AppModule
  ]
})
export class ServerAppModule implements UniversalOnInit {
  universalOnInit() { }
}
