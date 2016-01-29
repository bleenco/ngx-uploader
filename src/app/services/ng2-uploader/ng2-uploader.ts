import {Injectable, EventEmitter} from 'angular2/core';

class UploadedFile {
  id: string;
  status: number;
  statusText: string;
  progress: Object;
  originalName: string;
  size: number;
  response: string;
  done: boolean;
  error: boolean;
  abort: boolean;

  constructor(id: string, originalName: string, size: number) {
    this.id = id;
    this.originalName = originalName;
    this.size = size;
    this.progress = {
      loaded: 0,
      total: 0,
      percent: 0
    };
    this.done = false;
    this.error = false;
    this.abort = false;
  }

  setProgres(progress: Object): void {
    this.progress = progress;
  }

  setError(): void {
    this.error = true;
    this.done = true;
  }

  setAbort(): void {
    this.abort = true;
    this.done = true;
  }

  onFinished(status: number, statusText: string, response: string): void {
    this.status = status;
    this.statusText = statusText;
    this.response = response;
    this.done = true;
  }
}

@Injectable()
export class Ng2Uploader {
  url: string;
  cors: boolean = false;
  withCredentials: boolean = false;
  multiple: boolean = false;
  maxUploads: number = 3;
  allowedExtensions: string[] = [];
  maxSize: boolean = false;
  data: Object = {};
  noParams: boolean = true;
  autoUpload: boolean = true;
  multipart: boolean = true;
  method: string = 'POST';
  debug: boolean = false;
  customHeaders: Object = {};
  encodeHeaders: boolean = true;
  authTokenPrefix: string = Bearer;
  authToken: string = undefined;

  _queue: any[] = [];
  _emitter: EventEmitter<any> = new EventEmitter(true);

  setOptions(options: any): void {
    this.url = options && options.url || this.url;
    this.cors = options && options.cors || this.cors;
    this.withCredentials = options && options.withCredentials || this.withCredentials;
    this.multiple = options && options.multiple || this.multiple;
    this.maxUploads = options && options.maxUploads || this.maxUploads;
    this.allowedExtensions = options && options.allowedExtensions || this.allowedExtensions;
    this.maxSize = options && options.maxSize || this.maxSize;
    this.data = options && options.data || this.data;
    this.noParams = options && options.noParams || this.noParams;
    this.autoUpload = options && options.autoUpload || this.autoUpload;
    this.multipart = options && options.multipart || this.multipart;
    this.method = options && options.method || this.method;
    this.debug = options && options.debug || this.debug;
    this.customHeaders = options && options.customHeaders || this.customHeaders;
    this.encodeHeaders = options && options.encodeHeaders || this.encodeHeaders;
    this.authTokenPrefix = options && options.authTokenPrefix || this.authTokenPrefix;
    this.authToken = options && options.authToken || this.authToken;

    if (!this.multiple) {
        this.maxUploads = 1;
    }
  }

  uploadFilesInQueue(): void {
    let newFiles = this._queue.filter((f) => { return !f.uploading; });
    newFiles.map((f) => {
      this.uploadFile(f);
    });
  };

  uploadFile(file: any): void {
    let xhr = new XMLHttpRequest();
    let form = new FormData();
    form.append('file', file, file.name);

    let uploadingFile = new UploadedFile(
      this.generateRandomIndex(),
      file.name,
      file.size
    );
    
    let queueIndex = this._queue.findIndex(x => x === file);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        let percent = Math.round(e.loaded / e.total * 100);
        uploadingFile.setProgres({
          total: e.total,
          loaded: e.loaded,
          percent: percent
        });

        this._emitter.emit(uploadingFile);
      }
    }

    xhr.upload.onabort = (e) => {
      uploadingFile.setAbort();
      this._emitter.emit(uploadingFile);
    }

    xhr.upload.onerror = (e) => {
      uploadingFile.setError();
      this._emitter.emit(uploadingFile); 
    }

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
    }

    xhr.open(this.method, this.url, true);
    xhr.withCredentials = this.withCredentials;

    if (this.customHeaders) {
      Object.keys(this.customHeaders).forEach((key) => {
        xhr.setRequestHeader(key, this.customHeaders[key]);
      });
    }

    if (this.authToken) {
      xhr.setRequestHeader("Authorization", `${this.authTokenPrefix} ${this.authToken}`);
    }

    xhr.send(form);
  }

  addFilesToQueue(files: FileList[]): void {
    for (let file of files) {
      if (this.isFile(file) && !this.inQueue(file)) {
        this._queue.push(file);
      }
    }

    if (this.autoUpload) {
      this.uploadFilesInQueue();
    }
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

  isFile(file: any): boolean {
    return file !== null && (file instanceof Blob || (file.name && file.size));
  }

  log(msg: any): void {
    if (!this.debug) {
      return;
    }
    console.log('[Ng2Uploader]:', msg);
  }

  generateRandomIndex(): string {
    return Math.random().toString(36).substring(7);
  }

}
