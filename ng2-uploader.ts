import { NgModule } from '@angular/core';
import { NgFileDropDirective } from './src/directives/ng-file-drop';
import { NgFileSelectDirective } from './src/directives/ng-file-select';
import { Ng2Uploader } from './src/services/ng2-uploader';

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

