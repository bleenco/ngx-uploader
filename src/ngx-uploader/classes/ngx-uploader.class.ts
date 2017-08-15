import { EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subscriber } from 'rxjs/Subscriber';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';

export interface BlobFile extends Blob {
  name: string;
}
 
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
  files: UploadFile[];
  uploads: { file?: UploadFile, files?: UploadFile[], sub: {instance: Subscription} }[];
  serviceEvents: EventEmitter<UploadOutput>;

  constructor() {
    this.files = [];
    this.serviceEvents = new EventEmitter<any>();
  }

  handleFiles(incomingFiles: FileList): void {
    this.files.push(...[].map.call(incomingFiles, (file: File, i: number) => {
      const uploadFile: UploadFile = {
        fileIndex: i,
        id: this.generateId(),
        name: file.name,
        size: file.size,
        type: file.type,
        form: new FormData(),
        progress: {
          status: UploadStatus.Queue,
          data: {
            percentage: 0,
            speed: 0,
            speedHuman: `${humanizeBytes(0)}/s`,
            startTime: null,
            endTime: null,
            eta: null,
            etaHuman: null
          }
        },
        lastModifiedDate: file.lastModifiedDate,
        sub: undefined,
        nativeFile: file
      };
      i = i + 1;

      this.serviceEvents.emit({ type: 'addedToQueue', file: uploadFile });
      return uploadFile;
    }));

    this.serviceEvents.emit({ type: 'allAddedToQueue' });
  }

  initInputEvents(input: EventEmitter<UploadInput>): void {
    input.subscribe((event: UploadInput) => {
      switch (event.type) {
        case 'uploadFile':
          const uploadFileIndex = this.files.findIndex(file => file === event.file);
          if (uploadFileIndex !== -1 && event.file) {
            
            this.files[uploadFileIndex].sub = this.uploadFile(event.file, event).subscribe(data => {
              this.serviceEvents.emit(data);
            });
          }
        break;
        case 'uploadAll':
          const concurrency = typeof event.concurrency !== 'undefined' && event.concurrency > 0 ? event.concurrency : Number.POSITIVE_INFINITY;
          const files = this.files.filter(file => file.progress.status === UploadStatus.Queue);
          if (!files.length) {
            return;
          }
          Observable.of(...files)
            .mergeMap(file => {
              return this.uploadFile(file, event);
            }, concurrency)
            .subscribe(data => {
              this.serviceEvents.emit(data);
            });
        break;
        case 'cancel':
          const id = event.id || null;
          if (!id) {
            return;
          }

          const index = this.files.findIndex(file => file.id === id);
          if (index !== -1) {
            if (this.files[index].sub) {
              this.files[index].sub.unsubscribe();
            }

            this.serviceEvents.emit({ type: 'cancelled', file: this.files[index] });
            this.files[index].progress.status = UploadStatus.Canceled;
          }
        break;
        case 'cancelAll':
        
          this.files.forEach(file => {
            if (file.sub) {
              file.sub.unsubscribe();
            }

            file.progress.status = UploadStatus.Canceled;
            this.serviceEvents.emit({ type: 'cancelled', file: file });
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
      const url = event.url || '';
      const method = event.method || 'POST';
      const data = event.data || {};
      const headers = event.headers || {};

      const reader = new FileReader();
      const xhr = new XMLHttpRequest();
      let time: number = new Date().getTime();
      let progressStartTime: number = (file.progress.data && file.progress.data.startTime) || time;
      let speed = 0;
      let eta: number | null = null;

      xhr.upload.addEventListener('progress', (e: ProgressEvent) => {
        if (e.lengthComputable) {
          const percentage = Math.round((e.loaded * 100) / e.total);
          const diff = new Date().getTime() - time;
          speed = Math.round(e.loaded / diff * 1000);
          progressStartTime = (file.progress.data && file.progress.data.startTime) || new Date().getTime();
          eta = Math.ceil((e.total - e.loaded) / speed);

          file.progress = {
            status: UploadStatus.Uploading,
            data: {
              percentage: percentage,
              speed: speed,
              speedHuman: `${humanizeBytes(speed)}/s`,
              startTime: progressStartTime,
              endTime: null,
              eta: eta,
              etaHuman: this.secondsToHuman(eta)
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
          const speedAverage = Math.round(file.size / (new Date().getTime() - progressStartTime) * 1000);
          file.progress = {
            status: UploadStatus.Done,
            data: {
              percentage: 100,
              speed: speedAverage,
              speedHuman: `${humanizeBytes(speedAverage)}/s`,
              startTime: progressStartTime,
              endTime: new Date().getTime(),
              eta: eta,
              etaHuman: this.secondsToHuman(eta || 0)
            }
          };

          file.responseStatus = xhr.status;

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

      try {
        const uploadFile = <BlobFile>file.nativeFile;
        const uploadIndex = this.files.findIndex(file => file.nativeFile === uploadFile);

        if (this.files[uploadIndex].progress.status === UploadStatus.Canceled) {
          observer.complete();
        }

        file.form.append(event.fieldName || 'file', uploadFile, uploadFile.name);

        Object.keys(data).forEach(key => file.form.append(key, data[key]));
        Object.keys(headers).forEach(key => xhr.setRequestHeader(key, headers[key]));

        this.serviceEvents.emit({ type: 'start', file: file });
        xhr.send(file.form);
      } catch (e) {
        observer.complete();
      }

      return () => {
        xhr.abort();
        reader.abort();
      };
    });
  }

  secondsToHuman(sec: number): string {
    return new Date(sec * 1000).toISOString().substr(11, 8);
  }

  generateId(): string {
    return Math.random().toString(36).substring(7);
  }
}
