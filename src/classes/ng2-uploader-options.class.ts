export interface INg2UploaderOptions {
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

export class Ng2UploaderOptions implements INg2UploaderOptions {
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

  constructor(obj: INg2UploaderOptions) {
    this.url = obj.url != null ? obj.url : '';
    this.cors = obj.cors != null ? obj.cors : true;
    this.withCredentials = obj.withCredentials != null ? obj.withCredentials : this.withCredentials;
    this.multiple = obj.multiple != null ? obj.multiple : true;
    this.maxUploads = obj.maxUploads != null ? obj.maxUploads : 10;
    this.data = obj.data != null ? obj.data : {};
    this.autoUpload = obj && obj.autoUpload ? obj.autoUpload : true;
    this.multipart = obj.multipart != null ? obj.multipart : false;
    this.method = obj.method != null ? obj.method : 'POST';
    this.customHeaders = obj.customHeaders != null ? obj.customHeaders : { };
    this.encodeHeaders = obj.encodeHeaders != null ? obj.encodeHeaders : false;
    this.authTokenPrefix = obj.authTokenPrefix != null ? obj.authTokenPrefix : 'Bearer';
    this.authToken = obj.authToken != null ? obj.authToken : null;
    this.fieldName = obj.fieldName != null ? obj.fieldName : 'file';
    this.fieldReset = obj.fieldReset != null ? obj.fieldReset : null;
    this.previewUrl = obj.previewUrl != null ? obj.previewUrl : null;
    this.calculateSpeed = obj.calculateSpeed != null ? obj.calculateSpeed : true;
    this.filterExtensions = obj.filterExtensions != null ? obj.filterExtensions : false;
    this.allowedExtensions = obj && obj.allowedExtensions ? obj.allowedExtensions : [];
  }
}
