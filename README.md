# ngx-uploader fork (version 2.2.5) with plainJson option

Use option.plainJson = true for sending file as encoded string (i.e. base64) in plain json struct in option.data. See advanced example.


- [Advanced Example](https://github.com/jkuri/ngx-uploader#advanced-example)

--------


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
  startUploadEvent: EventEmitter<string>;

  constructor(@Inject(NgZone) private zone: NgZone) {
    this.options = new NgUploaderOptions({
      url: 'http://api.ngx-uploader.com/upload',
      filterExtensions: true,
      allowedExtensions: ['txt', 'pdf'],
      maxSize: 2097152,
      data:{
                '@type': "File",
                "title": "My lorem.txt file",
                "file": {
                    "data": "TG9yZW0gSXBzdW0u",
                    "encoding": "base64",
                    "filename": "lorem.txt",
                    "content-type": "text/plain"}
               },
       customHeaders: {
          'Content-Type':'application/json',
          'Accept':'application/json'
      },
      autoUpload: false,
      plainJson: true,
      fieldName: 'file',
      fieldReset: true,
      maxUploads: 2,
      method: 'POST',
      previewUrl: true,
      withCredentials: false
    });

    this.startUploadEvent = new EventEmitter<string>();
  }

  startUpload() {
    //this.inputUploadEvents.emit('startUpload');
    this.startUploadEvent.emit("startUpload");
  }

  beforeUpload(ev : Event): void {
   
    let file: File =  ev.target['files'][0];
    let myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
        let tmpB64String = myReader.result.split(',');
        
        this.options['data']['file']['data'] = tmpB64String[1] ;
        this.options['data']['file']['filename'] = file.name;
        this.options['data']['title'] = file.name;

        startUpload();
        
    }
    myReader.readAsDataURL(file);
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
           [events]="startUploadEvent"
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
