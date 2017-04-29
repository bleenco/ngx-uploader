import { Component, EventEmitter } from '@angular/core';
import { UploadOutput, UploadInput, UploadFile, humanizeBytes } from '../../../ngx-uploader/services/ngx-uploader';

interface FormData {
  concurrency: number;
  autoUpload: boolean;
  verbose: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: 'app-home.component.html'
})
export class AppHomeComponent {
  formData: FormData;
  files: UploadFile[];
  uploadInput: EventEmitter<any>;
  humanizeBytes: Function;


  constructor() {
    this.formData = {
      concurrency: 0,
      autoUpload: false,
      verbose: false
    };

    this.files = [];
    this.uploadInput = new EventEmitter<any>();
    this.humanizeBytes = humanizeBytes;
  }

  onUploadOutput(output: UploadOutput): void {
    console.log(output);

    if (output.type === 'allAddedToQueue') {
      if (this.formData.autoUpload) {
        console.log('yes');
        const event: UploadInput = {
          type: 'uploadAll',
          url: '/upload',
          method: 'POST',
          data: { foo: 'bar' },
          concurrency: this.formData.concurrency
        };

        this.uploadInput.emit(event);
      }
    } else if (output.type === 'addedToQueue') {
      this.files.push(output.file);
    } else if (output.type === 'uploading') {
      const index = this.files.findIndex(file => file.id === output.file.id);
      this.files[index] = output.file;
    } else if (output.type === 'removed') {
      this.files = this.files.filter((file: UploadFile) => file !== output.file);
    }
  }

  startUpload(): void {
    const event: UploadInput = {
      type: 'uploadAll',
      url: '/upload',
      method: 'POST',
      data: { foo: 'bar' },
      concurrency: this.formData.concurrency
    }

    this.uploadInput.emit(event);
  }

  cancelUpload(id: string): void {
    this.uploadInput.emit({ type: 'cancel', id: id });
  }
}
