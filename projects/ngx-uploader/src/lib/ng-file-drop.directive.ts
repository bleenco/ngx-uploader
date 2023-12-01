import { Directive, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { UploadInput, UploadOutput, UploaderOptions } from './interfaces';
import { NgUploaderService } from './ngx-uploader.class';

@Directive({
  selector: '[ngFileDrop]'
})
export class NgFileDropDirective implements OnInit, OnDestroy {
  @Input() options!: UploaderOptions;
  @Input() uploadInput!: EventEmitter<UploadInput>;
  @Output() uploadOutput: EventEmitter<UploadOutput>;

  upload!: NgUploaderService;
  el!: HTMLInputElement;

  _sub!: Subscription[];

  constructor(public elementRef: ElementRef) {
    this.uploadOutput = new EventEmitter<UploadOutput>();
  }

  ngOnInit() {
    this._sub = [];
    const concurrency = (this.options && this.options.concurrency) || Number.POSITIVE_INFINITY;
    const allowedContentTypes = (this.options && this.options.allowedContentTypes) || ['*'];
    const maxUploads = (this.options && this.options.maxUploads) || Number.POSITIVE_INFINITY;
    const maxFileSize = (this.options && this.options.maxFileSize) || Number.POSITIVE_INFINITY;
    this.upload = new NgUploaderService(concurrency, allowedContentTypes, maxUploads, maxFileSize);

    this.el = this.elementRef.nativeElement;

    this._sub.push(
      this.upload.serviceEvents.subscribe((event: UploadOutput) => {
        this.uploadOutput.emit(event);
      })
    );

    if (this.uploadInput instanceof EventEmitter) {
      this._sub.push(this.upload.initInputEvents(this.uploadInput));
    }

    this.el.addEventListener('drop', this.stopEvent, false);
    this.el.addEventListener('dragenter', this.stopEvent, false);
    this.el.addEventListener('dragover', this.stopEvent, false);
  }

  ngOnDestroy() {
    if (this._sub) {
      this._sub.forEach(sub => sub.unsubscribe());
    }
  }

  stopEvent = (e: Event) => {
    e.stopPropagation();
    e.preventDefault();
  };

  @HostListener('drop', ['$event'])
  public onDrop(e: any) {
    e.stopPropagation();
    e.preventDefault();

    const event: UploadOutput = { type: 'drop' };
    this.uploadOutput.emit(event);
    this.upload.handleFiles(e.dataTransfer.files);
  }

  @HostListener('dragover', ['$event'])
  public onDragOver(e: DragEvent) {
    if (!e) {
      return;
    }
    if (e && e.dataTransfer && e.dataTransfer.dropEffect != "copy") {

      e.dataTransfer.dropEffect  = "copy";
  }
    const event: UploadOutput = { type: 'dragOver' };
    this.uploadOutput.emit(event);
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(e: Event) {
    if (!e) {
      return;
    }

    const event: UploadOutput = { type: 'dragOut' };
    this.uploadOutput.emit(event);
  }
}
