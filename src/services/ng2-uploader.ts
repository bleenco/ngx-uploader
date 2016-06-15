import {Injectable, EventEmitter} from "@angular/core";

class UploadedFile {
  public id: string;
  public status: number;
  public statusText: string;
  public progress: Object;
  public originalName: string;
  public size: number;
  public response: string;
  public done: boolean;
  public error: boolean;
  public abort: boolean;

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

  public setProgres(progress: Object): void {
    this.progress = progress;
  }

  public setError(): void {
    this.error = true;
    this.done = true;
  }

  public setAbort(): void {
    this.abort = true;
    this.done = true;
  }

  public onFinished(status: number, statusText: string, response: string): void {
    this.status = status;
    this.statusText = statusText;
    this.response = response;
    this.done = true;
  }
}

@Injectable()
export class Ng2Uploader {
  public url: string;
  public cors: boolean = false;
  public withCredentials: boolean = false;
  public multiple: boolean = false;
  public maxUploads: number = 3;
  public allowedExtensions: string[] = [];
  public maxSize: boolean = false;
  public data: Object = {};
  public noParams: boolean = true;
  public autoUpload: boolean = true;
  public multipart: boolean = true;
  public method: string = "POST";
  public debug: boolean = false;
  public customHeaders: Object = {};
  public encodeHeaders: boolean = true;
  public authTokenPrefix: string = "Bearer";
  public authToken: string = undefined;
  public fieldName: string = "file";
  public _emitter: EventEmitter<any> = new EventEmitter(true);

  private _queue: any[] = [];

  public setOptions(options: any): void {

    this.url = options.url != null ? options.url : this.url;
    this.cors = options.cors != null ? options.cors : this.cors;
    this.withCredentials = options.withCredentials != null ? options.withCredentials : this.withCredentials;
    this.multiple = options.multiple != null ? options.multiple : this.multiple;
    this.maxUploads = options.maxUploads != null ? options.maxUploads : this.maxUploads;
    this.allowedExtensions = options.allowedExtensions != null ? options.allowedExtensions : this.allowedExtensions;
    this.maxSize = options.maxSize != null ? options.maxSize : this.maxSize;
    this.data = options.data != null ? options.data : this.data;
    this.noParams = options.noParams != null ? options.noParams : this.noParams;
    this.autoUpload = options.autoUpload != null ? options.autoUpload : this.autoUpload;
    this.multipart = options.multipart != null ? options.multipart : this.multipart;
    this.method = options.method != null ? options.method : this.method;
    this.debug = options.debug != null ? options.debug : this.debug;
    this.customHeaders = options.customHeaders != null ? options.customHeaders : this.customHeaders;
    this.encodeHeaders = options.encodeHeaders != null ? options.encodeHeaders : this.encodeHeaders;
    this.authTokenPrefix = options.authTokenPrefix != null ? options.authTokenPrefix : this.authTokenPrefix;
    this.authToken = options.authToken != null ? options.authToken : this.authToken;
    this.fieldName = options.fieldName != null ? options.fieldName : this.fieldName;

    if (!this.multiple) {
      this.maxUploads = 1;
    }
  }

  public addFilesToQueue(files: FileList[]): void {
    for (let file of files) {
      if (this.isFile(file) && !this.inQueue(file)) {
        this._queue.push(file);
      }
    }

    if (this.autoUpload) {
      this.uploadFilesInQueue();
    }
  }

  public clearQueue(): void {
    this._queue = [];
  }

  public getQueueSize(): number {
    return this._queue.length;
  }

  public log(msg: any): void {
    if (!this.debug) {
      return;
    }
    console.log("[Ng2Uploader]:", msg);
  }

  private uploadFilesInQueue(): void {
    let newFiles = this._queue.filter((f) => { return !f.uploading; });
    newFiles.forEach((f) => {
      this.uploadFile(f);
    });
  };

  private uploadFile(file: any): void {
    let xhr = new XMLHttpRequest();
    let form = new FormData();
    form.append(this.fieldName, file, file.name);

    let uploadingFile = new UploadedFile(
      this.generateRandomIndex(),
      file.name,
      file.size
    );

    let queueIndex = this._queue.indexOf(file);

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
    };

    xhr.upload.onabort = (e) => {
      uploadingFile.setAbort();
      this._emitter.emit(uploadingFile);
    };

    xhr.upload.onerror = (e) => {
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
      xhr.setRequestHeader("Authorization", `${this.authTokenPrefix} ${this.authToken}`);
    }

    xhr.send(form);
  }

  private removeFileFromQueue(i: number): void {
    this._queue.splice(i, 1);
  }

  private generateRandomIndex(): string {
    return Math.random().toString(36).substring(7);
  }

  private inQueue(file: any): boolean {
    let fileInQueue = this._queue.filter((f) => { return f === file; });
    return fileInQueue.length ? true : false;
  }

  private isFile(file: any): boolean {
    return file !== null && (file instanceof Blob || (file.name && file.size));
  }

}
