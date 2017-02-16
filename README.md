# ngx-uploader

For demos please see [demos page](http://ngx-uploader.com).

## Angular2 File Uploader

### Installation

```
npm install ngx-uploader --save
```

### API Docs

[http://docs.ngx-uploader.com](http://docs.ngx-uploader.com)

### Examples

- [Basic Example](https://github.com/jkuri/ngx-uploader#basic-example)
- [Advanced Example](https://github.com/jkuri/ngx-uploader#advanced-example)

--------

#### Basic Example

````ts
// app.module.ts
import { NgUploaderModule } from 'ngx-uploader';
...
@NgModule({
  ...
  imports: [
    NgUploaderModule
  ],
  ...
})

// demo.component.ts
import { Component, NgZone, Inject } from '@angular/core';
import { NgUploaderOptions } from 'ngx-uploader';

@Component({
  selector: 'demo',
  templateUrl: 'demo.component.html'
})
export class DemoComponent {
  options: NgUploaderOptions;
  response: any;
  hasBaseDropZoneOver: boolean;

  constructor(@Inject(NgZone) private zone: NgZone) {
    this.options = new NgUploaderOptions({
      url: 'http://api.ngx-uploader.com/upload',
      autoUpload: true,
      calculateSpeed: true
    });
  }

  handleUpload(data: any) {
    setTimeout(() => {
      this.zone.run(() => {
        this.response = data;
        if (data && data.response) {
          this.response = JSON.parse(data.response);
        }
      });
    });
  }

  fileOverBase(e: boolean) {
    this.hasBaseDropZoneOver = e;
  }
}
````

````html
<!-- demo.component.html -->
<input type="file"
       ngFileSelect
       [options]="options"
       (onUpload)="handleUpload($event)"
       (beforeUpload)="beforeUpload($event)">

<!-- drag & drop file example-->
<style>
  .file-over { border: dotted 3px red; } /* Default class applied to drop zones on over */
</style>
<div ngFileDrop
     [options]="options"
     (onUpload)="handleUpload($event)"
     [ngClass]="{'file-over': hasBaseDropZoneOver}"
     (onFileOver)="fileOverBase($event)">
</div>

<div>
Response: {{ response | json }}
</div>
````

#### Advanced Example

```ts
// advanced-demo.component.ts
import { Component, NgZone, Inject, EventEmitter } from '@angular/core';
import { NgUploaderOptions, UploadedFile, UploadRejected } from 'ngx-uploader';

@Component({
  selector: 'advanced-demo',
  templateUrl: 'advanced-demo.component.html'
})
export class AdvancedDemoComponent {
  options: NgUploaderOptions;
  response: any;
  sizeLimit: number = 1000000; // 1MB
  previewData: any;
  errorMessage: string;
  inputUploadEvents: EventEmitter<string>;

  constructor(@Inject(NgZone) private zone: NgZone) {
    this.options = new NgUploaderOptions({
      url: 'http://api.ngx-uploader.com/upload',
      filterExtensions: true,
      allowedExtensions: ['jpg', 'png'],
      maxSize: 2097152,
      data: { userId: 12 },
      autoUpload: false,
      fieldName: 'file',
      fieldReset: true,
      maxUploads: 2,
      method: 'POST',
      previewUrl: true,
      withCredentials: false
    });

    this.inputUploadEvents = new EventEmitter<string>();
  }

  startUpload() {
    this.inputUploadEvents.emit('startUpload');
  }

  beforeUpload(uploadingFile: UploadedFile): void {
    if (uploadingFile.size > this.sizeLimit) {
      uploadingFile.setAbort();
      this.errorMessage = 'File is too large!';
    }
  }

  handleUpload(data: any) {
    setTimeout(() => {
      this.zone.run(() => {
        this.response = data;
        if (data && data.response) {
          this.response = JSON.parse(data.response);
        }
      });
    });
  }

  handlePreviewData(data: any) {
    this.previewData = data;
  }
}
```

```html
<!-- advanced-demo.component.html -->
<div class="button-container">
  <label class="upload-button is-pulled-left">
    <input type="file"
           class="hidden"
           ngFileSelect
           [options]="options"
           [events]="inputUploadEvents"
           (onUpload)="handleUpload($event)"
           (onPreviewData)="handlePreviewData($event)"
           (beforeUpload)="beforeUpload($event)">
    Browse
  </label>
</div>

<p>
  Allowed extensions: <code><b>.jpg</b>, <b>.png</b></code>
</p>

<div>
  <button type="button" class="start-upload-button" (click)="startUpload()">Start Upload</button>
</div>

<div *ngIf="response">
  <pre><code>{{ response | json }}</code></pre>
</div>

<div *ngIf="errorMessage">
  <code>{{ errorMessage }}</code>
</div>

<div *ngIf="previewData && !response">
  <img [src]="previewData">
</div>
```

### Demos

For more information, examples and usage examples please see [demos](http://ngx-uploader.com)

#### LICENCE

MIT
