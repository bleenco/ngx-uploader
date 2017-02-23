export class UploadRejected {
  public static get EXTENSION_NOT_ALLOWED(): string { return 'ExtensionNotAllowed'; }
  public static get MAX_SIZE_EXCEEDED(): string { return 'MaxSizeExceeded'; }
  public static get MAX_UPLOADS_EXCEEDED(): string { return 'MaxUploadsExceeded'; }

  file: any;
  reason: string;
}
