import {Directive, ElementRef, EventEmitter} from '@angular/core';
import {Ng2Uploader} from '../services/ng2-uploader';

@Directive({
  selector: '[ng-file-select]',
  inputs: ['options: ng-file-select'],
  outputs: ['onUpload', 'onPreviewData'],
  host: { '(change)': 'onFiles()' }
})
export class NgFileSelect {
  uploader: Ng2Uploader;
  options: any;
  onUpload: EventEmitter<any> = new EventEmitter();
  onPreviewData: EventEmitter<any> = new EventEmitter();
  constructor(public el: ElementRef) {
    this.uploader = new Ng2Uploader();
    setTimeout(() => {
      this.uploader.setOptions(this.options);
    });

    this.uploader._emitter.subscribe((data: any) => {
      this.onUpload.emit(data);
    });
    this.uploader._previewEmitter.subscribe((data: any) => {
      this.onPreviewData.emit(data);
    })
  }

  onFiles(): void {
    let files = this.el.nativeElement.files;
    let invalidExtensionFiles: Array<string> = [];

    if (files.length && this.uploader.allowedExtensions.length) {
      for (var i = 0; i < files.length; i++) {
        if (this.uploader.allowedExtensions.indexOf(files[i].type) === -1){
          invalidExtensionFiles.push(files[i].name);
        }  
      }
      if (!invalidExtentionFiles.length) {
        this.uploader.addFilesToQueue(files);
      } else {
        let data = {
          status: 'INVALID_FILE_EXTENSION',
          files: invalidExtensionFiles
        };
        this.uploader._emitter.emit(data);
      }
    } else if (files.length) {
      this.uploader.addFilesToQueue(files);
    }
  }
}
