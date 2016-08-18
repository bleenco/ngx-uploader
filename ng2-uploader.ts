import {Ng2Uploader} from './src/services/ng2-uploader';
import {NgFileSelect} from './src/directives/ng-file-select';
import {NgFileDrop} from './src/directives/ng-file-drop';

export * from './src/services/ng2-uploader';
export * from './src/directives/ng-file-select';
export * from './src/directives/ng-file-drop';

export default {
  directives: [NgFileSelect, NgFileDrop],
  providers: [Ng2Uploader]
};

export const UPLOAD_DIRECTIVES: [any] = [NgFileSelect, NgFileDrop];
