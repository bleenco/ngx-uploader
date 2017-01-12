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
import { NgUploaderOptions, UploadedFile, UploadRejected } from '../classes';

@Directive({
  selector: '[ngFileDrop]'
})
export class NgFileDropDirective implements OnChanges, OnInit {
  @Input() options: NgUploaderOptions;
  @Input() events: EventEmitter<any>;
  @Output() onUpload: EventEmitter<any> = new EventEmitter();
  @Output() onPreviewData: EventEmitter<any> = new EventEmitter();
  @Output() onFileOver:EventEmitter<any> = new EventEmitter();
  @Output() onUploadRejected: EventEmitter<UploadRejected> = new EventEmitter<UploadRejected>();
  @Output() beforeUpload: EventEmitter<UploadedFile> = new EventEmitter<UploadedFile>();

  files: any[] = [];

  constructor(
    @Inject(ElementRef) public el: ElementRef,
    @Inject(NgUploaderService) public uploader: NgUploaderService) { }

  ngOnInit() {
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
    if (!this.options) {
      return;
    }

    this.options = new NgUploaderOptions(this.options);
    this.uploader.setOptions(this.options);
  }

  initEvents(): void {
    if (typeof this.el.nativeElement.addEventListener === 'undefined') {
      return;
    }

    this.el.nativeElement.addEventListener('drop', (e: any) => {
      e.stopPropagation();
      e.preventDefault();
      this.onFileOver.emit(false);
      this.files = Array.from(e.dataTransfer.files);
      if (this.files.length) {
        this.uploader.addFilesToQueue(this.files);
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

  @HostListener('change') onChange(): void {
    this.files = this.el.nativeElement.files;
    if (!this.files) {
      return;
    }

    if (this.options.filterExtensions && this.options.allowedExtensions && this.files && this.files.length) {
      this.files = this.files.filter(f => {
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

  @HostListener('dragover', ['$event'])
  public onDragOver(event:any):void {
    this.onFileOver.emit(true);
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(event:any):any {
    this.onFileOver.emit(false);
  }

}
