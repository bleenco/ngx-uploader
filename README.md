# ngx-uploader

Angular File Uploader

https://ngx-uploader.jankuri.me

## Installation

Add `ngx-uploader` module as dependency to your project.

```console
npm install ngx-uploader --save
```

or using `yarn`:

```console
yarn add ngx-uploader
```

- [app.module.ts](https://github.com/bleenco/ngx-uploader/blob/master/src/app/app.module.ts) is a sample how to to include `ngx-uploader` into your project.
- [app.component.ts](https://raw.githubusercontent.com/bleenco/ngx-uploader/master/src/app/app.component.ts) defines example how to handle events in component or service.
- [app.component.html](https://raw.githubusercontent.com/bleenco/ngx-uploader/master/src/app/app.component.html) represents HTML template with usage examples of `ngFileDrop` and `ngFileSelect` directives.

## Running demo on local machine

### Building demo source code

```console
npm run build:prod
node dist/api/index.js
```

Then open your browser at `http://localhost:4900`.

### Running demo using Docker

```console
docker build -t ngx-uploader .
docker run -it --rm -p 4900:4900 ngx-uploader
```

Again, you are ready to open your browser at `http://localhost:4900`.

### LICENCE

MIT
