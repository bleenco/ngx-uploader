import {Ng2Uploader} from './src/app/services/ng2-uploader/ng2-uploader';
import {NgFileSelect} from './src/app/directives/ng-file-select/ng-file-select';

export * from './src/app/services/ng2-uploader/ng2-uploader';
export * from './src/app/directives/ng-file-select/ng-file-select';

export default {
  directives: [NgFileSelect],
  providers: [Ng2Uploader]
}

export const UPLOAD_DIRECTIVES: [any] = [NgFileSelect];
