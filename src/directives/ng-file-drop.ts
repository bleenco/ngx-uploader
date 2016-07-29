import {Directive, ElementRef, EventEmitter} from '@angular/core';
import {Ng2Uploader} from '../services/ng2-uploader';

@Directive({
  selector: '[ng-file-drop]',
  inputs: ['options: ng-file-drop'],
  outputs: ['onUpload']
})
export class NgFileDrop {
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

    this.initEvents();
  }

  initEvents(): void {
    this.el.nativeElement.addEventListener('drop', (e: any) => {
      e.stopPropagation();
      e.preventDefault();

      let dt = e.dataTransfer;
      let files = dt.files;

      if (files.length) {
        this.uploader.addFilesToQueue(files);
      }
    }, false);
    
    this.el.nativeElement.addEventListener('dragenter', (e: DragEvent) => {
      e.stopPropagation();
      e.preventDefault();
    }, false);
    
    this.el.nativeElement.addEventListener('dragover', (e: DragEvent) => {
      e.stopPropagation();
      e.preventDefault();
    }, false);
  }
}
