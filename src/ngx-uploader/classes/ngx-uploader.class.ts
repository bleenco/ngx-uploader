import { EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subscriber } from 'rxjs/Subscriber';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/mergeAll';
import 'rxjs/add/operator/combineLatest';

export enum UploadStatus {
  Queue,
  Uploading,
  Done,
  Canceled
}

export interface UploadProgress {
  status: UploadStatus;
  data?: {
    percentage: number;
    speed: number;
    speedHuman: string;
  };
}

export interface UploadFile {
  id: string;
  fileIndex: number;
  lastModifiedDate: Date;
  name: string;
  size: number;
  type: string;
  progress: UploadProgress;
  response?: any;
}

export interface UploadOutput {
  type: 'addedToQueue' | 'allAddedToQueue' | 'uploading' | 'done' | 'removed' | 'start' | 'cancelled' | 'dragOver' | 'dragOut' | 'drop';
  file?: UploadFile;
}

export interface UploadInput {
  type: 'uploadAll' | 'uploadFile' | 'cancel' | 'cancelAll';
  url?: string;
  method?: string;
  id?: string;
  fieldName?: string;
  fileIndex?: number;
  file?: UploadFile;
  data?: { [key: string]: string | Blob };
  headers?: { [key: string]: string };
  concurrency?: number;
}

export function humanizeBytes(bytes: number): string {
  if (bytes === 0) {
    return '0 Byte';
  }

  const k = 1024;
  const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i: number = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export class NgUploaderService {
  fileList: FileList;
  files: UploadFile[];
  uploads: { file?: UploadFile, files?: UploadFile[], sub: Subscription }[];
  serviceEvents: EventEmitter<UploadOutput>;

  constructor() {
    this.files = [];
    this.serviceEvents = new EventEmitter<any>();
    this.uploads = [];
  }

  handleFiles(files: FileList): void {
    this.fileList = files;

    this.files = [].map.call(files, (file: File, i: number) => {
      const uploadFile: UploadFile = {
        fileIndex: i,
        id: this.generateId(),
        name: file.name,
        size: file.size,
        type: file.type,
        progress: {
          status: UploadStatus.Queue,
          data: {
            percentage: 0,
            speed: null,
            speedHuman: null
          }
        },
        lastModifiedDate: file.lastModifiedDate
      };

      this.serviceEvents.emit({ type: 'addedToQueue', file: uploadFile });
      return uploadFile;
    });

    this.serviceEvents.emit({ type: 'allAddedToQueue' });
  }

  initInputEvents(input: EventEmitter<UploadInput>): void {
    input.subscribe((event: UploadInput) => {
      switch (event.type) {
        case 'uploadFile':
          this.serviceEvents.emit({ type: 'start', file: event.file });
          const sub = this.uploadFile(event.file, event).subscribe(data => {
            this.serviceEvents.emit(data);
          });

          this.uploads.push({ file: event.file, sub: sub });
        break;
        case 'uploadAll':
          let concurrency = event.concurrency > 0 ? event.concurrency : Number.POSITIVE_INFINITY;

          const subscriber = Subscriber.create((data: UploadOutput) => {
            this.serviceEvents.emit(data);
          });

          this.uploads = this.uploads.concat(this.files.map(file => {
            return { file: file, sub: null };
          }));

          const subscription = Observable.from(this.files.map(file => this.uploadFile(file, event)))
            .mergeAll(concurrency)
            .combineLatest(data => data)
            .subscribe(subscriber);
        break;
        case 'cancel':
          const id = event.id || null;
          if (!id) {
            return;
          }

          const index = this.uploads.findIndex(upload => upload.file.id === id);
          if (index !== -1) {
            if (this.uploads[index].sub) {
              this.uploads[index].sub.unsubscribe();
            }

            this.serviceEvents.emit({ type: 'cancelled', file: this.uploads[index].file });
            this.uploads[index].file.progress.status = UploadStatus.Canceled;
          }
        break;
        case 'cancelAll':
          this.uploads.forEach(upload => {
            upload.file.progress.status = UploadStatus.Canceled;
            this.serviceEvents.emit({ type: 'cancelled', file: upload.file });
          });
        break;
      }
    });
  }

  uploadFile(file: UploadFile, event: UploadInput): Observable<UploadOutput> {
    return new Observable(observer => {
      const url = event.url;
      const method = event.method || 'POST';
      const data = event.data || {};
      const headers = event.headers || {};

      const reader = new FileReader();
      const xhr = new XMLHttpRequest();
      let time: number = new Date().getTime();
      let load = 0;

      xhr.upload.addEventListener('progress', (e: ProgressEvent) => {
        if (e.lengthComputable) {
          const percentage = Math.round((e.loaded * 100) / e.total);
          const diff = new Date().getTime() - time;
          time += diff;
          load = e.loaded - load;
          const speed = parseInt((load / diff * 1000) as any, 10);

          file.progress = {
            status: UploadStatus.Uploading,
            data: {
              percentage: percentage,
              speed: speed,
              speedHuman: `${humanizeBytes(speed)}/s`
            }
          };

          observer.next({ type: 'uploading', file: file });
        }
      }, false);

      xhr.upload.addEventListener('error', (e: Event) => {
        observer.error(e);
        observer.complete();
      });

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          file.progress = {
            status: UploadStatus.Done,
            data: {
              percentage: 100,
              speed: null,
              speedHuman: null
            }
          };

          try {
            file.response = JSON.parse(xhr.response);
          } catch (e) {
            file.response = xhr.response;
          }

          observer.next({ type: 'done', file: file });
          observer.complete();
        }
      };

      xhr.open(method, url, true);

      const form = new FormData();
      try {
        const uploadFile = this.fileList.item(file.fileIndex);
        const uploadIndex = this.uploads.findIndex(upload => upload.file.size === uploadFile.size);
        if (this.uploads[uploadIndex].file.progress.status === UploadStatus.Canceled) {
          observer.complete();
        }

        form.append(event.fieldName || 'file', uploadFile, uploadFile.name);

        Object.keys(data).forEach(key => form.append(key, data[key]));
        Object.keys(headers).forEach(key => xhr.setRequestHeader(key, headers[key]));

        this.serviceEvents.emit({ type: 'start', file: file });
        xhr.send(form);
      } catch (e) {
        observer.complete();
      }

      return () => {
        xhr.abort();
        reader.abort();
      };
    });
  }

  generateId(): string {
    return Math.random().toString(36).substring(7);
  }
}
