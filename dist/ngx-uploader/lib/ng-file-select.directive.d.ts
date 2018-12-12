import { ElementRef, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { UploadOutput, UploaderOptions } from './interfaces';
import { NgUploaderService } from './ngx-uploader.class';
import { Subscription } from 'rxjs';
export declare class NgFileSelectDirective implements OnInit, OnDestroy {
    elementRef: ElementRef;
    options: UploaderOptions;
    uploadInput: EventEmitter<any>;
    uploadOutput: EventEmitter<UploadOutput>;
    upload: NgUploaderService;
    el: HTMLInputElement;
    _sub: Subscription[];
    constructor(elementRef: ElementRef);
    ngOnInit(): void;
    ngOnDestroy(): void;
    fileListener: () => void;
}
