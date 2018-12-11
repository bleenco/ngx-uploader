/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
/**
 * @record
 */
export function UploaderOptions() { }
if (false) {
    /** @type {?} */
    UploaderOptions.prototype.concurrency;
    /** @type {?|undefined} */
    UploaderOptions.prototype.allowedContentTypes;
    /** @type {?|undefined} */
    UploaderOptions.prototype.maxUploads;
}
/**
 * @record
 */
export function BlobFile() { }
if (false) {
    /** @type {?} */
    BlobFile.prototype.name;
}
/** @enum {number} */
var UploadStatus = {
    Queue: 0,
    Uploading: 1,
    Done: 2,
    Cancelled: 3,
};
export { UploadStatus };
UploadStatus[UploadStatus.Queue] = 'Queue';
UploadStatus[UploadStatus.Uploading] = 'Uploading';
UploadStatus[UploadStatus.Done] = 'Done';
UploadStatus[UploadStatus.Cancelled] = 'Cancelled';
/**
 * @record
 */
export function UploadProgress() { }
if (false) {
    /** @type {?} */
    UploadProgress.prototype.status;
    /** @type {?|undefined} */
    UploadProgress.prototype.data;
}
/**
 * @record
 */
export function UploadFile() { }
if (false) {
    /** @type {?} */
    UploadFile.prototype.id;
    /** @type {?} */
    UploadFile.prototype.fileIndex;
    /** @type {?} */
    UploadFile.prototype.lastModifiedDate;
    /** @type {?} */
    UploadFile.prototype.name;
    /** @type {?} */
    UploadFile.prototype.size;
    /** @type {?} */
    UploadFile.prototype.type;
    /** @type {?} */
    UploadFile.prototype.form;
    /** @type {?} */
    UploadFile.prototype.progress;
    /** @type {?|undefined} */
    UploadFile.prototype.response;
    /** @type {?|undefined} */
    UploadFile.prototype.responseStatus;
    /** @type {?|undefined} */
    UploadFile.prototype.sub;
    /** @type {?|undefined} */
    UploadFile.prototype.nativeFile;
    /** @type {?|undefined} */
    UploadFile.prototype.responseHeaders;
}
/**
 * @record
 */
export function UploadOutput() { }
if (false) {
    /** @type {?} */
    UploadOutput.prototype.type;
    /** @type {?|undefined} */
    UploadOutput.prototype.file;
    /** @type {?|undefined} */
    UploadOutput.prototype.nativeFile;
}
/**
 * @record
 */
