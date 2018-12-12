import { EventEmitter } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { UploadFile, UploadOutput, UploadInput } from './interfaces';
export declare function humanizeBytes(bytes: number): string;
export declare class NgUploaderService {
    queue: UploadFile[];
    serviceEvents: EventEmitter<UploadOutput>;
    uploadScheduler: Subject<{
        file: UploadFile;
        event: UploadInput;
    }>;
    subs: {
        id: string;
        sub: Subscription;
    }[];
    contentTypes: string[];
    maxUploads: number;
    constructor(concurrency?: number, contentTypes?: string[], maxUploads?: number);
    handleFiles(incomingFiles: FileList): void;
    initInputEvents(input: EventEmitter<UploadInput>): Subscription;
    startUpload(upload: {
        file: UploadFile;
        event: UploadInput;
    }): Observable<UploadOutput>;
    uploadFile(file: UploadFile, event: UploadInput): Observable<UploadOutput>;
    secondsToHuman(sec: number): string;
    generateId(): string;
    setContentTypes(contentTypes: string[]): void;
    allContentTypesAllowed(): boolean;
    isContentTypeAllowed(mimetype: string): boolean;
    makeUploadFile(file: File, index: number): UploadFile;
    private parseResponseHeaders;
}
