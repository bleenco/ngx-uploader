import { ElementRef, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { UploadOutput, UploadInput, UploaderOptions } from './interfaces';
import { NgUploaderService } from './ngx-uploader.class';
import { Subscription } from 'rxjs';
export declare class NgFileDropDirective implements OnInit, OnDestroy {
    elementRef: ElementRef;
    options: UploaderOptions;
    uploadInput: EventEmitter<UploadInput>;
    uploadOutput: EventEmitter<UploadOutput>;
    upload: NgUploaderService;
    el: HTMLInputElement;
    _sub: Subscription[];
    constructor(elementRef: ElementRef);
    ngOnInit(): void;
    ngOnDestroy(): void;
    stopEvent: (e: Event) => void;
    onDrop(e: any): void;
    onDragOver(e: Event): void;
    onDragLeave(e: Event): void;
}
