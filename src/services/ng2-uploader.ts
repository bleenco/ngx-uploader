import { EventEmitter, Injectable, OnChanges, Provider } from '@angular/core';
import { Ng2UploaderOptions } from '../classes/ng2-uploader-options.class';
import { UploadedFile } from '../classes/uploaded-file.class';
import { UploadRejected } from '../classes/upload-rejected.class';

@Injectable()
export class Ng2UploaderService {
  _queue: any[];
  _emitter: EventEmitter<any>;
  _previewEmitter: EventEmitter<any>;
  _beforeEmitter: EventEmitter<any>;
  opts: Ng2UploaderOptions;

  constructor() {
    this._queue = [];
    this._emitter = new EventEmitter<any>();
    this._previewEmitter = new EventEmitter<any>();
    this._beforeEmitter = new EventEmitter<any>();
  }

  setOptions(opts: Ng2UploaderOptions) {
    this.opts = opts;
  }

  uploadFilesInQueue(): void {
    let newFiles = this._queue.filter((f) => { return !f.uploading; });
    newFiles.forEach((f) => {
      this.uploadFile(f);
    });
  };

  uploadFile(file: any): void {
    let xhr = new XMLHttpRequest();
    let form = new FormData();
    form.append(this.opts.fieldName, file, file.name);

    Object.keys(this.opts.data).forEach(k => {
      form.append(k, this.opts.data[k]);
    });

    let uploadingFile = new UploadedFile(
      this.generateRandomIndex(),
      file.name,
      file.size
    );

    let queueIndex = this._queue.indexOf(file);

    let time: number = new Date().getTime();
    let load = 0;
    let speed = 0;
    let speedHumanized: string = null;

    xhr.upload.onprogress = (e: ProgressEvent) => {
      if (e.lengthComputable) {
        if (this.opts.calculateSpeed) {
          time = new Date().getTime() - time;
          load = e.loaded - load;
          speed = load / time * 1000;
          speed = parseInt(<any>speed, 10);
          speedHumanized = this.humanizeBytes(speed);
        }

        let percent = Math.round(e.loaded / e.total * 100);
        if (speed === 0) {
          uploadingFile.setProgres({
            total: e.total,
            loaded: e.loaded,
            percent: percent
          });
        } else {
          uploadingFile.setProgres({
            total: e.total,
            loaded: e.loaded,
            percent: percent,
            speed: speed,
            speedHumanized: speedHumanized
          });
        }

        this._emitter.emit(uploadingFile);
      }
    };

    xhr.upload.onabort = (e: Event) => {
      uploadingFile.setAbort();
      this._emitter.emit(uploadingFile);
    };

    xhr.upload.onerror = (e: Event) => {
      uploadingFile.setError();
      this._emitter.emit(uploadingFile);
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        uploadingFile.onFinished(
            xhr.status,
            xhr.statusText,
            xhr.response
        );
        this.removeFileFromQueue(queueIndex);
        this._emitter.emit(uploadingFile);
      }
    };

    xhr.open(this.opts.method, this.opts.url, true);
    xhr.withCredentials = this.opts.withCredentials;

    if (this.opts.customHeaders) {
      Object.keys(this.opts.customHeaders).forEach((key) => {
        xhr.setRequestHeader(key, this.opts.customHeaders[key]);
      });
    }

    if (this.opts.authToken) {
      xhr.setRequestHeader('Authorization', `${this.opts.authTokenPrefix} ${this.opts.authToken}`);
    }

    this._beforeEmitter.emit(uploadingFile);

    if (!uploadingFile.abort) {
      xhr.send(form);
    } else {
      this.removeFileFromQueue(queueIndex);
    }
  }

  addFilesToQueue(files: File[]): void {
    this.clearQueue();
    [].forEach.call(files, (file: File, i: number) => {
      if (!this.inQueue(file)) {
        this._queue.push(file);
      }
    });

    if (this.opts.previewUrl) {
      [].forEach.call(files, (file: File) => this.createFileUrl(file));
    }

    if (this.opts.autoUpload) {
      this.uploadFilesInQueue();
    }
  }

  createFileUrl(file: File){
    let reader: FileReader = new FileReader();
    reader.addEventListener('load', () => {
        this._previewEmitter.emit(reader.result);
    });
    reader.readAsDataURL(file);
  }

  removeFileFromQueue(i: number): void {
    this._queue.splice(i, 1);
  }

  clearQueue(): void {
    this._queue = [];
  }

  getQueueSize(): number {
    return this._queue.length;
  }

  inQueue(file: any): boolean {
    let fileInQueue = this._queue.filter((f) => { return f === file; });
    return fileInQueue.length ? true : false;
  }

  generateRandomIndex(): string {
    return Math.random().toString(36).substring(7);
  }

  humanizeBytes(bytes: number): string {
    if (bytes === 0) {
      return '0 Byte';
    }
    let k = 1024;
    const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    let i: number = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i] + '/s';
  }
}

export const Ng2UploaderServiceProvider: Provider = {
  provide: Ng2UploaderService, useClass: Ng2UploaderService
};
