import { EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/mergeMap';
import { UploadFile, UploadOutput, UploadInput, UploadStatus, BlobFile } from './interfaces';

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
  queue: UploadFile[];
  serviceEvents: EventEmitter<UploadOutput>;
  uploadScheduler: Subject<{ file: UploadFile, event: UploadInput }>;
  subs: { id: string, sub: Subscription }[];
  contentTypes: string[];

  constructor(concurrency: number = Number.POSITIVE_INFINITY, contentTypes: string[] = ['*']) {
    this.queue = [];
    this.serviceEvents = new EventEmitter<any>();
    this.uploadScheduler = new Subject();
    this.subs = [];
    this.contentTypes = contentTypes;

    this.uploadScheduler
      .mergeMap(upload => this.startUpload(upload), concurrency)
      .subscribe(uploadOutput => this.serviceEvents.emit(uploadOutput));
  }

  handleFiles(incomingFiles: FileList): void {
    const allowedIncomingFiles: File[] = [].reduce.call(incomingFiles, (acc: File[], checkFile: File, i: number) => {
      if (this.isContentTypeAllowed(checkFile.type)) {
        acc = acc.concat(checkFile);
      } else {
        const rejectedFile: UploadFile = this.makeUploadFile(checkFile, i);
        this.serviceEvents.emit({ type: 'rejected', file: rejectedFile });
      }

      return acc;
    }, []);

    this.queue.push(...[].map.call(allowedIncomingFiles, (file: File, i: number) => {
      const uploadFile: UploadFile = this.makeUploadFile(file, i);
      this.serviceEvents.emit({ type: 'addedToQueue', file: uploadFile });
      return uploadFile;
    }));

    this.serviceEvents.emit({ type: 'allAddedToQueue' });
  }

  initInputEvents(input: EventEmitter<UploadInput>): Subscription {
    return input.subscribe((event: UploadInput) => {
      switch (event.type) {
        case 'uploadFile':
          const uploadFileIndex = this.queue.findIndex(file => file === event.file);
          if (uploadFileIndex !== -1 && event.file) {
            this.uploadScheduler.next({ file: this.queue[uploadFileIndex], event: event });
          }
        break;
        case 'uploadAll':
          const files = this.queue.filter(file => file.progress.status === UploadStatus.Queue);
          files.forEach(file => this.uploadScheduler.next({ file: file, event: event }));
        break;
        case 'cancel':
          const id = event.id || null;
          if (!id) {
            return;
          }

          const index = this.subs.findIndex(sub => sub.id === id);
          if (index !== -1 && this.subs[index].sub) {
            this.subs[index].sub.unsubscribe();

            const fileIndex = this.queue.findIndex(file => file.id === id);
            if (fileIndex !== -1) {
              this.queue[fileIndex].progress.status = UploadStatus.Cancelled;
              this.serviceEvents.emit({ type: 'cancelled', file: this.queue[fileIndex] });
            }
          }
        break;
        case 'cancelAll':
          this.subs.forEach(sub => {
            if (sub.sub) {
              sub.sub.unsubscribe();
            }

            const file = this.queue.find(uploadFile => uploadFile.id === sub.id);
            if (file) {
              file.progress.status = UploadStatus.Cancelled;
              this.serviceEvents.emit({ type: 'cancelled', file: file });
            }
          });
        break;
        case 'remove':
          if (!event.id) {
            return;
          }

          const i = this.queue.findIndex(file => file.id === event.id);
          if (i !== -1) {
            const file = this.queue[i];
            this.queue.splice(i, 1);
            this.serviceEvents.emit({ type: 'removed', file: file });
          }
        break;
        case 'removeAll':
          if (this.queue.length) {
            this.queue = [];
            this.serviceEvents.emit({ type: 'removedAll' });
          }
        break;
      }
    });
  }

  startUpload(upload: { file: UploadFile, event: UploadInput }): Observable<UploadOutput> {
    return new Observable(observer => {
      const sub = this.uploadFile(upload.file, upload.event)
        .subscribe(output => {
          observer.next(output);
        }, err => {
          observer.error(err);
          observer.complete();
        }, () => {
          observer.complete();
        });

      this.subs.push({ id: upload.file.id, sub: sub });
    });
  }

  uploadFile(file: UploadFile, event: UploadInput): Observable<UploadOutput> {
    return new Observable(observer => {
      const url = event.url || '';
      const method = event.method || 'POST';
      const data = event.data || {};
      const headers = event.headers || {};

      const xhr = new XMLHttpRequest();
      const time: number = new Date().getTime();
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
        const uploadIndex = this.queue.findIndex(outFile => outFile.nativeFile === uploadFile);

        if (this.queue[uploadIndex].progress.status === UploadStatus.Cancelled) {
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
      };
    });
  }

  secondsToHuman(sec: number): string {
    return new Date(sec * 1000).toISOString().substr(11, 8);
  }

  generateId(): string {
    return Math.random().toString(36).substring(7);
  }

  setContentTypes(contentTypes: string[]): void {
    if ( typeof contentTypes != 'undefined' && contentTypes instanceof Array ) {
      if (contentTypes.find((type: string) => type === '*') !== undefined) {
        this.contentTypes = ['*'];
      } else {
        this.contentTypes = contentTypes;
      }
      return;
    }
    this.contentTypes = ['*'];
  }

  allContentTypesAllowed(): boolean {
    return this.contentTypes.find((type: string) => type === '*') !== undefined;
  }

  isContentTypeAllowed(mimetype: string): boolean {
    if (this.allContentTypesAllowed()) {
      return true;
    }
    return this.contentTypes.find((type: string) => type === mimetype) !== undefined;
  }

  makeUploadFile(file: File, index: number): UploadFile {
    return {
      fileIndex: index,
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
  }
}
