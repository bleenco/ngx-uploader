import { Directive, ElementRef, EventEmitter, Input, Output, OnInit, OnDestroy, HostListener } from '@angular/core';
import { UploadOutput, UploadInput, UploaderOptions, NgUploaderService } from '../../../';
import { Subscription } from 'rxjs/Subscription';

@Directive({
  selector: '[ngFileDrop]'
})
export class NgFileDropDirective implements OnInit, OnDestroy {
  @Input() options: UploaderOptions;
  @Input() uploadInput: EventEmitter<UploadInput>;
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
    this._sub.forEach(sub => sub.unsubscribe());
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
