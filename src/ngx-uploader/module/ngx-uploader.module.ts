import { NgModule } from '@angular/core';
// import { NgFileDropDirective } from './../directives/ng-file-drop';
import { NgUploaderServiceProvider } from '../services/ngx-uploader';
import { NgFileSelectDirective } from './../directives/ng-file-select';

@NgModule({
   declarations: [
     NgFileSelectDirective
   ],
   exports: [
     NgFileSelectDirective
   ],
   providers: [
      NgUploaderServiceProvider
   ]
})
export class NgUploaderModule {}

