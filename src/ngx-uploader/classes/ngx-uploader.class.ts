import { EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subscriber } from 'rxjs/Subscriber';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/mergeAll';

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
    startTime: number | null;
    endTime: number | null;
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
  type: 'addedToQueue' | 'allAddedToQueue' | 'uploading' | 'done' | 'start' | 'cancelled' | 'dragOver' | 'dragOut' | 'drop' | 'removed' | 'removedAll';
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
  data?: { [key: string]: string | Blob };
  headers?: { [key: string]: string };
  concurrency?: number;
  withCredentials?: boolean;
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
  uploads: { file?: UploadFile, files?: UploadFile[], sub: {instance: Subscription} }[];
  serviceEvents: EventEmitter<UploadOutput>;

  constructor() {
    this.files = [];
    this.serviceEvents = new EventEmitter<any>();
    this.uploads = [];
  }

  handleFiles(files: FileList): void {
    this.fileList = files;

    this.files.push(...[].map.call(files, (file: File, i: number) => {
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
            speedHuman: null,
            startTime: null,
            endTime: null
          }
        },
        lastModifiedDate: file.lastModifiedDate
      };

      this.serviceEvents.emit({ type: 'addedToQueue', file: uploadFile, nativeFile: file });
      this.uploads.push({ file: uploadFile, sub: { instance: null } });

      return uploadFile;
    }));

    this.serviceEvents.emit({ type: 'allAddedToQueue' });
  }

  initInputEvents(input: EventEmitter<UploadInput>): void {
    input.subscribe((event: UploadInput) => {
      switch (event.type) {
        case 'uploadFile':
          const uploadFileIndex = this.uploads.findIndex(upload => upload.file === event.file);
          if (uploadFileIndex !== -1) {
            this.uploads[uploadFileIndex].sub.instance = this.uploadFile(event.file, event).subscribe(data => {
              this.serviceEvents.emit(data);
            });
          }
        break;
        case 'uploadAll':
          const concurrency = event.concurrency > 0 ? event.concurrency : Number.POSITIVE_INFINITY;
          Observable.from(this.files.map(file => this.uploadFile(file, event)))
            .mergeAll(concurrency)
            .subscribe((data: UploadOutput) => this.serviceEvents.emit(data));
        break;
        case 'cancel':
          const id = event.id || null;
          if (!id) {
            return;
          }

          const index = this.uploads.findIndex(upload => upload.file.id === id);
          if (index !== -1) {
            if (this.uploads[index].sub && this.uploads[index].sub.instance) {
              this.uploads[index].sub.instance.unsubscribe();
            }

            this.serviceEvents.emit({ type: 'cancelled', file: this.uploads[index].file });
            this.uploads[index].file.progress.status = UploadStatus.Canceled;
          }
        break;
        case 'cancelAll':
          this.uploads.forEach(upload => {
            if (upload.sub && upload.sub.instance) {
              upload.sub.instance.unsubscribe();
            }
            upload.file.progress.status = UploadStatus.Canceled;
            this.serviceEvents.emit({ type: 'cancelled', file: upload.file });
          });
        break;
        case 'remove':
          if (!event.id) {
            return;
          }

          const i = this.files.findIndex(file => file.id === event.id);
          if (i !== -1) {
            const file = this.files[i];
            this.files.splice(i, 1);
            this.serviceEvents.emit({ type: 'removed', file: file });
          }
        break;
        case 'removeAll':
          if (this.files.length) {
            this.files = [];
            this.serviceEvents.emit({ type: 'removedAll' });
          }
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
      let speed = 0;

      xhr.upload.addEventListener('progress', (e: ProgressEvent) => {
        if (e.lengthComputable) {
          const percentage = Math.round((e.loaded * 100) / e.total);
          const diff = new Date().getTime() - time;
          speed = Math.round(e.loaded / diff * 1000);

          file.progress = {
            status: UploadStatus.Uploading,
            data: {
              percentage: percentage,
              speed: speed,
              speedHuman: `${humanizeBytes(speed)}/s`,
              startTime: file.progress.data.startTime || new Date().getTime(),
              endTime: null
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
          const speedAverage = Math.round(file.size / (new Date().getTime() - file.progress.data.startTime) * 1000);
          file.progress = {
            status: UploadStatus.Done,
            data: {
              percentage: 100,
              speed: speedAverage,
              speedHuman: `${humanizeBytes(speedAverage)}/s`,
              startTime: file.progress.data.startTime,
              endTime: new Date().getTime()
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
      xhr.withCredentials = event.withCredentials ? true : false;

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
