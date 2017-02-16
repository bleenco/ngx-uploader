import { NgFileDropDirective } from './src/directives/ng-file-drop';
import { NgFileSelectDirective } from './src/directives/ng-file-select';

export * from './src/directives/ng-file-drop';
export * from './src/directives/ng-file-select';
export * from './src/services/ngx-uploader';

export { NgUploaderOptions, UploadedFile, UploadRejected } from './src/classes/index';

export { NgUploaderModule } from './src/module/ngx-uploader.module';

export const UPLOAD_DIRECTIVES: any[] = [
  NgFileSelectDirective,
  NgFileDropDirective
];
