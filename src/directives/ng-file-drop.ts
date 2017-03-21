import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  HostListener,
  Inject,
  OnChanges,
  OnInit,
  SimpleChange
} from '@angular/core';
import { NgUploaderService } from '../services/ngx-uploader';
import { NgUploaderOptions, UploadedFile, UploadRejected } from '../classes/index';

@Directive({
  selector: '[ngFileDrop]',
  providers: [
    NgUploaderService
  ]
})
export class NgFileDropDirective implements OnChanges, OnInit {
  @Input() options: NgUploaderOptions;
  @Input() events: EventEmitter<any>;
  @Output() onUpload: EventEmitter<any> = new EventEmitter();
  @Output() onPreviewData: EventEmitter<any> = new EventEmitter();
  @Output() onFileOver: EventEmitter<any> = new EventEmitter();
  @Output() onUploadRejected: EventEmitter<UploadRejected> = new EventEmitter<UploadRejected>();
  @Output() beforeUpload: EventEmitter<UploadedFile> = new EventEmitter<UploadedFile>();

  files: File[] = [];

  constructor(
    @Inject(ElementRef) public el: ElementRef,
    @Inject(NgUploaderService) public uploader: NgUploaderService) { }

  ngOnInit() {
    this.uploader._emitter.subscribe((data: any) => {
      this.onUpload.emit(data);
      if (data.done && this.files && this.files.length) {
        this.files = [].filter.call(this.files, (f: File) => f.name !== data.originalName);
      }
    });

    this.uploader._previewEmitter.subscribe((data: any) => {
      this.onPreviewData.emit(data);
    });

    this.uploader._beforeEmitter.subscribe((uploadingFile: UploadedFile) => {
      this.beforeUpload.emit(uploadingFile);
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

    this.initEvents();
  }

  ngOnChanges(changes: {[propName: string]: SimpleChange}) {
    if (!this.options || !changes) {
      return;
    }

    if(this.options.allowedExtensions) {
      this.options.allowedExtensions = this.options.allowedExtensions.map(ext => ext.toLowerCase());
    }
    this.options = new NgUploaderOptions(this.options);
    this.uploader.setOptions(this.options);
  }

  initEvents(): void {
    if (typeof this.el.nativeElement.addEventListener === 'undefined') {
      return;
    }

    this.el.nativeElement.addEventListener('drop', this.stopEvent, false);
    this.el.nativeElement.addEventListener('dragenter', this.stopEvent, false);
    this.el.nativeElement.addEventListener('dragover', this.stopEvent, false);
  }

  @HostListener('drop', ['$event']) onDrop(e: any): void {
    this.onFileOver.emit(false);
    this.files = Array.from<File>(e.dataTransfer.files);
    if (!this.files || !this.files.length) {
      return;
    }

    if (this.options.filterExtensions && this.options.allowedExtensions && this.files && this.files.length) {
      this.files = [].filter.call(this.files, (f: File) => {
        let allowedExtensions = this.options.allowedExtensions || [];
        if (allowedExtensions.indexOf(f.type.toLowerCase()) !== -1) {
          return true;
        }

        let ext = f.name.split('.').pop();
        if (ext && allowedExtensions.indexOf(ext.toLowerCase()) !== -1 ) {
          return true;
        }

        this.onUploadRejected.emit({file: f, reason: UploadRejected.EXTENSION_NOT_ALLOWED});

        return false;
      });
    }

    if (this.options.maxSize > 0) {
      this.files = [].filter.call(this.files, (f: File) => {
        if (f.size <= this.options.maxSize) {
          return true;
        }

        this.onUploadRejected.emit({file: f, reason: UploadRejected.MAX_SIZE_EXCEEDED});
        return false;
      });
    }

    if(this.options.maxUploads > 0 && this.files.length > this.options.maxUploads) {
      this.onUploadRejected.emit({file: this.files.pop(), reason: UploadRejected.MAX_UPLOADS_EXCEEDED});
      this.files = [];
    }

    if (this.files && this.files.length) {
      this.uploader.addFilesToQueue(this.files);
    }
  }

  @HostListener('dragover', ['$event'])
  public onDragOver(e: any) {
    if (!e) { return; }
    this.onFileOver.emit(true);
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(e: any) {
    if (!e) { return; }
    this.onFileOver.emit(false);
  }

  private stopEvent(e: any): void {
    e.stopPropagation();
    e.preventDefault();
  }

}
