# ngx-uploader

[![AbstruseCI](https://ci.bleenco.io/badge/11)](https://ci.bleenco.io/repo/11)

Angular 2+ File Uploader (this includes also Angular 5)

http://ngx-uploader.com

#### <a name="question"></a> Got a Question or Problem?

Do not open issues for general support questions as we want to keep GitHub issues for bug reports and feature requests. You've got much better chances of getting your question answered on [Stack Overflow](https://stackoverflow.com) where the questions should be tagged with tag `ngx-uploader`.

To save your and our time, we will systematically close all issues that are requests for general support and redirect people to Stack Overflow.

### Maintenance Information
We are actively maintain the 4.x branch. 
The 2.x and 3.x are outdated and you should *NOT* use this branches any more. Therefore all open issues for that releases will be closed soon.

**This module has been completely rewritten from scratch with the version `3.0.0`.**

If you are looking for documentation for version prior to `3.0.0`, please check [2.x.x](https://github.com/jkuri/ngx-uploader/tree/2.x.x) branch.

## Installation

1. Add `ngx-uploader` module as dependency to your project.

```
npm install ngx-uploader --save
```

2. Include `NgUploaderModule` into your main AppModule or in module where you will use it.

```
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgUploaderModule } from 'ngx-uploader';

@NgModule({
  imports: [
    BrowserModule,
    NgUploaderModule
  ],
  declarations: [ AppComponent ],
  exports: [ AppComponent ]
})
export class AppModule {}
```

## Data Structures of Events and Uploaded Files

```ts
export interface UploadProgress {
  status: UploadStatus; // current status of upload for specific file (Queue | Uploading | Done | Canceled)
  data?: {
    percentage: number; // percentage of upload already completed
    speed: number; // current upload speed per second in bytes
    speedHuman: string; // current upload speed per second in human readable form,
    eta: number; // estimated time remaining in seconds
    etaHuman: string; // estimated time remaining in human readable format
  };
}

export interface UploadFile {
  id: string; // unique id of uploaded file instance
  fileIndex: number; // fileIndex in internal ngx-uploader array of files
  lastModifiedDate: Date; // last modify date of the file (Date object)
  name: string; // original name of the file
  size: number; // size of the file in bytes
  type: string; // mime type of the file
  form: FormData; // FormData object (you can append extra data per file, to this object)
  progress: UploadProgress;
  response?: any; // response when upload is done (parsed JSON or string)
  responseStatus?: number; // response status code when upload is done
  responseHeaders?: { [key: string]: string }; // response headers when upload is done
}

// output events emitted by ngx-uploader
export interface UploadOutput {
  type: 'addedToQueue' | 'allAddedToQueue' | 'uploading' | 'done' | 'removed' | 'start' | 'cancelled' | 'dragOver' | 'dragOut' | 'drop';
  file?: UploadFile;
  nativeFile?: File; // native javascript File object, can be used to process uploaded files in other libraries
}

// input events that user can emit to ngx-uploader
export interface UploadInput {
  type: 'uploadAll' | 'uploadFile' | 'cancel' | 'cancelAll' | 'remove' | 'removeAll';
  url?: string; // URL to upload file to
  method?: string; // method (POST | PUT)
  id?: string; // unique id of uploaded file
  fieldName?: string; // field name (default 'file')
  fileIndex?: number; // fileIndex in internal ngx-uploader array of files
  file?: UploadFile; // uploading file
  data?: { [key: string]: string | Blob }; // custom data sent with the file
  headers?: { [key: string]: string }; // custom headers
  concurrency?: number; // concurrency of how many files can be uploaded in parallel (default is 0 which means unlimited)
  withCredentials?: boolean; // apply withCredentials option
}
```

## Upload Restrictions

With version 4.2.1 we've introduced restrictions for Content-Types.
To not break the behaviour of previous releases, there are no restrictions by default at all.

Look at [app-home.component.ts](https://github.com/bleenco/ngx-uploader/blob/master/src/components/app-home/app-home.component.ts) for an example of Content-Type restriction.

If you want to toast a message for the rejected file, add this to your onUploadOutput method.

```ts
onUploadOutput(output: UploadOutput): void {
....
} else if (output.type === 'rejected' && typeof output.file !== 'undefined') {
  // console.log(output.file.name + ' rejected');
}
...
```

## Token Authorization
If you have to upload files with Token Authorization, you can set the header in startUpload as follows.

```ts
startUpload(): void {
  let token = this.myToken;  // <----  get token
  const event: UploadInput = {
    type: 'uploadAll',
    url: 'http://ngx-uploader.com/upload',
    method: 'POST',
    headers: { 'Authorization': 'JWT ' + token },  // <----  set headers
    data: { foo: 'bar' }
  };

  this.uploadInput.emit(event);
}
```

## Example

**You can always run working example by cloning this repository, building project with `yarn build:prod` and running server with `node ./dist/api/index.js`.**

### Component Code

```ts
import { Component, EventEmitter } from '@angular/core';
import { UploadOutput, UploadInput, UploadFile, humanizeBytes, UploaderOptions } from 'ngx-uploader';

@Component({
  selector: 'app-home',
  templateUrl: 'app-home.component.html'
})
export class AppHomeComponent {
  options: UploaderOptions;
  formData: FormData;
  files: UploadFile[];
  uploadInput: EventEmitter<UploadInput>;
  humanizeBytes: Function;
  dragOver: boolean;

  constructor() {
    this.files = []; // local uploading files array
    this.uploadInput = new EventEmitter<UploadInput>(); // input events, we use this to emit data to ngx-uploader
    this.humanizeBytes = humanizeBytes;
  }

  onUploadOutput(output: UploadOutput): void {
    if (output.type === 'allAddedToQueue') { // when all files added in queue
      // uncomment this if you want to auto upload files when added
      // const event: UploadInput = {
      //   type: 'uploadAll',
      //   url: '/upload',
      //   method: 'POST',
      //   data: { foo: 'bar' }
      // };
      // this.uploadInput.emit(event);
    } else if (output.type === 'addedToQueue'  && typeof output.file !== 'undefined') { // add file to array when added
      this.files.push(output.file);
    } else if (output.type === 'uploading' && typeof output.file !== 'undefined') {
      // update current data in files array for uploading file
      const index = this.files.findIndex(file => typeof output.file !== 'undefined' && file.id === output.file.id);
      this.files[index] = output.file;
    } else if (output.type === 'removed') {
      // remove file from array when removed
      this.files = this.files.filter((file: UploadFile) => file !== output.file);
    } else if (output.type === 'dragOver') {
      this.dragOver = true;
    } else if (output.type === 'dragOut') {
      this.dragOver = false;
    } else if (output.type === 'drop') {
      this.dragOver = false;
    }
  }

  startUpload(): void {
    const event: UploadInput = {
      type: 'uploadAll',
      url: 'http://ngx-uploader.com/upload',
      method: 'POST',
      data: { foo: 'bar' }
    };

    this.uploadInput.emit(event);
  }

  cancelUpload(id: string): void {
    this.uploadInput.emit({ type: 'cancel', id: id });
  }

  removeFile(id: string): void {
    this.uploadInput.emit({ type: 'remove', id: id });
  }

  removeAllFiles(): void {
    this.uploadInput.emit({ type: 'removeAll' });
  }
}
```

### Template Code

For whole template code please check [here](https://github.com/bleenco/ngx-uploader/blob/master/src/components/app-home/app-home.component.html).

```html
<div class="drop-container" ngFileDrop [options]="options" (uploadOutput)="onUploadOutput($event)" [uploadInput]="uploadInput" [ngClass]="{ 'is-drop-over': dragOver }">
  <h1>Drag &amp; Drop</h1>
</div>

<label class="upload-button">
  <input type="file" ngFileSelect [options]="options" (uploadOutput)="onUploadOutput($event)" [uploadInput]="uploadInput" multiple>
  or choose file(s)
</label>

<button type="button" class="start-upload-btn" (click)="startUpload()">
  Start Upload
</button>
```

### LICENCE

MIT
