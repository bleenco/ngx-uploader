import { Component, EventEmitter } from '@angular/core';
import { UploadOutput, UploadInput, UploadFile, humanizeBytes } from '../../../ngx-uploader/services/ngx-uploader';

@Component({
  selector: 'app-home',
  templateUrl: 'app-home.component.html'
})
export class AppHomeComponent {
  files: UploadFile[];
  uploadInput: EventEmitter<any>;
  humanizeBytes: Function;

  constructor() {
    this.files = [];
    this.uploadInput = new EventEmitter<any>();
    this.humanizeBytes = humanizeBytes;
  }

  onUploadOutput(output: UploadOutput): void {
    if (output.type === 'allAddedToQueue') {
      // this.uploadInput.emit({ type: 'uploadAll', url: 'http://api.ngx-uploader.com', method: 'POST' });
    } else if (output.type === 'addedToQueue') {
      this.files.push(output.file);
    } else if (output.type === 'uploading') {
      const index = this.files.findIndex(file => file.id === output.file.id);
      this.files[index] = output.file;
    } else if (output.type === 'removed') {
      this.files = this.files.filter((file: UploadFile) => file !== output.file);
    }

    console.log(output);


    // if (output.type === 'files') {
    //   this.uploadInput.emit({ type: 'uploadAll' });
    // } else if (output.type === 'upload') {
    //   console.log(output);
    // }
  }

  startUpload(): void {
    const event: UploadInput = {
      type: 'uploadAll',
      url: 'http://api.ngx-uploader.com',
      method: 'POST',
      data: { foo: 'bla!' },
      concurrency: 1
    }

    this.uploadInput.emit(event);
  }

  cancelUpload(id: string): void {
    this.uploadInput.emit({ type: 'cancel', id: id });
  }
}
