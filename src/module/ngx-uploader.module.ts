import { NgModule } from '@angular/core';
import { NgFileDropDirective } from './../directives/ng-file-drop';
import { NgFileSelectDirective } from './../directives/ng-file-select';

@NgModule({
   declarations: [
     NgFileDropDirective,
     NgFileSelectDirective
   ],
   exports: [
     NgFileDropDirective,
     NgFileSelectDirective
   ]
})
export class NgUploaderModule {}

