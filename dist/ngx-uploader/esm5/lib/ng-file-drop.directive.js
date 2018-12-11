/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
import { Directive, ElementRef, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { NgUploaderService } from './ngx-uploader.class';
var NgFileDropDirective = /** @class */ (function () {
    function NgFileDropDirective(elementRef) {
        this.elementRef = elementRef;
        this.stopEvent = function (e) {
            e.stopPropagation();
            e.preventDefault();
        };
        this.uploadOutput = new EventEmitter();
    }
    /**
     * @return {?}
     */
    NgFileDropDirective.prototype.ngOnInit = /**
     * @return {?}
     */
    function () {
        var _this = this;
        this._sub = [];
        /** @type {?} */
        var concurrency = this.options && this.options.concurrency || Number.POSITIVE_INFINITY;
        /** @type {?} */
        var allowedContentTypes = this.options && this.options.allowedContentTypes || ['*'];
        /** @type {?} */
        var maxUploads = this.options && this.options.maxUploads || Number.POSITIVE_INFINITY;
        this.upload = new NgUploaderService(concurrency, allowedContentTypes, maxUploads);
        this.el = this.elementRef.nativeElement;
        this._sub.push(this.upload.serviceEvents.subscribe(function (event) {
            _this.uploadOutput.emit(event);
        }));
        if (this.uploadInput instanceof EventEmitter) {
            this._sub.push(this.upload.initInputEvents(this.uploadInput));
        }
        this.el.addEventListener('drop', this.stopEvent, false);
        this.el.addEventListener('dragenter', this.stopEvent, false);
        this.el.addEventListener('dragover', this.stopEvent, false);
    };
    /**
     * @return {?}
     */
    NgFileDropDirective.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        this._sub.forEach(function (sub) { return sub.unsubscribe(); });
    };
    /**
     * @param {?} e
     * @return {?}
     */
    NgFileDropDirective.prototype.onDrop = /**
     * @param {?} e
     * @return {?}
     */
    function (e) {
        e.stopPropagation();
        e.preventDefault();
        /** @type {?} */
        var event = { type: 'drop' };
        this.uploadOutput.emit(event);
        this.upload.handleFiles(e.dataTransfer.files);
    };
    /**
     * @param {?} e
     * @return {?}
     */
    NgFileDropDirective.prototype.onDragOver = /**
     * @param {?} e
     * @return {?}
     */
    function (e) {
        if (!e) {
            return;
        }
        /** @type {?} */
        var event = { type: 'dragOver' };
        this.uploadOutput.emit(event);
    };
    /**
     * @param {?} e
     * @return {?}
     */
    NgFileDropDirective.prototype.onDragLeave = /**
     * @param {?} e
     * @return {?}
     */
    function (e) {
        if (!e) {
            return;
        }
        /** @type {?} */
        var event = { type: 'dragOut' };
        this.uploadOutput.emit(event);
    };
    NgFileDropDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[ngFileDrop]'
                },] },
    ];
    NgFileDropDirective.ctorParameters = function () { return [
        { type: ElementRef }
    ]; };
    NgFileDropDirective.propDecorators = {
        options: [{ type: Input }],
        uploadInput: [{ type: Input }],
        uploadOutput: [{ type: Output }],
        onDrop: [{ type: HostListener, args: ['drop', ['$event'],] }],
        onDragOver: [{ type: HostListener, args: ['dragover', ['$event'],] }],
        onDragLeave: [{ type: HostListener, args: ['dragleave', ['$event'],] }]
    };
    return NgFileDropDirective;
}());
export { NgFileDropDirective };
if (false) {
    /** @type {?} */
    NgFileDropDirective.prototype.options;
    /** @type {?} */
    NgFileDropDirective.prototype.uploadInput;
    /** @type {?} */
    NgFileDropDirective.prototype.uploadOutput;
    /** @type {?} */
    NgFileDropDirective.prototype.upload;
    /** @type {?} */
    NgFileDropDirective.prototype.el;
    /** @type {?} */
    NgFileDropDirective.prototype._sub;
    /** @type {?} */
    NgFileDropDirective.prototype.stopEvent;
    /** @type {?} */
    NgFileDropDirective.prototype.elementRef;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctZmlsZS1kcm9wLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL25neC11cGxvYWRlci8iLCJzb3VyY2VzIjpbImxpYi9uZy1maWxlLWRyb3AuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBcUIsWUFBWSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXBILE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBR3pEO0lBYUUsNkJBQW1CLFVBQXNCO1FBQXRCLGVBQVUsR0FBVixVQUFVLENBQVk7UUFnQ3pDLGNBQVMsR0FBRyxVQUFDLENBQVE7WUFDbkIsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3BCLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNyQixDQUFDLENBQUE7UUFsQ0MsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLFlBQVksRUFBZ0IsQ0FBQztJQUN2RCxDQUFDOzs7O0lBRUQsc0NBQVE7OztJQUFSO1FBQUEsaUJBc0JDO1FBckJDLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDOztZQUNULFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQyxpQkFBaUI7O1lBQ2xGLG1CQUFtQixHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsSUFBSSxDQUFDLEdBQUcsQ0FBQzs7WUFDL0UsVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUksTUFBTSxDQUFDLGlCQUFpQjtRQUN0RixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksaUJBQWlCLENBQUMsV0FBVyxFQUFFLG1CQUFtQixFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRWxGLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUM7UUFFeEMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQ1osSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLFVBQUMsS0FBbUI7WUFDdEQsS0FBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDaEMsQ0FBQyxDQUFDLENBQ0gsQ0FBQztRQUVGLElBQUksSUFBSSxDQUFDLFdBQVcsWUFBWSxZQUFZLEVBQUU7WUFDNUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7U0FDL0Q7UUFFRCxJQUFJLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hELElBQUksQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM5RCxDQUFDOzs7O0lBRUQseUNBQVc7OztJQUFYO1FBQ0UsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQWpCLENBQWlCLENBQUMsQ0FBQztJQUM5QyxDQUFDOzs7OztJQVFNLG9DQUFNOzs7O0lBRGIsVUFDYyxDQUFNO1FBQ2xCLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUNwQixDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7O1lBRWIsS0FBSyxHQUFpQixFQUFFLElBQUksRUFBRSxNQUFNLEVBQUU7UUFDNUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoRCxDQUFDOzs7OztJQUdNLHdDQUFVOzs7O0lBRGpCLFVBQ2tCLENBQVE7UUFDeEIsSUFBSSxDQUFDLENBQUMsRUFBRTtZQUNOLE9BQU87U0FDUjs7WUFFSyxLQUFLLEdBQWlCLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRTtRQUNoRCxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoQyxDQUFDOzs7OztJQUdNLHlDQUFXOzs7O0lBRGxCLFVBQ21CLENBQVE7UUFDekIsSUFBSSxDQUFDLENBQUMsRUFBRTtZQUNOLE9BQU87U0FDUjs7WUFFSyxLQUFLLEdBQWlCLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRTtRQUMvQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoQyxDQUFDOztnQkE5RUYsU0FBUyxTQUFDO29CQUNULFFBQVEsRUFBRSxjQUFjO2lCQUN6Qjs7O2dCQVBtQixVQUFVOzs7MEJBUzNCLEtBQUs7OEJBQ0wsS0FBSzsrQkFDTCxNQUFNO3lCQTRDTixZQUFZLFNBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDOzZCQVUvQixZQUFZLFNBQUMsVUFBVSxFQUFFLENBQUMsUUFBUSxDQUFDOzhCQVVuQyxZQUFZLFNBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxDQUFDOztJQVN2QywwQkFBQztDQUFBLEFBL0VELElBK0VDO1NBNUVZLG1CQUFtQjs7O0lBQzlCLHNDQUFrQzs7SUFDbEMsMENBQWdEOztJQUNoRCwyQ0FBbUQ7O0lBRW5ELHFDQUEwQjs7SUFDMUIsaUNBQXFCOztJQUVyQixtQ0FBcUI7O0lBa0NyQix3Q0FHQzs7SUFuQ1cseUNBQTZCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBFbGVtZW50UmVmLCBFdmVudEVtaXR0ZXIsIElucHV0LCBPdXRwdXQsIE9uSW5pdCwgT25EZXN0cm95LCBIb3N0TGlzdGVuZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgVXBsb2FkT3V0cHV0LCBVcGxvYWRJbnB1dCwgVXBsb2FkZXJPcHRpb25zIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcclxuaW1wb3J0IHsgTmdVcGxvYWRlclNlcnZpY2UgfSBmcm9tICcuL25neC11cGxvYWRlci5jbGFzcyc7XHJcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xyXG5cclxuQERpcmVjdGl2ZSh7XHJcbiAgc2VsZWN0b3I6ICdbbmdGaWxlRHJvcF0nXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBOZ0ZpbGVEcm9wRGlyZWN0aXZlIGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xyXG4gIEBJbnB1dCgpIG9wdGlvbnM6IFVwbG9hZGVyT3B0aW9ucztcclxuICBASW5wdXQoKSB1cGxvYWRJbnB1dDogRXZlbnRFbWl0dGVyPFVwbG9hZElucHV0PjtcclxuICBAT3V0cHV0KCkgdXBsb2FkT3V0cHV0OiBFdmVudEVtaXR0ZXI8VXBsb2FkT3V0cHV0PjtcclxuXHJcbiAgdXBsb2FkOiBOZ1VwbG9hZGVyU2VydmljZTtcclxuICBlbDogSFRNTElucHV0RWxlbWVudDtcclxuXHJcbiAgX3N1YjogU3Vic2NyaXB0aW9uW107XHJcblxyXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlbGVtZW50UmVmOiBFbGVtZW50UmVmKSB7XHJcbiAgICB0aGlzLnVwbG9hZE91dHB1dCA9IG5ldyBFdmVudEVtaXR0ZXI8VXBsb2FkT3V0cHV0PigpO1xyXG4gIH1cclxuXHJcbiAgbmdPbkluaXQoKSB7XHJcbiAgICB0aGlzLl9zdWIgPSBbXTtcclxuICAgIGNvbnN0IGNvbmN1cnJlbmN5ID0gdGhpcy5vcHRpb25zICYmIHRoaXMub3B0aW9ucy5jb25jdXJyZW5jeSB8fCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XHJcbiAgICBjb25zdCBhbGxvd2VkQ29udGVudFR5cGVzID0gdGhpcy5vcHRpb25zICYmIHRoaXMub3B0aW9ucy5hbGxvd2VkQ29udGVudFR5cGVzIHx8IFsnKiddO1xyXG4gICAgY29uc3QgbWF4VXBsb2FkcyA9IHRoaXMub3B0aW9ucyAmJiB0aGlzLm9wdGlvbnMubWF4VXBsb2FkcyB8fCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XHJcbiAgICB0aGlzLnVwbG9hZCA9IG5ldyBOZ1VwbG9hZGVyU2VydmljZShjb25jdXJyZW5jeSwgYWxsb3dlZENvbnRlbnRUeXBlcywgbWF4VXBsb2Fkcyk7XHJcblxyXG4gICAgdGhpcy5lbCA9IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xyXG5cclxuICAgIHRoaXMuX3N1Yi5wdXNoKFxyXG4gICAgICB0aGlzLnVwbG9hZC5zZXJ2aWNlRXZlbnRzLnN1YnNjcmliZSgoZXZlbnQ6IFVwbG9hZE91dHB1dCkgPT4ge1xyXG4gICAgICAgIHRoaXMudXBsb2FkT3V0cHV0LmVtaXQoZXZlbnQpO1xyXG4gICAgICB9KVxyXG4gICAgKTtcclxuXHJcbiAgICBpZiAodGhpcy51cGxvYWRJbnB1dCBpbnN0YW5jZW9mIEV2ZW50RW1pdHRlcikge1xyXG4gICAgICB0aGlzLl9zdWIucHVzaCh0aGlzLnVwbG9hZC5pbml0SW5wdXRFdmVudHModGhpcy51cGxvYWRJbnB1dCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuc3RvcEV2ZW50LCBmYWxzZSk7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdlbnRlcicsIHRoaXMuc3RvcEV2ZW50LCBmYWxzZSk7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgdGhpcy5zdG9wRXZlbnQsIGZhbHNlKTtcclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCkge1xyXG4gICAgdGhpcy5fc3ViLmZvckVhY2goc3ViID0+IHN1Yi51bnN1YnNjcmliZSgpKTtcclxuICB9XHJcblxyXG4gIHN0b3BFdmVudCA9IChlOiBFdmVudCkgPT4ge1xyXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICB9XHJcblxyXG4gIEBIb3N0TGlzdGVuZXIoJ2Ryb3AnLCBbJyRldmVudCddKVxyXG4gIHB1YmxpYyBvbkRyb3AoZTogYW55KSB7XHJcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgIGNvbnN0IGV2ZW50OiBVcGxvYWRPdXRwdXQgPSB7IHR5cGU6ICdkcm9wJyB9O1xyXG4gICAgdGhpcy51cGxvYWRPdXRwdXQuZW1pdChldmVudCk7XHJcbiAgICB0aGlzLnVwbG9hZC5oYW5kbGVGaWxlcyhlLmRhdGFUcmFuc2Zlci5maWxlcyk7XHJcbiAgfVxyXG5cclxuICBASG9zdExpc3RlbmVyKCdkcmFnb3ZlcicsIFsnJGV2ZW50J10pXHJcbiAgcHVibGljIG9uRHJhZ092ZXIoZTogRXZlbnQpIHtcclxuICAgIGlmICghZSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZXZlbnQ6IFVwbG9hZE91dHB1dCA9IHsgdHlwZTogJ2RyYWdPdmVyJyB9O1xyXG4gICAgdGhpcy51cGxvYWRPdXRwdXQuZW1pdChldmVudCk7XHJcbiAgfVxyXG5cclxuICBASG9zdExpc3RlbmVyKCdkcmFnbGVhdmUnLCBbJyRldmVudCddKVxyXG4gIHB1YmxpYyBvbkRyYWdMZWF2ZShlOiBFdmVudCkge1xyXG4gICAgaWYgKCFlKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBldmVudDogVXBsb2FkT3V0cHV0ID0geyB0eXBlOiAnZHJhZ091dCcgfTtcclxuICAgIHRoaXMudXBsb2FkT3V0cHV0LmVtaXQoZXZlbnQpO1xyXG4gIH1cclxufVxyXG4iXX0=