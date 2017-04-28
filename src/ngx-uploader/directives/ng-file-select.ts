import { Directive, ElementRef, EventEmitter, Input, Output, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { NgUploaderService, UploadOutput, UploadInput, UploadFile } from '../services/ngx-uploader';

@Directive({
  selector: '[ngFileSelect]'
})
export class NgFileSelectDirective implements OnInit, OnDestroy {
  @Input() uploadInput: EventEmitter<any>;
  @Output() uploadOutput: EventEmitter<UploadOutput>;

  isServer: boolean = isPlatformServer(this.platform_id);
  el: HTMLInputElement;

  constructor(
    @Inject(PLATFORM_ID) private platform_id,
    private elementRef: ElementRef,
    private upload: NgUploaderService
  ) {
    this.uploadOutput = new EventEmitter<UploadOutput>();
  }

  ngOnInit() {
    if (this.isServer) {
      return;
    }

    this.el = this.elementRef.nativeElement;
    this.el.addEventListener('change', this.fileListener, false);

    this.upload.serviceEvents.subscribe((event: UploadOutput) => {
      this.uploadOutput.emit(event);
    });

    if (this.uploadInput instanceof EventEmitter) {
      this.upload.initInputEvents(this.uploadInput);
    }
  }

  ngOnDestroy() {
    if (this.isServer) {
      return;
    }

    this.el.removeEventListener('change', this.fileListener, false);
    this.uploadInput.unsubscribe();
  }

  fileListener = () => {
    this.upload.handleFiles(this.el.files);
  }
}
