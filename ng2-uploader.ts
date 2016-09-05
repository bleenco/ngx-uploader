import { NgFileSelectDirective } from './src/directives/ng-file-select';
import { NgFileDropDirective } from './src/directives/ng-file-drop';

export * from './src/services/ng2-uploader';
export * from './src/directives/ng-file-select';
export * from './src/directives/ng-file-drop';

export const UPLOAD_DIRECTIVES: any[] = [
  NgFileDropDirective,
  NgFileSelectDirective
];