export function UploadInput() { }
if (false) {
    /** @type {?} */
    UploadInput.prototype.type;
    /** @type {?|undefined} */
    UploadInput.prototype.url;
    /** @type {?|undefined} */
    UploadInput.prototype.method;
    /** @type {?|undefined} */
    UploadInput.prototype.id;
    /** @type {?|undefined} */
    UploadInput.prototype.fieldName;
    /** @type {?|undefined} */
    UploadInput.prototype.fileIndex;
    /** @type {?|undefined} */
    UploadInput.prototype.file;
    /** @type {?|undefined} */
    UploadInput.prototype.data;
    /** @type {?|undefined} */
    UploadInput.prototype.headers;
    /** @type {?|undefined} */
    UploadInput.prototype.includeWebKitFormBoundary;
    /** @type {?|undefined} */
    UploadInput.prototype.withCredentials;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJmYWNlcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL25neC11cGxvYWRlci8iLCJzb3VyY2VzIjpbImxpYi9pbnRlcmZhY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFFQSxxQ0FJQzs7O0lBSEMsc0NBQW9COztJQUNwQiw4Q0FBK0I7O0lBQy9CLHFDQUFvQjs7Ozs7QUFHdEIsOEJBRUM7OztJQURDLHdCQUFhOzs7O0lBSWIsUUFBSztJQUNMLFlBQVM7SUFDVCxPQUFJO0lBQ0osWUFBUzs7Ozs7Ozs7OztBQUdYLG9DQVdDOzs7SUFWQyxnQ0FBcUI7O0lBQ3JCLDhCQVFFOzs7OztBQUdKLGdDQWNDOzs7SUFiQyx3QkFBVzs7SUFDWCwrQkFBa0I7O0lBQ2xCLHNDQUF1Qjs7SUFDdkIsMEJBQWE7O0lBQ2IsMEJBQWE7O0lBQ2IsMEJBQWE7O0lBQ2IsMEJBQWU7O0lBQ2YsOEJBQXlCOztJQUN6Qiw4QkFBZTs7SUFDZixvQ0FBd0I7O0lBQ3hCLHlCQUF5Qjs7SUFDekIsZ0NBQWtCOztJQUNsQixxQ0FBNEM7Ozs7O0FBRzlDLGtDQUtDOzs7SUFKQyw0QkFDaUU7O0lBQ2pFLDRCQUFrQjs7SUFDbEIsa0NBQWtCOzs7OztBQUdwQixpQ0FZQzs7O0lBWEMsMkJBQW1GOztJQUNuRiwwQkFBYTs7SUFDYiw2QkFBZ0I7O0lBQ2hCLHlCQUFZOztJQUNaLGdDQUFtQjs7SUFDbkIsZ0NBQW1COztJQUNuQiwyQkFBa0I7O0lBQ2xCLDJCQUF3Qzs7SUFDeEMsOEJBQW9DOztJQUNwQyxnREFBb0M7O0lBQ3BDLHNDQUEwQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBVcGxvYWRlck9wdGlvbnMge1xyXG4gIGNvbmN1cnJlbmN5OiBudW1iZXI7XHJcbiAgYWxsb3dlZENvbnRlbnRUeXBlcz86IHN0cmluZ1tdO1xyXG4gIG1heFVwbG9hZHM/OiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQmxvYkZpbGUgZXh0ZW5kcyBCbG9iIHtcclxuICBuYW1lOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIFVwbG9hZFN0YXR1cyB7XHJcbiAgUXVldWUsXHJcbiAgVXBsb2FkaW5nLFxyXG4gIERvbmUsXHJcbiAgQ2FuY2VsbGVkXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVXBsb2FkUHJvZ3Jlc3Mge1xyXG4gIHN0YXR1czogVXBsb2FkU3RhdHVzO1xyXG4gIGRhdGE/OiB7XHJcbiAgICBwZXJjZW50YWdlOiBudW1iZXI7XHJcbiAgICBzcGVlZDogbnVtYmVyO1xyXG4gICAgc3BlZWRIdW1hbjogc3RyaW5nO1xyXG4gICAgc3RhcnRUaW1lOiBudW1iZXIgfCBudWxsO1xyXG4gICAgZW5kVGltZTogbnVtYmVyIHwgbnVsbDtcclxuICAgIGV0YTogbnVtYmVyIHwgbnVsbDtcclxuICAgIGV0YUh1bWFuOiBzdHJpbmcgfCBudWxsO1xyXG4gIH07XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVXBsb2FkRmlsZSB7XHJcbiAgaWQ6IHN0cmluZztcclxuICBmaWxlSW5kZXg6IG51bWJlcjtcclxuICBsYXN0TW9kaWZpZWREYXRlOiBEYXRlO1xyXG4gIG5hbWU6IHN0cmluZztcclxuICBzaXplOiBudW1iZXI7XHJcbiAgdHlwZTogc3RyaW5nO1xyXG4gIGZvcm06IEZvcm1EYXRhO1xyXG4gIHByb2dyZXNzOiBVcGxvYWRQcm9ncmVzcztcclxuICByZXNwb25zZT86IGFueTtcclxuICByZXNwb25zZVN0YXR1cz86IG51bWJlcjtcclxuICBzdWI/OiBTdWJzY3JpcHRpb24gfCBhbnk7XHJcbiAgbmF0aXZlRmlsZT86IEZpbGU7XHJcbiAgcmVzcG9uc2VIZWFkZXJzPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBVcGxvYWRPdXRwdXQge1xyXG4gIHR5cGU6ICdhZGRlZFRvUXVldWUnIHwgJ2FsbEFkZGVkVG9RdWV1ZScgfCAndXBsb2FkaW5nJyB8ICdkb25lJyB8ICdzdGFydCcgfCAnY2FuY2VsbGVkJyB8ICdkcmFnT3ZlcidcclxuICAgICAgfCAnZHJhZ091dCcgfCAnZHJvcCcgfCAncmVtb3ZlZCcgfCAncmVtb3ZlZEFsbCcgfCAncmVqZWN0ZWQnO1xyXG4gIGZpbGU/OiBVcGxvYWRGaWxlO1xyXG4gIG5hdGl2ZUZpbGU/OiBGaWxlO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFVwbG9hZElucHV0IHtcclxuICB0eXBlOiAndXBsb2FkQWxsJyB8ICd1cGxvYWRGaWxlJyB8ICdjYW5jZWwnIHwgJ2NhbmNlbEFsbCcgfCAncmVtb3ZlJyB8ICdyZW1vdmVBbGwnO1xyXG4gIHVybD86IHN0cmluZztcclxuICBtZXRob2Q/OiBzdHJpbmc7XHJcbiAgaWQ/OiBzdHJpbmc7XHJcbiAgZmllbGROYW1lPzogc3RyaW5nO1xyXG4gIGZpbGVJbmRleD86IG51bWJlcjtcclxuICBmaWxlPzogVXBsb2FkRmlsZTtcclxuICBkYXRhPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBCbG9iIH07XHJcbiAgaGVhZGVycz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH07XHJcbiAgaW5jbHVkZVdlYktpdEZvcm1Cb3VuZGFyeT86IGJvb2xlYW47IC8vIElmIGZhbHNlLCBvbmx5IHRoZSBmaWxlIGlzIHNlbmQgdHJvdWdoIHhoci5zZW5kIChXZWJLaXRGb3JtQm91bmRhcnkgaXMgb21pdClcclxuICB3aXRoQ3JlZGVudGlhbHM/OiBib29sZWFuO1xyXG59XHJcbiJdfQ==