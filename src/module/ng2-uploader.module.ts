import { NgModule } from '@angular/core';
import { NgFileDropDirective } from './../directives/ng-file-drop';
import { NgFileSelectDirective } from './../directives/ng-file-select';
import { Ng2UploaderServiceProvider } from './../services/ng2-uploader';

@NgModule({
   declarations: [
     NgFileDropDirective,
     NgFileSelectDirective
   ],
   providers: [
     Ng2UploaderServiceProvider
   ],
   exports: [
     NgFileDropDirective,
     NgFileSelectDirective
   ]
})
export class Ng2UploaderModule{}

