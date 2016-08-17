import {Directive, ElementRef, EventEmitter} from '@angular/core';
import {Ng2Uploader} from '../services/ng2-uploader';

@Directive({
  selector: '[ng-file-select]',
  inputs: ['options: ng-file-select'],
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

    this.uploader._emitter.subscribe((data: any) => {
      this.onUpload.emit(data);
    });
  }

  /**
  * Modified:kharatps02
  * Date :17/08/2016
  * Description: It will check all files types with config param allowedExtensions
    If some of the files types doesn't match  then handleUpload will get following object otherwise it will work as it is .

   {
    status: 'INVALID_FILE_EXTENTION',
    files: invalidExtentionFiles // invalid files names
  }
  **/


  onFiles(): void {
    let files = this.el.nativeElement.files;
    let invalidExtentionFiles: Array<string> = [];

    if (files.length && this.uploader.allowedExtensions.length) {
      for (var i = 0; i < files.length; i++) {
        (this.uploader.allowedExtensions.indexOf(files[i].type) === -1) ? invalidExtentionFiles.push(files[i].name) : null;
      }
      if (!invalidExtentionFiles.length) {
        this.uploader.addFilesToQueue(files);
      } else {
        let data = {
          status: 'INVALID_FILE_EXTENTION',
          files: invalidExtentionFiles
        };
        this.uploader._emitter.emit(data);
      }
    } else if (files.length) {
      this.uploader.addFilesToQueue(files);
    }
  }
}
