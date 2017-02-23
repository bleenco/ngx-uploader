export interface INgUploaderOptions {
  url: string;
  cors?: boolean;
  withCredentials?: boolean;
  multiple?: boolean;
  maxUploads?: number;
  data?: any;
  autoUpload?: boolean;
  multipart?: boolean;
  method?: string;
  customHeaders?: any;
  encodeHeaders?: boolean;
  filenameHeader?: string;
  authTokenPrefix?: string;
  authToken?: string;
  fieldName?: string;
  fieldReset?: boolean;
  previewUrl?: boolean;
  calculateSpeed?: boolean;
  filterExtensions?: boolean;
  allowedExtensions?: string[];
  maxSize?: number;
}

export class NgUploaderOptions implements INgUploaderOptions {
  url: string;
  cors?: boolean;
  withCredentials?: boolean;
  multiple?: boolean;
  maxUploads?: number;
  data?: any;
  autoUpload?: boolean;
  multipart?: boolean;
  method?: string;
  customHeaders?: any;
  encodeHeaders?: boolean;
  filenameHeader?: string;
  authTokenPrefix?: string;
  authToken?: string;
  fieldName?: string;
  fieldReset?: boolean;
  previewUrl?: boolean;
  calculateSpeed?: boolean;
  filterExtensions?: boolean;
  allowedExtensions?: string[];
  maxSize?: number;

  constructor(obj: INgUploaderOptions) {
    function use<T>(source: T, defaultValue: T): T {
      return obj && source !== undefined ? source : defaultValue;
    }

    this.url = use(obj.url, <string>'');
    this.cors = use(obj.cors, true);
    this.withCredentials = use(obj.withCredentials, false);
    this.multiple = use(obj.multiple, true);
    this.maxUploads = use(obj.maxUploads, 10);
    this.data = use(obj.data, {});
    this.autoUpload = use(obj.autoUpload, true);
    this.multipart = use(obj.multipart, true);
    this.method = use(obj.method, 'POST');
    this.customHeaders = use(obj.customHeaders, {});
    this.encodeHeaders = use(obj.encodeHeaders, false);
    this.filenameHeader = use(obj.filenameHeader, undefined);
    this.authTokenPrefix = use(obj.authTokenPrefix, 'Bearer');
    this.authToken = use(obj.authToken, undefined);
    this.fieldName = use(obj.fieldName, 'file');
    this.fieldReset = use(obj.fieldReset, true);
    this.previewUrl = use(obj.previewUrl, false);
    this.calculateSpeed = use(obj.calculateSpeed, true);
    this.filterExtensions = use(obj.filterExtensions, false);
    this.allowedExtensions = use(obj.allowedExtensions, []);
    this.maxSize = use(obj.maxSize, undefined);
  }

}
