export interface INgUploaderOptions {
  url: string;
  cors?: boolean;
  withCredentials?: boolean;
  multiple?: boolean;
  maxUploads?: number;
  data?: any;
  autoUpload?: boolean;
  multipart?: any;
  method?: string;
  customHeaders?: any;
  encodeHeaders?: boolean;
  authTokenPrefix?: string;
  authToken?: string;
  fieldName?: string;
  fieldReset?: boolean;
  previewUrl?: boolean;
  calculateSpeed?: boolean;
  filterExtensions?: boolean;
  allowedExtensions?: string[];
}

export class NgUploaderOptions implements INgUploaderOptions {
  url: string;
  cors?: boolean;
  withCredentials?: boolean;
  multiple?: boolean;
  maxUploads?: number;
  data?: any;
  autoUpload?: boolean;
  multipart?: any;
  method?: string;
  customHeaders?: any;
  encodeHeaders?: boolean;
  authTokenPrefix?: string;
  authToken?: string;
  fieldName?: string;
  fieldReset?: boolean;
  previewUrl?: boolean;
  calculateSpeed?: boolean;
  filterExtensions?: boolean;
  allowedExtensions?: string[];

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
    this.multipart = use(obj.multipart, false);
    this.method = use(obj.method, 'POST');
    this.customHeaders = use(obj.customHeaders, {});
    this.encodeHeaders = use(obj.encodeHeaders, false);
    this.authTokenPrefix = use(obj.authTokenPrefix, 'Bearer');
    this.authToken = use(obj.authToken, undefined);
    this.fieldName = use(obj.fieldName, 'file');
    this.fieldReset = use(obj.fieldReset, false);
    this.previewUrl = use(obj.previewUrl, false);
    this.calculateSpeed = use(obj.calculateSpeed, true);
    this.filterExtensions = use(obj.filterExtensions, false);
    this.allowedExtensions = use(obj.allowedExtensions, []);
  }

}
