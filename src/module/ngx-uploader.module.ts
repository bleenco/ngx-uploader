import { NgModule } from '@angular/core';
import { NgFileDropDirective } from './../directives/ng-file-drop';
import { NgFileSelectDirective } from './../directives/ng-file-select';
import { NgUploaderServiceProvider } from './../services/ngx-uploader';

@NgModule({
   declarations: [
     NgFileDropDirective,
     NgFileSelectDirective
   ],
   providers: [
     NgUploaderServiceProvider
   ],
   exports: [
     NgFileDropDirective,
     NgFileSelectDirective
   ]
})
export class NgUploaderModule {}

