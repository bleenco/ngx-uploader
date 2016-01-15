import {Directive, ElementRef, EventEmitter} from 'angular2/core';
import {Ng2Uploader} from '../../services/ng2-uploader/ng2-uploader';

@Directive({
  selector: '[ng-file-select]',
  inputs: ['options'],
  outputs: ['onUpload'],
  host: { '(change)': 'onFiles()' }
})
export class NgFileSelect {
  uploader: Ng2Uploader;
  options: any;
  onUpload: EventEmitter<any> = new EventEmitter();

  constructor(public el: ElementRef) {
    this.uploader = new Ng2Uploader();
    setTimeout(() => {
      this.uploader.setOptions(this.options);
    });

    this.uploader._emitter.subscribe((data) => {
      this.onUpload.emit(data);
    });
  }

  onFiles(): void {
    let files = this.el.nativeElement.files;
    if (files.length) {
      this.uploader.addFilesToQueue(files);
    }
  }

}