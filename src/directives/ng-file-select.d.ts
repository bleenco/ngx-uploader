import { ElementRef, EventEmitter } from "@angular/core";
import { Ng2Uploader } from "../services/ng2-uploader";
export declare class NgFileSelect {
    el: ElementRef;
    uploader: Ng2Uploader;
    options: any;
    onUpload: EventEmitter<any>;
    constructor(el: ElementRef);
    onFiles(): void;
}
