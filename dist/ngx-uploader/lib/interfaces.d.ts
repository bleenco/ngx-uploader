import { Subscription } from 'rxjs';
export interface UploaderOptions {
    concurrency: number;
    allowedContentTypes?: string[];
    maxUploads?: number;
}
export interface BlobFile extends Blob {
    name: string;
}
export declare enum UploadStatus {
    Queue = 0,
    Uploading = 1,
    Done = 2,
    Cancelled = 3
}
export interface UploadProgress {
    status: UploadStatus;
    data?: {
        percentage: number;
        speed: number;
        speedHuman: string;
        startTime: number | null;
        endTime: number | null;
        eta: number | null;
        etaHuman: string | null;
    };
}
export interface UploadFile {
    id: string;
    fileIndex: number;
    lastModifiedDate: Date;
    name: string;
    size: number;
    type: string;
    form: FormData;
    progress: UploadProgress;
    response?: any;
    responseStatus?: number;
    sub?: Subscription | any;
    nativeFile?: File;
    responseHeaders?: {
        [key: string]: string;
    };
}
export interface UploadOutput {
    type: 'addedToQueue' | 'allAddedToQueue' | 'uploading' | 'done' | 'start' | 'cancelled' | 'dragOver' | 'dragOut' | 'drop' | 'removed' | 'removedAll' | 'rejected';
    file?: UploadFile;
    nativeFile?: File;
}
export interface UploadInput {
    type: 'uploadAll' | 'uploadFile' | 'cancel' | 'cancelAll' | 'remove' | 'removeAll';
    url?: string;
    method?: string;
    id?: string;
    fieldName?: string;
    fileIndex?: number;
    file?: UploadFile;
    data?: {
        [key: string]: string | Blob;
    };
    headers?: {
        [key: string]: string;
    };
    includeWebKitFormBoundary?: boolean;
    withCredentials?: boolean;
}
