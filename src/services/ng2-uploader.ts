import { EventEmitter } from '@angular/core';

export class UploadedFile {
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
  startTime: number;
  endTime: number;
  speedAverage: number;
  speedAverageHumanized: string;

  constructor(id: string, originalName: string, size: number) {
    this.id = id;
    this.originalName = originalName;
    this.size = size;
    this.progress = {
      loaded: 0,
      total: 0,
      percent: 0,
      speed: 0,
      speedHumanized: null
    };
    this.done = false;
    this.error = false;
    this.abort = false;
    this.startTime = new Date().getTime();
    this.endTime = 0;
    this.speedAverage = 0;
    this.speedAverageHumanized = null;
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
    this.endTime = new Date().getTime();
    this.speedAverage = this.size / (this.endTime - this.startTime) * 1000;
    this.speedAverage = parseInt(<any>this.speedAverage, 10);
    this.speedAverageHumanized = humanizeBytes(this.speedAverage);
    this.status = status;
    this.statusText = statusText;
    this.response = response;
    this.done = true;
  }
}

export class Ng2Uploader {
  url: string;
  cors: boolean = false;
  withCredentials: boolean = false;
  multiple: boolean = false;
  maxUploads: number = 3;
  data: { [index: string]: any } = {};
  autoUpload: boolean = true;
  multipart: boolean = true;
  method: string = 'POST';
  debug: boolean = false;
  customHeaders: any = {};
  encodeHeaders: boolean = true;
  authTokenPrefix: string = 'Bearer';
  authToken: string = undefined;
  fieldName: string = 'file';
  previewUrl: boolean = false;
  calculateSpeed: boolean = false;
  _queue: any[] = [];
  _emitter: EventEmitter<any> = new EventEmitter();
  _previewEmitter: EventEmitter<any> = new EventEmitter();

  setOptions(options: any): void {
    this.url = options.url != null ? options.url : this.url;
    this.cors = options.cors != null ? options.cors : this.cors;
    this.withCredentials = options.withCredentials != null ? options.withCredentials : this.withCredentials;
    this.multiple = options.multiple != null ? options.multiple : this.multiple;
    this.maxUploads = options.maxUploads != null ? options.maxUploads : this.maxUploads;
    this.data = options.data != null ? options.data : this.data;
    this.autoUpload = options.autoUpload != null ? options.autoUpload : this.autoUpload;
    this.multipart = options.multipart != null ? options.multipart : this.multipart;
    this.method = options.method != null ? options.method : this.method;
    this.customHeaders = options.customHeaders != null ? options.customHeaders : this.customHeaders;
    this.encodeHeaders = options.encodeHeaders != null ? options.encodeHeaders : this.encodeHeaders;
    this.authTokenPrefix = options.authTokenPrefix != null ? options.authTokenPrefix : this.authTokenPrefix;
    this.authToken = options.authToken != null ? options.authToken : this.authToken;
    this.fieldName = options.fieldName != null ? options.fieldName : this.fieldName;
    this.previewUrl = options.previewUrl != null ? options.previewUrl : this.previewUrl;
    this.calculateSpeed = options.calculateSpeed != null ? options.calculateSpeed : this.calculateSpeed;
    if (!this.multiple) {
      this.maxUploads = 1;
    }
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
    form.append(this.fieldName, file, file.name);

    Object.keys(this.data).forEach(k => {
      form.append(k, this.data[k]);
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
        if (this.calculateSpeed) {
          time = new Date().getTime() - time;
          load = e.loaded - load;
          speed = load / time * 1000;
          speed = parseInt(<any>speed, 10);
          speedHumanized = humanizeBytes(speed);
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

    xhr.open(this.method, this.url, true);
    xhr.withCredentials = this.withCredentials;

    if (this.customHeaders) {
      Object.keys(this.customHeaders).forEach((key) => {
        xhr.setRequestHeader(key, this.customHeaders[key]);
      });
    }

    if (this.authToken) {
      xhr.setRequestHeader('Authorization', `${this.authTokenPrefix} ${this.authToken}`);
    }

    xhr.send(form);
  }

  addFilesToQueue(files: File[]): void {
    files.forEach((file: File, i: number) => {
      if (this.isFile(file) && !this.inQueue(file)) {
        this._queue.push(file);
      }
    });

    if (this.previewUrl) {
      files.forEach(file => this.createFileUrl(file));
    }

    if (this.autoUpload) {
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

  isFile(file: any): boolean {
    return file !== null && (file instanceof Blob || (file.name && file.size));
  }

  generateRandomIndex(): string {
    return Math.random().toString(36).substring(7);
  }
}

function humanizeBytes(bytes: number): string {
  if (bytes === 0) {
    return '0 Byte';
  }
  let k = 1024;
  const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let i: number = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i] + '/s';
}
