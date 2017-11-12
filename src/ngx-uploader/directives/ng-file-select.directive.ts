import { Directive, ElementRef, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { UploadOutput, UploaderOptions, NgUploaderService } from '../../../';
import { Subscription } from 'rxjs/Subscription';

@Directive({
  selector: '[ngFileSelect]'
})
export class NgFileSelectDirective implements OnInit, OnDestroy {
  @Input() options: UploaderOptions;
  @Input() uploadInput: EventEmitter<any>;
  @Output() uploadOutput: EventEmitter<UploadOutput>;

  upload: NgUploaderService;
  el: HTMLInputElement;

  _sub: Subscription[];

  constructor(public elementRef: ElementRef) {
    this.uploadOutput = new EventEmitter<UploadOutput>();
  }

  ngOnInit() {
    this._sub = [];
    const concurrency = this.options && this.options.concurrency || Number.POSITIVE_INFINITY;
    const allowedContentTypes = this.options && this.options.allowedContentTypes || ['*'];
    this.upload = new NgUploaderService(concurrency, allowedContentTypes);

    this.el = this.elementRef.nativeElement;
    this.el.addEventListener('change', this.fileListener, false);

    this._sub.push(
      this.upload.serviceEvents.subscribe((event: UploadOutput) => {
        this.uploadOutput.emit(event);
      })
    );

    if (this.uploadInput instanceof EventEmitter) {
      this._sub.push(this.upload.initInputEvents(this.uploadInput));
    }
  }

  ngOnDestroy() {
    this.el.removeEventListener('change', this.fileListener, false);
    this._sub.forEach(sub => sub.unsubscribe());
  }

  fileListener = () => {
    if (this.el.files) {
      this.upload.handleFiles(this.el.files);
    }
  }
}
