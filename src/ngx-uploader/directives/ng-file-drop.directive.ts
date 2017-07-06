import { Directive, ElementRef, EventEmitter, Input, Output, OnInit, OnDestroy, HostListener } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { NgUploaderService, UploadOutput, UploadInput, UploadFile } from '../classes/ngx-uploader.class';

@Directive({
  selector: '[ngFileDrop]'
})
export class NgFileDropDirective implements OnInit, OnDestroy {
  @Input() uploadInput: EventEmitter<UploadInput>;
  @Output() uploadOutput: EventEmitter<UploadOutput>;

  upload: NgUploaderService;
  el: HTMLInputElement;

  constructor( private elementRef: ElementRef) {
    this.upload = new NgUploaderService();
    this.uploadOutput = new EventEmitter<UploadOutput>();
  }

  ngOnInit() {
    this.el = this.elementRef.nativeElement;

    this.upload.serviceEvents.subscribe((event: UploadOutput) => {
      this.uploadOutput.emit(event);
    });

    if (this.uploadInput instanceof EventEmitter) {
      this.upload.initInputEvents(this.uploadInput);
    }

    this.el.addEventListener('drop', this.stopEvent, false);
    this.el.addEventListener('dragenter', this.stopEvent, false);
    this.el.addEventListener('dragover', this.stopEvent, false);
  }

  ngOnDestroy() {
    if (this.uploadInput) {
      this.uploadInput.unsubscribe();
    }
  }

  stopEvent = (e: Event) => {
    e.stopPropagation();
    e.preventDefault();
  }

  @HostListener('drop', ['$event'])
  public onDrop(e: any) {
    e.stopPropagation();
    e.preventDefault();

    const event: UploadOutput = { type: 'drop' };
    this.uploadOutput.emit(event);
    this.upload.handleFiles(e.dataTransfer.files);
  }

  @HostListener('dragover', ['$event'])
  public onDragOver(e: Event) {
    if (!e) {
      return;
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
