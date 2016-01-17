# ng2-uploader

For demos please see [demos page](http://ng2-uploader.jankuri.com).

## Angular2 File Uploader

### Installation

```
npm install ng2-uploader
```

### Basic Example

`component.ts`
````typescript
import {Component} from 'angular2/core';
import {UPLOAD_DIRECTIVES} from 'ng2-uploader';

@Component({
  selector: 'demo-app',
  templateUrl: 'app/demo.html',
  directives: [UPLOAD_DIRECTIVES],
})
export class DemoApp {
  uploadFile: any;
  options: Object = {
    url: 'http://localhost:10050/upload'
  };

  handleUpload(data): void {
    if (data && data.response) {
      data = JSON.parse(data.response);
      this.uploadFile = data;
    }
  }
}
````

`component.html`
````html
<input type="file" 
       [ng-file-select]="options"
       (onUpload)="handleUpload($event)">

<div>
Response: {{ uploadFile | json }}
</div>
````

### Multiple files example

`component.ts`
````typescript
import {Component} from 'angular2/core';
import {UPLOAD_DIRECTIVES} from 'ng2-uploader';

@Component({
  selector: 'basic-multiple',
  templateUrl: 'basic-multiple.html',
  directives: [UPLOAD_DIRECTIVES],
})
export class BasicMultiple {
  uploadedFiles: any[] = [];
  options: Object = {
      url: 'http://localhost:10050/upload'
  };

  handleUpload(data): void {
    if (data && data.response) {
      data = JSON.parse(data.response);
      this.uploadedFiles.push(data);
    }
  }
}
````

`component.html`
````html
<input type="file" 
       style="display:none;"
       [ng-file-select]="options"
       (onUpload)="handleUpload($event)"
       multiple>
</div>

<div>
Response: <br/>{{ uploadedFiles | json }}
</div>
````

### Progressbar example

`component.ts`
````typescript
import {Component, NgZone} from 'angular2/core';
import {UPLOAD_DIRECTIVES} from 'ng2-uploader';

@Component({
  selector: 'basic-progressbar',
  templateUrl: 'app/components/basic-progressbar/basic-progressbar.html',
  directives: [UPLOAD_DIRECTIVES],
})
export class BasicProgressbar {
  uploadFile: any;
  uploadProgress: number;
  uploadResponse: Object;
  zone: NgZone;
  options: Object = {
    url: 'http://localhost:10050/upload'
  };

  constructor() {
    this.uploadProgress = 0;
    this.uploadResponse = {};
    this.zone = new NgZone({ enableLongStackTrace: false });
  }

  handleUpload(data): void {
    this.uploadFile = data;
    this.zone.run(() => {
      this.uploadProgress = data.progress.percent;
    });
    let resp = data.response;
    if (resp) {
      resp = JSON.parse(resp);
      this.uploadResponse = resp;
    }
  }
}
````

`component.html`
````html
<div>
  <label for="file-pb" class="ui small black button right icon upload-button">
      <i class="ion-document icon"></i>
      Choose file
  </label>
  <input type="file" 
         id="file-pb"
         style="display:none;"
         [ng-file-select]="options"
         (onUpload)="handleUpload($event)">
</div>

<div *ngIf="uploadFile">
Progress: {{ uploadProgress }}%
</div>
<div *ngIf="uploadFile">
  <div class="ui indicating olive progress">
    <div class="bar" [style.width]="uploadProgress + '%'"></div>
    <div class="label">Uploading file ({{ uploadProgress }}%)</div>
  </div>
</div>

<div>
Response: <br/>{{ uploadFile | json }}
</div>
````

### Multiple files progressbars example

`component.ts`
````typescript
import {Component, NgZone} from 'angular2/core';
import {UPLOAD_DIRECTIVES} from 'ng2-uploader';

@Component({
  selector: 'multiple-progressbar',
  templateUrl: 'app/components/multiple-progressbar/multiple-progressbar.html',
  directives: [UPLOAD_DIRECTIVES]
})
export class MultipleProgressbar {
  uploadFiles: any[];
  uploadProgresses: any[] = [];
  zone: NgZone;
  options: Object = {
    url: 'http://localhost:10050/upload'
  };

  constructor() {
    this.zone = new NgZone({ enableLongStackTrace: false });
  }

  handleUpload(data): void {
    let id = data.id;
    let index = this.findIndex(id);
    if (index === -1) {
      this.uploadProgresses.push({id: id, percent: 0});
    }
    if (this.uploadProgresses[index]) {
      this.zone.run(() => {
        this.uploadProgresses[index].percent = data.progress.percent;
      });
    }
  }

  findIndex(id: string): number {
    return this.uploadProgresses.findIndex(x => x.id === id);
  }

}
````

`component.html`
````html
<div>
  <label for="files-pb" class="ui small black button right icon upload-button">
      <i class="ion-document-text icon"></i>
      Choose files
  </label>
  <input type="file" 
         id="files-pb"
         style="display:none;"
         [ng-file-select]="options"
         (onUpload)="handleUpload($event)"
         multiple>
</div>

<div class="ui divider"></div>

<div *ngFor="#progressObj of uploadProgresses">
  <div class="ui indicating olive progress">
    <div class="bar" [style.width]="progressObj.percent + '%'"></div>
    <div class="label">Uploading file ({{ progressObj.percent }}%)</div>
  </div>
</div>
````

### Demos

For more information, examples and usage examples please see [demos](http://ng2-uploader.jankuri.com)

#### LICENCE

MIT