import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  HostListener
} from '@angular/core';
import { Ng2Uploader } from '../services/ng2-uploader';

@Directive({
  selector: '[ngFileSelect]'
})
export class NgFileSelectDirective {
  
  @Input() events: EventEmitter<any>;
  @Output() onUpload: EventEmitter<any> = new EventEmitter();
  @Output() onPreviewData: EventEmitter<any> = new EventEmitter();
  
  _options:any;

  get options(): any {
    return this._options;
  }

  @Input('options')
  set options(value: any) {
    this._options = value;
    this.uploader.setOptions(this.options);
  }

  files: any[] = [];
  uploader: Ng2Uploader;

  constructor(public el: ElementRef) {
    this.uploader = new Ng2Uploader();
    setTimeout(() => {
      this.uploader.setOptions(this.options);
    });

    this.uploader._emitter.subscribe((data: any) => {
      this.onUpload.emit(data);
      if (data.done) {
        this.files = this.files.filter(f => f.name !== data.originalName);
      }
    });

    this.uploader._previewEmitter.subscribe((data: any) => {
      this.onPreviewData.emit(data);
    });

    setTimeout(() => {
      if (this.events instanceof EventEmitter) {
        this.events.subscribe((data: string) => {
          if (data === 'startUpload') {
            this.uploader.uploadFilesInQueue();
          }
        });
      }
    });
  }

  filterFilesByExtension(): void {
    this.files = this.files.filter(f => {
      if (this.options.allowedExtensions.indexOf(f.type) !== -1) {
        return true;
      }

      let ext: string = f.name.split('.').pop();
      if (this.options.allowedExtensions.indexOf(ext) !== -1 ) {
        return true;
      }

      return false;
    });
  }

  @HostListener('change') onChange(): void {
    this.files = Array.from(this.el.nativeElement.files);
    if (this.options.filterExtensions && this.options.allowedExtensions) {
      this.filterFilesByExtension();
    }

    if (this.files.length) {
      this.uploader.addFilesToQueue(this.files);
    }
  }
}
