import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  HostListener,
  Inject,
  OnChanges,
  SimpleChange
} from '@angular/core';
import { NgUploaderService } from '../services/ngx-uploader';
import { NgUploaderOptions, UploadedFile, UploadRejected } from '../classes';

@Directive({
  selector: '[ngFileSelect]'
})
export class NgFileSelectDirective implements OnChanges {
  @Input() options: NgUploaderOptions;
  @Input() events: EventEmitter<any>;
  @Output() onUpload: EventEmitter<any> = new EventEmitter();
  @Output() onPreviewData: EventEmitter<any> = new EventEmitter();
  @Output() onUploadRejected: EventEmitter<UploadRejected> = new EventEmitter<UploadRejected>();
  @Output() beforeUpload: EventEmitter<UploadedFile> = new EventEmitter<UploadedFile>();

  files: any[] = [];

  constructor(
    @Inject(ElementRef) public el: ElementRef,
    @Inject(NgUploaderService) public uploader: NgUploaderService) { }

  ngOnChanges(changes: {[propName: string]: SimpleChange}) {
    if (!this.options) {
      return;
    }

    this.uploader.setOptions(new NgUploaderOptions(this.options));

    this.uploader._emitter.subscribe((data: any) => {
      this.onUpload.emit(data);
      if (data.done && this.files && this.files.length) {
        this.files = [].filter.call(this.files, (x: any) => x.name !== data.originalName)
      }
    });

    this.uploader._previewEmitter.subscribe((data: any) => {
      this.onPreviewData.emit(data);
    });

    this.uploader._beforeEmitter.subscribe((uploadingFile: UploadedFile) => {
      this.beforeUpload.emit(uploadingFile)
    });

    if (this.events instanceof EventEmitter) {
      this.events.subscribe((data: string) => {
        if (data === 'startUpload') {
          this.uploader.uploadFilesInQueue();
        }
      });
    }
  }

  @HostListener('change') onChange(): void {
    this.files = this.el.nativeElement.files;
    if (!this.files) {
      return;
    }

    if (this.options.filterExtensions && this.options.allowedExtensions && this.files && this.files.length) {
      this.files = [].filter.call(this.files, (f: any) => {
        if (this.options.allowedExtensions.indexOf(f.type) !== -1) {
          return true;
        }

        let ext: string = f.name.split('.').pop();
        if (this.options.allowedExtensions.indexOf(ext) !== -1 ) {
          return true;
        }

        this.onUploadRejected.emit({file: f, reason: UploadRejected.EXTENSION_NOT_ALLOWED});

        return false;
      });
    }

    if (this.files.length) {
      this.uploader.addFilesToQueue(this.files);
    }
  }
}
