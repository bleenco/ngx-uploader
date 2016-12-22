import { NgFileDropDirective } from './src/directives/ng-file-drop';
import { NgFileSelectDirective } from './src/directives/ng-file-select';

export * from './src/directives/ng-file-drop';
export * from './src/directives/ng-file-select';
export * from './src/services/ng2-uploader';

export { Ng2UploaderOptions, UploadedFile, UploadRejected } from './src/classes';

export { Ng2UploaderModule } from './src/module/ng2-uploader.module';

export const UPLOAD_DIRECTIVES: any[] = [
  NgFileSelectDirective,
  NgFileDropDirective
];
