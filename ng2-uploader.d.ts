import { Ng2Uploader } from './src/services/ng2-uploader';
import { NgFileSelect } from './src/directives/ng-file-select';
import { NgFileDrop } from './src/directives/ng-file-drop';
export * from './src/services/ng2-uploader';
export * from './src/directives/ng-file-select';
export * from './src/directives/ng-file-drop';
declare var _default: {
    directives: (typeof NgFileSelect | typeof NgFileDrop)[];
    providers: typeof Ng2Uploader[];
};
export default _default;
export declare const UPLOAD_DIRECTIVES: [any];
