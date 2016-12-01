# ng2-uploader

For demos please see [demos page](http://ng2-uploader.com).

## Angular2 File Uploader

### Installation

```
npm install ng2-uploader --save
```

### Available parameters

|Parameter   	| Example Value
|---	       |---	|
| url   	    | http://api.ng2-uploader.com:10050  	|
| filterExtensions | true/false |
| allowedExtensions | ['image/png', 'image/jpg'] or ['jpg', 'png'] |
| calculateSpeed | true/false |
| data          | { userId: 12, isAdmin: true } |
| customHeaders  | { 'custom-header': 'value' } |
| fieldName      | 'user[avatar]'
| fieldReset     | true/false
| authToken      | 012313asdadklj123123 |
| authTokenPrefix | 'Bearer' (default) |

**All parameters except `url` are optional.**


#### Examples

1. [Basic Example](https://github.com/jkuri/ng2-uploader#basic-example)
2. [Advanced Example](https://github.com/jkuri/ng2-uploader#advanced-example)

#### Backend Examples

1. [NodeJS using HapiJS](https://github.com/jkuri/ng2-uploader#backend-example-using-hapijs)
2. [NodeJS using express](https://github.com/jkuri/ng2-uploader#backend-example-using-express)
3. [PHP (Plain)](https://github.com/jkuri/ng2-uploader#backend-example-using-plain-php)

### Basic Example

````ts
// app.module.ts
import { Ng2UploaderModule } from 'ng2-uploader';
...
@NgModule({
  ...
  imports: [
    Ng2UploaderModule
  ],
  ...
})
// app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'demo-app',
  templateUrl: 'app/demo.html'
})
export class DemoApp {
  uploadFile: any;
  hasBaseDropZoneOver: boolean = false;
  options: Object = {
    url: 'http://localhost:10050/upload'
  };
  sizeLimit = 2000000;

  handleUpload(data): void {
    if (data && data.response) {
      data = JSON.parse(data.response);
      this.uploadFile = data;
    }
  }

  fileOverBase(e:any):void {
    this.hasBaseDropZoneOver = e;
  }

  beforeUpload(uploadingFile): void {
    if (uploadingFile.size > this.sizeLimit) {
      uploadingFile.setAbort();
      alert('File is too large');
    }
  }
}
````

````html
<!-- app.component.html -->
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
     (onFileOver)="fileOverBase($event)"
     (beforeUpload)="beforeUpload($event)">
</div>

<div>
Response: {{ uploadFile | json }}
</div>
````

### Advanced Example

This example show how to use available options and progress.

```ts
import { Component, OnInit, NgZone } from '@angular/core';

@Component({
  selector: 'app-component',
  templateUrl: 'app.component.html'
})
export class AppDemoComponent implements OnInit {
  private zone: NgZone;
  private options: Object;
  private progress: number = 0;
  private response: any = {};

  ngOnInit() {
    this.zone = new NgZone({ enableLongStackTrace: false });
    this.options = {
      url: 'http://api.ng2-uploader.com:10050/upload',
      filterExtensions: true,
      allowedExtensions: ['image/png', 'image/jpg'],
      calculateSpeed: true,
      data: {
        userId: 12,
        isAdmin: true
      },
      customHeaders: {
        'custom-header': 'value'
      },
      authToken: 'asd123b123zxc08234cxcv',
      authTokenPrefix: 'Bearer'
    };
  }

  handleUpload(data: any): void {
    this.zone.run(() => {
      this.response = data;
      this.progress = Math.floor(data.progress.percent / 100);
    });
  }
}
```


### Backend Example Using HapiJS

````javascript
'use strict';

const Hapi        = require('hapi');
const Inert       = require('inert');
const Md5         = require('md5');
const Multiparty  = require('multiparty');
const fs          = require('fs');
const path        = require('path');
const server      = new Hapi.Server();

server.connection({ port: 10050, routes: { cors: true } });
server.register(Inert, (err) => {});

const upload = {
  payload: {
    maxBytes: 209715200,
    output: 'stream',
    parse: false
  },
  handler: (request, reply) => {
    const form = new Multiparty.Form();
    form.parse(request.payload, (err, fields, files) => {
      if (err) {
        return reply({status: false, msg: err});
      }

      let responseData = [];

      files.file.forEach((file) => {
        let fileData = fs.readFileSync(file.path);
        const originalName = file.originalFilename;
        const generatedName = Md5(new Date().toString() +
          originalName) + path.extname(originalName);
        const filePath = path.resolve(__dirname, 'uploads',
          generatedName);

        fs.writeFileSync(filePath, fileData);
        const data = {
          originalName: originalName,
          generatedName: generatedName
        };

        responseData.push(data);
      });

      reply({status: true, data: responseData});
    });
  }
};

const uploads = {
  handler: {
    directory: {
      path: path.resolve(__dirname, 'uploads')
    }
  }
};

server.route([
  { method: 'POST', path: '/upload',          config: upload  },
  { method: 'GET',  path: '/uploads/{path*}', config: uploads }
]);

server.start(() => {
  console.log('Upload server running at', server.info.uri);
});
````

### Backend example using express

````js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());

const upload = multer({
  dest: 'uploads/',
  storage: multer.diskStorage({
    filename: (req, file, cb) => {
      let ext = path.extname(file.originalname);
      cb(null, `${Math.random().toString(36).substring(7)}${ext}`);
    }
  })
});

app.post('/upload', upload.any(), (req, res) => {
  res.json(req.files.map(file => {
    let ext = path.extname(file.originalname);
    return {
      originalName: file.originalname,
      filename: file.filename
    }
  }));
});

app.listen(10050, () => {
  console.log('ng2-uploader server running on port 10050.');
});
````

### Backend example using plain PHP

````php
<?php

header("Access-Control-Allow-Origin: *");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  echo json_encode(array('status' => false));
  exit;
}

$path = 'uploads/';

if (isset($_FILES['file'])) {
  $originalName = $_FILES['file']['name'];
  $ext = '.'.pathinfo($originalName, PATHINFO_EXTENSION);
  $generatedName = md5($_FILES['file']['tmp_name']).$ext;
  $filePath = $path.$generatedName;

  if (!is_writable($path)) {
    echo json_encode(array(
      'status' => false,
      'msg'    => 'Destination directory not writable.'
    ));
    exit;
  }

  if (move_uploaded_file($_FILES['file']['tmp_name'], $filePath)) {
    echo json_encode(array(
      'status'        => true,
      'originalName'  => $originalName,
      'generatedName' => $generatedName
    ));
  }
}
else {
  echo json_encode(
    array('status' => false, 'msg' => 'No file uploaded.')
  );
  exit;
}

?>
````

### Demos

For more information, examples and usage examples please see [demos](http://ng2-uploader.com)

#### LICENCE

MIT
