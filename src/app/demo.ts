import {Component} from 'angular2/core';
import {NgFileSelect} from './directives/ng-file-select/ng-file-select';

@Component({
  selector: 'demo-app',
  providers: [],
  templateUrl: 'app/demo.html',
  directives: [NgFileSelect],
  pipes: []
})
export class DemoApp {
  uploads: any = {};

  options: Object = {
    url: 'http://localhost:13535/api/upload/image'
  };
  
  handleUploadData(uploadedFile): void {
    this.uploads[uploadedFile.id] = uploadedFile;
  }

}
