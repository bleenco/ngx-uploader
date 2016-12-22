export class UploadRejected {
  public static get EXTENSION_NOT_ALLOWED():string { return 'ExtensionNotAllowed'; }
  public static get MAX_SIZE_EXCEEDED():string { return 'MaxSizeExceeded'; }

  file: any;
  reason: string;
}
