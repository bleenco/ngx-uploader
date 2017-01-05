export interface INgUploaderOptions {
  url: string;
  cors?: boolean;
  withCredentials?: boolean;
  multiple?: boolean;
  maxUploads?: number;
  data?: any;
  autoUpload?: boolean;
  multipart?: any;
  method?: 'POST' | 'GET';
  customHeaders?: any;
  encodeHeaders?: boolean;
  authTokenPrefix?: string;
  authToken?: string;
  fieldName?: string;
  fieldReset?: boolean;
  previewUrl?: string;
  calculateSpeed?: boolean;
  filterExtensions?: boolean;
  allowedExtensions?: string[];
}

export class NgUploaderOptions implements INgUploaderOptions {
  url: string;
  cors: boolean;
  withCredentials: boolean;
  multiple: boolean;
  maxUploads?: number;
  data?: any;
  autoUpload: boolean;
  multipart?: any;
  method: 'POST' | 'GET';
  customHeaders: any;
  encodeHeaders: boolean;
  authTokenPrefix: string;
  authToken?: string;
  fieldName: string;
  fieldReset: boolean;
  previewUrl?: string;
  calculateSpeed: boolean;
  filterExtensions: boolean;
  allowedExtensions: string[];

  constructor(obj: INgUploaderOptions) {
    this.url = obj && obj.url ? obj.url : '';
    this.cors = obj && obj.cors ? obj.cors : true;
    this.withCredentials = obj && obj.withCredentials ? obj.withCredentials : this.withCredentials;
    this.multiple = obj && obj.multiple ? obj.multiple : true;
    this.maxUploads = obj && obj.maxUploads ? obj.maxUploads : 10;
    this.data = obj && obj.data ? obj.data : {};
    this.autoUpload = obj && obj.autoUpload ? obj.autoUpload : true;
    this.multipart = obj && obj.multipart ? obj.multipart : false;
    this.method = obj && obj.method ? obj.method : 'POST';
    this.customHeaders = obj && obj.customHeaders ? obj.customHeaders : {};
    this.encodeHeaders = obj && obj.encodeHeaders ? obj.encodeHeaders : false;
    this.authTokenPrefix = obj && obj.authTokenPrefix ? obj.authTokenPrefix : 'Bearer';
    this.authToken = obj && obj.authToken ? obj.authToken : undefined;
    this.fieldName = obj && obj.fieldName ? obj.fieldName : 'file';
    this.fieldReset = obj && obj.fieldReset ? obj.fieldReset : false;
    this.previewUrl = obj && obj.previewUrl ? obj.previewUrl : undefined;
    this.calculateSpeed = obj && obj.calculateSpeed ? obj.calculateSpeed : true;
    this.filterExtensions = obj && obj.filterExtensions ? obj.filterExtensions : false;
    this.allowedExtensions = obj && obj.allowedExtensions ? obj.allowedExtensions : [];
  }
}
