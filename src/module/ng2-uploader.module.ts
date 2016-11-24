import { NgModule } from '@angular/core';
import { NgFileDropDirective } from './../directives/ng-file-drop';
import { NgFileSelectDirective } from './../directives/ng-file-select';
import { Ng2Uploader } from './../services/ng2-uploader';

@NgModule({
   declarations: [
     NgFileDropDirective,
     NgFileSelectDirective
   ],
   providers: [
     Ng2Uploader
   ],
   exports: [
     NgFileDropDirective,
     NgFileSelectDirective
   ]
})
export class Ng2UploaderModule{}

