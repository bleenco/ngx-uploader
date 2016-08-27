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
    if (files.length) {
      this.uploader.addFilesToQueue(files);
    }
  }
}
