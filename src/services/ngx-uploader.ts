import { EventEmitter, Injectable, Provider } from '@angular/core';
import { NgUploaderOptions } from '../classes/ng-uploader-options.class';
import { UploadedFile } from '../classes/uploaded-file.class';

@Injectable()
export class NgUploaderService {
  _queue: any[];
  _emitter: EventEmitter<any>;
  _previewEmitter: EventEmitter<any>;
  _beforeEmitter: EventEmitter<any>;
  opts: NgUploaderOptions;

  constructor() {
    this._queue = [];
    this._emitter = new EventEmitter<any>();
    this._previewEmitter = new EventEmitter<any>();
    this._beforeEmitter = new EventEmitter<any>();
  }

  setOptions(opts: NgUploaderOptions) {
    this.opts = opts;
  }

  uploadFilesInQueue(): void {
    this._queue.forEach((file) => {
      if (file.uploading) { return; }
      this.uploadFile(file);
    });
  };

  uploadFile(file: File): void {
    let xhr = new XMLHttpRequest();
    let payload: FormData | File;

    if (this.opts.multipart) {
      let form = new FormData();
      Object.keys(this.opts.data).forEach(k => {
        form.append(k, this.opts.data[k]);
      });

      form.append(this.opts.fieldName, file, file.name);
      payload = form;
    } else {
      payload = file;
    }

    let uploadingFile = new UploadedFile(
      this.generateRandomIndex(),
      file.name,
      file.size
    );

    let queueIndex = this._queue.indexOf(file);

    let time: number = new Date().getTime();
    let load = 0;
    let speed = 0;
    let speedHumanized: string|null = null;

    xhr.upload.onprogress = (e: ProgressEvent) => {
      if (e.lengthComputable) {
        if (this.opts.calculateSpeed) {
          const diff = new Date().getTime() - time;
          time += diff;
          load = e.loaded - load;
          speed = load / diff * 1000;
          speed = parseInt(<any>speed, 10);
          speedHumanized = this.humanizeBytes(speed);
        }

        let percent = Math.round(e.loaded / e.total * 100);
        if (speed === 0) {
          uploadingFile.setProgress({
            total: e.total,
            loaded: e.loaded,
            percent: percent
          });
        } else {
          uploadingFile.setProgress({
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

    xhr.upload.onabort = () => {
      uploadingFile.setAbort();
      this._emitter.emit(uploadingFile);
    };

    xhr.upload.onerror = () => {
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

    xhr.open(<string>this.opts.method, this.opts.url, true);
    xhr.withCredentials = <boolean>this.opts.withCredentials;

    if (this.opts.filenameHeader) {
      xhr.setRequestHeader(this.opts.filenameHeader, file.name);
    }

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
      xhr.send(payload);
    } else {
      this.removeFileFromQueue(queueIndex);
    }
  }

  addFilesToQueue(files: File[]): void {
    this.clearQueue();
    [].forEach.call(files, (file: File) => {
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

  createFileUrl(file: File) {
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

export const NgUploaderServiceProvider: Provider = {
  provide: NgUploaderService, useClass: NgUploaderService
};
