import { NgModule } from '@angular/core';
import { NgFileDropDirective } from './ng-file-drop.directive';
import { NgFileSelectDirective } from './ng-file-select.directive';

@NgModule({
  declarations: [NgFileDropDirective, NgFileSelectDirective],
  exports: [NgFileDropDirective, NgFileSelectDirective]
})
export class NgxUploaderModule { }
