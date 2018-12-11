/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
import { Directive, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { NgUploaderService } from './ngx-uploader.class';
export class NgFileSelectDirective {
    /**
     * @param {?} elementRef
     */
    constructor(elementRef) {
        this.elementRef = elementRef;
        this.fileListener = () => {
            if (this.el.files) {
                this.upload.handleFiles(this.el.files);
            }
        };
        this.uploadOutput = new EventEmitter();
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        this._sub = [];
        /** @type {?} */
        const concurrency = this.options && this.options.concurrency || Number.POSITIVE_INFINITY;
        /** @type {?} */
        const allowedContentTypes = this.options && this.options.allowedContentTypes || ['*'];
        /** @type {?} */
        const maxUploads = this.options && this.options.maxUploads || Number.POSITIVE_INFINITY;
        this.upload = new NgUploaderService(concurrency, allowedContentTypes, maxUploads);
        this.el = this.elementRef.nativeElement;
        this.el.addEventListener('change', this.fileListener, false);
        this._sub.push(this.upload.serviceEvents.subscribe((event) => {
            this.uploadOutput.emit(event);
        }));
        if (this.uploadInput instanceof EventEmitter) {
            this._sub.push(this.upload.initInputEvents(this.uploadInput));
        }
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        if (this.el) {
            this.el.removeEventListener('change', this.fileListener, false);
            this._sub.forEach(sub => sub.unsubscribe());
        }
    }
}
NgFileSelectDirective.decorators = [
    { type: Directive, args: [{
                selector: '[ngFileSelect]'
            },] },
];
NgFileSelectDirective.ctorParameters = () => [
    { type: ElementRef }
];
NgFileSelectDirective.propDecorators = {
    options: [{ type: Input }],
    uploadInput: [{ type: Input }],
    uploadOutput: [{ type: Output }]
};
if (false) {
    /** @type {?} */
    NgFileSelectDirective.prototype.options;
    /** @type {?} */
    NgFileSelectDirective.prototype.uploadInput;
    /** @type {?} */
    NgFileSelectDirective.prototype.uploadOutput;
    /** @type {?} */
    NgFileSelectDirective.prototype.upload;
    /** @type {?} */
    NgFileSelectDirective.prototype.el;
    /** @type {?} */
    NgFileSelectDirective.prototype._sub;
    /** @type {?} */
    NgFileSelectDirective.prototype.fileListener;
    /** @type {?} */
    NgFileSelectDirective.prototype.elementRef;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctZmlsZS1zZWxlY3QuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmd4LXVwbG9hZGVyLyIsInNvdXJjZXMiOlsibGliL25nLWZpbGUtc2VsZWN0LmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQXFCLE1BQU0sZUFBZSxDQUFDO0FBRXRHLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBTXpELE1BQU07Ozs7SUFVSixZQUFtQixVQUFzQjtRQUF0QixlQUFVLEdBQVYsVUFBVSxDQUFZO1FBZ0N6QyxpQkFBWSxHQUFHLEdBQUcsRUFBRTtZQUNsQixJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFO2dCQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3hDO1FBQ0gsQ0FBQyxDQUFBO1FBbkNDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxZQUFZLEVBQWdCLENBQUM7SUFDdkQsQ0FBQzs7OztJQUVELFFBQVE7UUFDTixJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQzs7Y0FDVCxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUMsaUJBQWlCOztjQUNsRixtQkFBbUIsR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLElBQUksQ0FBQyxHQUFHLENBQUM7O2NBQy9FLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxJQUFJLE1BQU0sQ0FBQyxpQkFBaUI7UUFDdEYsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxtQkFBbUIsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUVsRixJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFN0QsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQ1osSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBbUIsRUFBRSxFQUFFO1lBQzFELElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hDLENBQUMsQ0FBQyxDQUNILENBQUM7UUFFRixJQUFJLElBQUksQ0FBQyxXQUFXLFlBQVksWUFBWSxFQUFFO1lBQzVDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1NBQy9EO0lBQ0gsQ0FBQzs7OztJQUVELFdBQVc7UUFDVCxJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUM7WUFDVixJQUFJLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2hFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7U0FDN0M7SUFDSCxDQUFDOzs7WUEzQ0YsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxnQkFBZ0I7YUFDM0I7OztZQVBtQixVQUFVOzs7c0JBUzNCLEtBQUs7MEJBQ0wsS0FBSzsyQkFDTCxNQUFNOzs7O0lBRlAsd0NBQWtDOztJQUNsQyw0Q0FBd0M7O0lBQ3hDLDZDQUFtRDs7SUFFbkQsdUNBQTBCOztJQUMxQixtQ0FBcUI7O0lBRXJCLHFDQUFxQjs7SUFrQ3JCLDZDQUlDOztJQXBDVywyQ0FBNkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIEV2ZW50RW1pdHRlciwgSW5wdXQsIE91dHB1dCwgT25Jbml0LCBPbkRlc3Ryb3kgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgVXBsb2FkT3V0cHV0LCBVcGxvYWRlck9wdGlvbnMgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xyXG5pbXBvcnQgeyBOZ1VwbG9hZGVyU2VydmljZSB9IGZyb20gJy4vbmd4LXVwbG9hZGVyLmNsYXNzJztcclxuaW1wb3J0IHsgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XHJcblxyXG5ARGlyZWN0aXZlKHtcclxuICBzZWxlY3RvcjogJ1tuZ0ZpbGVTZWxlY3RdJ1xyXG59KVxyXG5leHBvcnQgY2xhc3MgTmdGaWxlU2VsZWN0RGlyZWN0aXZlIGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xyXG4gIEBJbnB1dCgpIG9wdGlvbnM6IFVwbG9hZGVyT3B0aW9ucztcclxuICBASW5wdXQoKSB1cGxvYWRJbnB1dDogRXZlbnRFbWl0dGVyPGFueT47XHJcbiAgQE91dHB1dCgpIHVwbG9hZE91dHB1dDogRXZlbnRFbWl0dGVyPFVwbG9hZE91dHB1dD47XHJcblxyXG4gIHVwbG9hZDogTmdVcGxvYWRlclNlcnZpY2U7XHJcbiAgZWw6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcblxyXG4gIF9zdWI6IFN1YnNjcmlwdGlvbltdO1xyXG5cclxuICBjb25zdHJ1Y3RvcihwdWJsaWMgZWxlbWVudFJlZjogRWxlbWVudFJlZikge1xyXG4gICAgdGhpcy51cGxvYWRPdXRwdXQgPSBuZXcgRXZlbnRFbWl0dGVyPFVwbG9hZE91dHB1dD4oKTtcclxuICB9XHJcblxyXG4gIG5nT25Jbml0KCkge1xyXG4gICAgdGhpcy5fc3ViID0gW107XHJcbiAgICBjb25zdCBjb25jdXJyZW5jeSA9IHRoaXMub3B0aW9ucyAmJiB0aGlzLm9wdGlvbnMuY29uY3VycmVuY3kgfHwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xyXG4gICAgY29uc3QgYWxsb3dlZENvbnRlbnRUeXBlcyA9IHRoaXMub3B0aW9ucyAmJiB0aGlzLm9wdGlvbnMuYWxsb3dlZENvbnRlbnRUeXBlcyB8fCBbJyonXTtcclxuICAgIGNvbnN0IG1heFVwbG9hZHMgPSB0aGlzLm9wdGlvbnMgJiYgdGhpcy5vcHRpb25zLm1heFVwbG9hZHMgfHwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xyXG4gICAgdGhpcy51cGxvYWQgPSBuZXcgTmdVcGxvYWRlclNlcnZpY2UoY29uY3VycmVuY3ksIGFsbG93ZWRDb250ZW50VHlwZXMsIG1heFVwbG9hZHMpO1xyXG5cclxuICAgIHRoaXMuZWwgPSB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcclxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy5maWxlTGlzdGVuZXIsIGZhbHNlKTtcclxuXHJcbiAgICB0aGlzLl9zdWIucHVzaChcclxuICAgICAgdGhpcy51cGxvYWQuc2VydmljZUV2ZW50cy5zdWJzY3JpYmUoKGV2ZW50OiBVcGxvYWRPdXRwdXQpID0+IHtcclxuICAgICAgICB0aGlzLnVwbG9hZE91dHB1dC5lbWl0KGV2ZW50KTtcclxuICAgICAgfSlcclxuICAgICk7XHJcblxyXG4gICAgaWYgKHRoaXMudXBsb2FkSW5wdXQgaW5zdGFuY2VvZiBFdmVudEVtaXR0ZXIpIHtcclxuICAgICAgdGhpcy5fc3ViLnB1c2godGhpcy51cGxvYWQuaW5pdElucHV0RXZlbnRzKHRoaXMudXBsb2FkSW5wdXQpKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCkge1xyXG4gICAgaWYgKHRoaXMuZWwpe1xyXG4gICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuZmlsZUxpc3RlbmVyLCBmYWxzZSk7XHJcbiAgICAgIHRoaXMuX3N1Yi5mb3JFYWNoKHN1YiA9PiBzdWIudW5zdWJzY3JpYmUoKSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmaWxlTGlzdGVuZXIgPSAoKSA9PiB7XHJcbiAgICBpZiAodGhpcy5lbC5maWxlcykge1xyXG4gICAgICB0aGlzLnVwbG9hZC5oYW5kbGVGaWxlcyh0aGlzLmVsLmZpbGVzKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuIl19