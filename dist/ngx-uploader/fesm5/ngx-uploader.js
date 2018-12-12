import { __spread } from 'tslib';
import { EventEmitter, Directive, ElementRef, Input, Output, HostListener, NgModule } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { mergeMap, finalize } from 'rxjs/operators';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
/** @enum {number} */
var UploadStatus = {
    Queue: 0,
    Uploading: 1,
    Done: 2,
    Cancelled: 3,
};
UploadStatus[UploadStatus.Queue] = 'Queue';
UploadStatus[UploadStatus.Uploading] = 'Uploading';
UploadStatus[UploadStatus.Done] = 'Done';
UploadStatus[UploadStatus.Cancelled] = 'Cancelled';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
/**
 * @param {?} bytes
 * @return {?}
 */
function humanizeBytes(bytes) {
    if (bytes === 0) {
        return '0 Byte';
    }
    /** @type {?} */
    var k = 1024;
    /** @type {?} */
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    /** @type {?} */
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
var NgUploaderService = /** @class */ (function () {
    function NgUploaderService(concurrency, contentTypes, maxUploads) {
        if (concurrency === void 0) { concurrency = Number.POSITIVE_INFINITY; }
        if (contentTypes === void 0) { contentTypes = ['*']; }
        if (maxUploads === void 0) { maxUploads = Number.POSITIVE_INFINITY; }
        var _this = this;
        this.queue = [];
        this.serviceEvents = new EventEmitter();
        this.uploadScheduler = new Subject();
        this.subs = [];
        this.contentTypes = contentTypes;
        this.maxUploads = maxUploads;
        this.uploadScheduler
            .pipe(mergeMap(function (upload) { return _this.startUpload(upload); }, concurrency))
            .subscribe(function (uploadOutput) { return _this.serviceEvents.emit(uploadOutput); });
    }
    /**
     * @param {?} incomingFiles
     * @return {?}
     */
    NgUploaderService.prototype.handleFiles = /**
     * @param {?} incomingFiles
     * @return {?}
     */
    function (incomingFiles) {
        var _this = this;
        var _a;
        /** @type {?} */
        var allowedIncomingFiles = [].reduce.call(incomingFiles, function (acc, checkFile, i) {
            /** @type {?} */
            var futureQueueLength = acc.length + _this.queue.length + 1;
            if (_this.isContentTypeAllowed(checkFile.type) && futureQueueLength <= _this.maxUploads) {
                acc = acc.concat(checkFile);
            }
            else {
                /** @type {?} */
                var rejectedFile = _this.makeUploadFile(checkFile, i);
                _this.serviceEvents.emit({ type: 'rejected', file: rejectedFile });
            }
            return acc;
        }, []);
        (_a = this.queue).push.apply(_a, __spread([].map.call(allowedIncomingFiles, function (file, i) {
            /** @type {?} */
            var uploadFile = _this.makeUploadFile(file, i);
            _this.serviceEvents.emit({ type: 'addedToQueue', file: uploadFile });
            return uploadFile;
        })));
        this.serviceEvents.emit({ type: 'allAddedToQueue' });
    };
    /**
     * @param {?} input
     * @return {?}
     */
    NgUploaderService.prototype.initInputEvents = /**
     * @param {?} input
     * @return {?}
     */
    function (input) {
        var _this = this;
        return input.subscribe(function (event) {
            switch (event.type) {
                case 'uploadFile':
                    /** @type {?} */
                    var uploadFileIndex = _this.queue.findIndex(function (file) { return file === event.file; });
                    if (uploadFileIndex !== -1 && event.file) {
                        _this.uploadScheduler.next({ file: _this.queue[uploadFileIndex], event: event });
                    }
                    break;
                case 'uploadAll':
                    /** @type {?} */
                    var files = _this.queue.filter(function (file) { return file.progress.status === UploadStatus.Queue; });
                    files.forEach(function (file) { return _this.uploadScheduler.next({ file: file, event: event }); });
                    break;
                case 'cancel':
                    /** @type {?} */
                    var id_1 = event.id || null;
                    if (!id_1) {
                        return;
                    }
                    /** @type {?} */
                    var subs = _this.subs.filter(function (sub) { return sub.id === id_1; });
                    subs.forEach(function (sub) {
                        if (sub.sub) {
                            sub.sub.unsubscribe();
                            /** @type {?} */
                            var fileIndex = _this.queue.findIndex(function (file) { return file.id === id_1; });
                            if (fileIndex !== -1) {
                                _this.queue[fileIndex].progress.status = UploadStatus.Cancelled;
                                _this.serviceEvents.emit({ type: 'cancelled', file: _this.queue[fileIndex] });
                            }
                        }
                    });
                    break;
                case 'cancelAll':
                    _this.subs.forEach(function (sub) {
                        if (sub.sub) {
                            sub.sub.unsubscribe();
                        }
                        /** @type {?} */
                        var file = _this.queue.find(function (uploadFile) { return uploadFile.id === sub.id; });
                        if (file) {
                            file.progress.status = UploadStatus.Cancelled;
                            _this.serviceEvents.emit({ type: 'cancelled', file: file });
                        }
                    });
                    break;
                case 'remove':
                    if (!event.id) {
                        return;
                    }
                    /** @type {?} */
                    var i = _this.queue.findIndex(function (file) { return file.id === event.id; });
                    if (i !== -1) {
                        /** @type {?} */
                        var file = _this.queue[i];
                        _this.queue.splice(i, 1);
                        _this.serviceEvents.emit({ type: 'removed', file: file });
                    }
                    break;
                case 'removeAll':
                    if (_this.queue.length) {
                        _this.queue = [];
                        _this.serviceEvents.emit({ type: 'removedAll' });
                    }
                    break;
            }
        });
    };
    /**
     * @param {?} upload
     * @return {?}
     */
    NgUploaderService.prototype.startUpload = /**
     * @param {?} upload
     * @return {?}
     */
    function (upload) {
        var _this = this;
        return new Observable(function (observer) {
            /** @type {?} */
            var sub = _this.uploadFile(upload.file, upload.event)
                .pipe(finalize(function () {
                if (!observer.closed) {
                    observer.complete();
                }
            }))
                .subscribe(function (output) {
                observer.next(output);
            }, function (err) {
                observer.error(err);
                observer.complete();
            }, function () {
                observer.complete();
            });
            _this.subs.push({ id: upload.file.id, sub: sub });
        });
    };
    /**
     * @param {?} file
     * @param {?} event
     * @return {?}
     */
    NgUploaderService.prototype.uploadFile = /**
     * @param {?} file
     * @param {?} event
     * @return {?}
     */
    function (file, event) {
        var _this = this;
        return new Observable(function (observer) {
            /** @type {?} */
            var url = event.url || '';
            /** @type {?} */
            var method = event.method || 'POST';
            /** @type {?} */
            var data = event.data || {};
            /** @type {?} */
            var headers = event.headers || {};
            /** @type {?} */
            var xhr = new XMLHttpRequest();
            /** @type {?} */
            var time = new Date().getTime();
            /** @type {?} */
            var progressStartTime = (file.progress.data && file.progress.data.startTime) || time;
            /** @type {?} */
            var speed = 0;
            /** @type {?} */
            var eta = null;
            xhr.upload.addEventListener('progress', function (e) {
                if (e.lengthComputable) {
                    /** @type {?} */
                    var percentage = Math.round((e.loaded * 100) / e.total);
                    /** @type {?} */
                    var diff = new Date().getTime() - time;
                    speed = Math.round(e.loaded / diff * 1000);
                    progressStartTime = (file.progress.data && file.progress.data.startTime) || new Date().getTime();
                    eta = Math.ceil((e.total - e.loaded) / speed);
                    file.progress = {
                        status: UploadStatus.Uploading,
                        data: {
                            percentage: percentage,
                            speed: speed,
                            speedHuman: humanizeBytes(speed) + "/s",
                            startTime: progressStartTime,
                            endTime: null,
                            eta: eta,
                            etaHuman: _this.secondsToHuman(eta)
                        }
                    };
                    observer.next({ type: 'uploading', file: file });
                }
            }, false);
            xhr.upload.addEventListener('error', function (e) {
                observer.error(e);
                observer.complete();
            });
            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    /** @type {?} */
                    var speedAverage = Math.round(file.size / (new Date().getTime() - progressStartTime) * 1000);
                    file.progress = {
                        status: UploadStatus.Done,
                        data: {
                            percentage: 100,
                            speed: speedAverage,
                            speedHuman: humanizeBytes(speedAverage) + "/s",
                            startTime: progressStartTime,
                            endTime: new Date().getTime(),
                            eta: eta,
                            etaHuman: _this.secondsToHuman(eta || 0)
                        }
                    };
                    file.responseStatus = xhr.status;
                    try {
                        file.response = JSON.parse(xhr.response);
                    }
                    catch (e) {
                        file.response = xhr.response;
                    }
                    file.responseHeaders = _this.parseResponseHeaders(xhr.getAllResponseHeaders());
                    observer.next({ type: 'done', file: file });
                    observer.complete();
                }
            };
            xhr.open(method, url, true);
            xhr.withCredentials = event.withCredentials ? true : false;
            try {
                /** @type {?} */
                var uploadFile_1 = (/** @type {?} */ (file.nativeFile));
                /** @type {?} */
                var uploadIndex = _this.queue.findIndex(function (outFile) { return outFile.nativeFile === uploadFile_1; });
                if (_this.queue[uploadIndex].progress.status === UploadStatus.Cancelled) {
                    observer.complete();
                }
                Object.keys(headers).forEach(function (key) { return xhr.setRequestHeader(key, headers[key]); });
                /** @type {?} */
                var bodyToSend = void 0;
                if (event.includeWebKitFormBoundary !== false) {
                    Object.keys(data).forEach(function (key) { return file.form.append(key, data[key]); });
                    file.form.append(event.fieldName || 'file', uploadFile_1, uploadFile_1.name);
                    bodyToSend = file.form;
                }
                else {
                    bodyToSend = uploadFile_1;
                }
                _this.serviceEvents.emit({ type: 'start', file: file });
                xhr.send(bodyToSend);
            }
            catch (e) {
                observer.complete();
            }
            return function () {
                xhr.abort();
            };
        });
    };
    /**
     * @param {?} sec
     * @return {?}
     */
    NgUploaderService.prototype.secondsToHuman = /**
     * @param {?} sec
     * @return {?}
     */
    function (sec) {
        return new Date(sec * 1000).toISOString().substr(11, 8);
    };
    /**
     * @return {?}
     */
    NgUploaderService.prototype.generateId = /**
     * @return {?}
     */
    function () {
        return Math.random().toString(36).substring(7);
    };
    /**
     * @param {?} contentTypes
     * @return {?}
     */
    NgUploaderService.prototype.setContentTypes = /**
     * @param {?} contentTypes
     * @return {?}
     */
    function (contentTypes) {
        if (typeof contentTypes != 'undefined' && contentTypes instanceof Array) {
            if (contentTypes.find(function (type) { return type === '*'; }) !== undefined) {
                this.contentTypes = ['*'];
            }
            else {
                this.contentTypes = contentTypes;
            }
            return;
        }
        this.contentTypes = ['*'];
    };
    /**
     * @return {?}
     */
    NgUploaderService.prototype.allContentTypesAllowed = /**
     * @return {?}
     */
    function () {
        return this.contentTypes.find(function (type) { return type === '*'; }) !== undefined;
    };
    /**
     * @param {?} mimetype
     * @return {?}
     */
    NgUploaderService.prototype.isContentTypeAllowed = /**
     * @param {?} mimetype
     * @return {?}
     */
    function (mimetype) {
        if (this.allContentTypesAllowed()) {
            return true;
        }
        return this.contentTypes.find(function (type) { return type === mimetype; }) !== undefined;
    };
    /**
     * @param {?} file
     * @param {?} index
     * @return {?}
     */
    NgUploaderService.prototype.makeUploadFile = /**
     * @param {?} file
     * @param {?} index
     * @return {?}
     */
    function (file, index) {
        return {
            fileIndex: index,
            id: this.generateId(),
            name: file.name,
            size: file.size,
            type: file.type,
            form: new FormData(),
            progress: {
                status: UploadStatus.Queue,
                data: {
                    percentage: 0,
                    speed: 0,
                    speedHuman: humanizeBytes(0) + "/s",
                    startTime: null,
                    endTime: null,
                    eta: null,
                    etaHuman: null
                }
            },
            lastModifiedDate: file.lastModifiedDate,
            sub: undefined,
            nativeFile: file
        };
    };
    /**
     * @param {?} httpHeaders
     * @return {?}
     */
    NgUploaderService.prototype.parseResponseHeaders = /**
     * @param {?} httpHeaders
     * @return {?}
     */
    function (httpHeaders) {
        if (!httpHeaders) {
            return;
        }
        return httpHeaders.split('\n')
            .map(function (x) { return x.split(/: */, 2); })
            .filter(function (x) { return x[0]; })
            .reduce(function (ac, x) {
            ac[x[0]] = x[1];
            return ac;
        }, {});
    };
    return NgUploaderService;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
var NgFileSelectDirective = /** @class */ (function () {
    function NgFileSelectDirective(elementRef) {
        var _this = this;
        this.elementRef = elementRef;
        this.fileListener = function () {
            if (_this.el.files) {
                _this.upload.handleFiles(_this.el.files);
            }
        };
        this.uploadOutput = new EventEmitter();
    }
    /**
     * @return {?}
     */
    NgFileSelectDirective.prototype.ngOnInit = /**
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
        this.el.addEventListener('change', this.fileListener, false);
        this._sub.push(this.upload.serviceEvents.subscribe(function (event) {
            _this.uploadOutput.emit(event);
        }));
        if (this.uploadInput instanceof EventEmitter) {
            this._sub.push(this.upload.initInputEvents(this.uploadInput));
        }
    };
    /**
     * @return {?}
     */
    NgFileSelectDirective.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        if (this.el) {
            this.el.removeEventListener('change', this.fileListener, false);
            this._sub.forEach(function (sub) { return sub.unsubscribe(); });
        }
    };
    NgFileSelectDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[ngFileSelect]'
                },] },
    ];
    NgFileSelectDirective.ctorParameters = function () { return [
        { type: ElementRef }
    ]; };
    NgFileSelectDirective.propDecorators = {
        options: [{ type: Input }],
        uploadInput: [{ type: Input }],
        uploadOutput: [{ type: Output }]
    };
    return NgFileSelectDirective;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
var NgxUploaderModule = /** @class */ (function () {
    function NgxUploaderModule() {
    }
    NgxUploaderModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [NgFileDropDirective, NgFileSelectDirective],
                    exports: [NgFileDropDirective, NgFileSelectDirective]
                },] },
    ];
    return NgxUploaderModule;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */

export { UploadStatus, NgFileDropDirective, NgFileSelectDirective, humanizeBytes, NgUploaderService, NgxUploaderModule };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LXVwbG9hZGVyLmpzLm1hcCIsInNvdXJjZXMiOlsibmc6Ly9uZ3gtdXBsb2FkZXIvbGliL2ludGVyZmFjZXMudHMiLCJuZzovL25neC11cGxvYWRlci9saWIvbmd4LXVwbG9hZGVyLmNsYXNzLnRzIiwibmc6Ly9uZ3gtdXBsb2FkZXIvbGliL25nLWZpbGUtZHJvcC5kaXJlY3RpdmUudHMiLCJuZzovL25neC11cGxvYWRlci9saWIvbmctZmlsZS1zZWxlY3QuZGlyZWN0aXZlLnRzIiwibmc6Ly9uZ3gtdXBsb2FkZXIvbGliL25neC11cGxvYWRlci5tb2R1bGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFVwbG9hZGVyT3B0aW9ucyB7XHJcbiAgY29uY3VycmVuY3k6IG51bWJlcjtcclxuICBhbGxvd2VkQ29udGVudFR5cGVzPzogc3RyaW5nW107XHJcbiAgbWF4VXBsb2Fkcz86IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBCbG9iRmlsZSBleHRlbmRzIEJsb2Ige1xyXG4gIG5hbWU6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGVudW0gVXBsb2FkU3RhdHVzIHtcclxuICBRdWV1ZSxcclxuICBVcGxvYWRpbmcsXHJcbiAgRG9uZSxcclxuICBDYW5jZWxsZWRcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBVcGxvYWRQcm9ncmVzcyB7XHJcbiAgc3RhdHVzOiBVcGxvYWRTdGF0dXM7XHJcbiAgZGF0YT86IHtcclxuICAgIHBlcmNlbnRhZ2U6IG51bWJlcjtcclxuICAgIHNwZWVkOiBudW1iZXI7XHJcbiAgICBzcGVlZEh1bWFuOiBzdHJpbmc7XHJcbiAgICBzdGFydFRpbWU6IG51bWJlciB8IG51bGw7XHJcbiAgICBlbmRUaW1lOiBudW1iZXIgfCBudWxsO1xyXG4gICAgZXRhOiBudW1iZXIgfCBudWxsO1xyXG4gICAgZXRhSHVtYW46IHN0cmluZyB8IG51bGw7XHJcbiAgfTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBVcGxvYWRGaWxlIHtcclxuICBpZDogc3RyaW5nO1xyXG4gIGZpbGVJbmRleDogbnVtYmVyO1xyXG4gIGxhc3RNb2RpZmllZERhdGU6IERhdGU7XHJcbiAgbmFtZTogc3RyaW5nO1xyXG4gIHNpemU6IG51bWJlcjtcclxuICB0eXBlOiBzdHJpbmc7XHJcbiAgZm9ybTogRm9ybURhdGE7XHJcbiAgcHJvZ3Jlc3M6IFVwbG9hZFByb2dyZXNzO1xyXG4gIHJlc3BvbnNlPzogYW55O1xyXG4gIHJlc3BvbnNlU3RhdHVzPzogbnVtYmVyO1xyXG4gIHN1Yj86IFN1YnNjcmlwdGlvbiB8IGFueTtcclxuICBuYXRpdmVGaWxlPzogRmlsZTtcclxuICByZXNwb25zZUhlYWRlcnM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFVwbG9hZE91dHB1dCB7XHJcbiAgdHlwZTogJ2FkZGVkVG9RdWV1ZScgfCAnYWxsQWRkZWRUb1F1ZXVlJyB8ICd1cGxvYWRpbmcnIHwgJ2RvbmUnIHwgJ3N0YXJ0JyB8ICdjYW5jZWxsZWQnIHwgJ2RyYWdPdmVyJ1xyXG4gICAgICB8ICdkcmFnT3V0JyB8ICdkcm9wJyB8ICdyZW1vdmVkJyB8ICdyZW1vdmVkQWxsJyB8ICdyZWplY3RlZCc7XHJcbiAgZmlsZT86IFVwbG9hZEZpbGU7XHJcbiAgbmF0aXZlRmlsZT86IEZpbGU7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVXBsb2FkSW5wdXQge1xyXG4gIHR5cGU6ICd1cGxvYWRBbGwnIHwgJ3VwbG9hZEZpbGUnIHwgJ2NhbmNlbCcgfCAnY2FuY2VsQWxsJyB8ICdyZW1vdmUnIHwgJ3JlbW92ZUFsbCc7XHJcbiAgdXJsPzogc3RyaW5nO1xyXG4gIG1ldGhvZD86IHN0cmluZztcclxuICBpZD86IHN0cmluZztcclxuICBmaWVsZE5hbWU/OiBzdHJpbmc7XHJcbiAgZmlsZUluZGV4PzogbnVtYmVyO1xyXG4gIGZpbGU/OiBVcGxvYWRGaWxlO1xyXG4gIGRhdGE/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IEJsb2IgfTtcclxuICBoZWFkZXJzPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcclxuICBpbmNsdWRlV2ViS2l0Rm9ybUJvdW5kYXJ5PzogYm9vbGVhbjsgLy8gSWYgZmFsc2UsIG9ubHkgdGhlIGZpbGUgaXMgc2VuZCB0cm91Z2ggeGhyLnNlbmQgKFdlYktpdEZvcm1Cb3VuZGFyeSBpcyBvbWl0KVxyXG4gIHdpdGhDcmVkZW50aWFscz86IGJvb2xlYW47XHJcbn1cclxuIiwiaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QsIFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBtZXJnZU1hcCwgZmluYWxpemUgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbmltcG9ydCB7IFVwbG9hZEZpbGUsIFVwbG9hZE91dHB1dCwgVXBsb2FkSW5wdXQsIFVwbG9hZFN0YXR1cywgQmxvYkZpbGUgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGh1bWFuaXplQnl0ZXMoYnl0ZXM6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgaWYgKGJ5dGVzID09PSAwKSB7XHJcbiAgICByZXR1cm4gJzAgQnl0ZSc7XHJcbiAgfVxyXG5cclxuICBjb25zdCBrID0gMTAyNDtcclxuICBjb25zdCBzaXplczogc3RyaW5nW10gPSBbJ0J5dGVzJywgJ0tCJywgJ01CJywgJ0dCJywgJ1RCJywgJ1BCJ107XHJcbiAgY29uc3QgaTogbnVtYmVyID0gTWF0aC5mbG9vcihNYXRoLmxvZyhieXRlcykgLyBNYXRoLmxvZyhrKSk7XHJcblxyXG4gIHJldHVybiBwYXJzZUZsb2F0KChieXRlcyAvIE1hdGgucG93KGssIGkpKS50b0ZpeGVkKDIpKSArICcgJyArIHNpemVzW2ldO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTmdVcGxvYWRlclNlcnZpY2Uge1xyXG4gIHF1ZXVlOiBVcGxvYWRGaWxlW107XHJcbiAgc2VydmljZUV2ZW50czogRXZlbnRFbWl0dGVyPFVwbG9hZE91dHB1dD47XHJcbiAgdXBsb2FkU2NoZWR1bGVyOiBTdWJqZWN0PHsgZmlsZTogVXBsb2FkRmlsZSwgZXZlbnQ6IFVwbG9hZElucHV0IH0+O1xyXG4gIHN1YnM6IHsgaWQ6IHN0cmluZywgc3ViOiBTdWJzY3JpcHRpb24gfVtdO1xyXG4gIGNvbnRlbnRUeXBlczogc3RyaW5nW107XHJcbiAgbWF4VXBsb2FkczogbnVtYmVyO1xyXG5cclxuICBjb25zdHJ1Y3Rvcihjb25jdXJyZW5jeTogbnVtYmVyID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLCBjb250ZW50VHlwZXM6IHN0cmluZ1tdID0gWycqJ10sIG1heFVwbG9hZHM6IG51bWJlciA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSkge1xyXG4gICAgdGhpcy5xdWV1ZSA9IFtdO1xyXG4gICAgdGhpcy5zZXJ2aWNlRXZlbnRzID0gbmV3IEV2ZW50RW1pdHRlcjxVcGxvYWRPdXRwdXQ+KCk7XHJcbiAgICB0aGlzLnVwbG9hZFNjaGVkdWxlciA9IG5ldyBTdWJqZWN0KCk7XHJcbiAgICB0aGlzLnN1YnMgPSBbXTtcclxuICAgIHRoaXMuY29udGVudFR5cGVzID0gY29udGVudFR5cGVzO1xyXG4gICAgdGhpcy5tYXhVcGxvYWRzID0gbWF4VXBsb2FkcztcclxuXHJcbiAgICB0aGlzLnVwbG9hZFNjaGVkdWxlclxyXG4gICAgICAucGlwZShcclxuICAgICAgICBtZXJnZU1hcCh1cGxvYWQgPT4gdGhpcy5zdGFydFVwbG9hZCh1cGxvYWQpLCBjb25jdXJyZW5jeSlcclxuICAgICAgKVxyXG4gICAgICAuc3Vic2NyaWJlKHVwbG9hZE91dHB1dCA9PiB0aGlzLnNlcnZpY2VFdmVudHMuZW1pdCh1cGxvYWRPdXRwdXQpKTtcclxuICB9XHJcblxyXG4gIGhhbmRsZUZpbGVzKGluY29taW5nRmlsZXM6IEZpbGVMaXN0KTogdm9pZCB7XHJcbiAgICBjb25zdCBhbGxvd2VkSW5jb21pbmdGaWxlczogRmlsZVtdID0gW10ucmVkdWNlLmNhbGwoaW5jb21pbmdGaWxlcywgKGFjYzogRmlsZVtdLCBjaGVja0ZpbGU6IEZpbGUsIGk6IG51bWJlcikgPT4ge1xyXG4gICAgICBjb25zdCBmdXR1cmVRdWV1ZUxlbmd0aCA9IGFjYy5sZW5ndGggKyB0aGlzLnF1ZXVlLmxlbmd0aCArIDE7XHJcbiAgICAgIGlmICh0aGlzLmlzQ29udGVudFR5cGVBbGxvd2VkKGNoZWNrRmlsZS50eXBlKSAmJiBmdXR1cmVRdWV1ZUxlbmd0aCA8PSB0aGlzLm1heFVwbG9hZHMpIHtcclxuICAgICAgICBhY2MgPSBhY2MuY29uY2F0KGNoZWNrRmlsZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc3QgcmVqZWN0ZWRGaWxlOiBVcGxvYWRGaWxlID0gdGhpcy5tYWtlVXBsb2FkRmlsZShjaGVja0ZpbGUsIGkpO1xyXG4gICAgICAgIHRoaXMuc2VydmljZUV2ZW50cy5lbWl0KHsgdHlwZTogJ3JlamVjdGVkJywgZmlsZTogcmVqZWN0ZWRGaWxlIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gYWNjO1xyXG4gICAgfSwgW10pO1xyXG5cclxuICAgIHRoaXMucXVldWUucHVzaCguLi5bXS5tYXAuY2FsbChhbGxvd2VkSW5jb21pbmdGaWxlcywgKGZpbGU6IEZpbGUsIGk6IG51bWJlcikgPT4ge1xyXG4gICAgICBjb25zdCB1cGxvYWRGaWxlOiBVcGxvYWRGaWxlID0gdGhpcy5tYWtlVXBsb2FkRmlsZShmaWxlLCBpKTtcclxuICAgICAgdGhpcy5zZXJ2aWNlRXZlbnRzLmVtaXQoeyB0eXBlOiAnYWRkZWRUb1F1ZXVlJywgZmlsZTogdXBsb2FkRmlsZSB9KTtcclxuICAgICAgcmV0dXJuIHVwbG9hZEZpbGU7XHJcbiAgICB9KSk7XHJcblxyXG4gICAgdGhpcy5zZXJ2aWNlRXZlbnRzLmVtaXQoeyB0eXBlOiAnYWxsQWRkZWRUb1F1ZXVlJyB9KTtcclxuICB9XHJcblxyXG4gIGluaXRJbnB1dEV2ZW50cyhpbnB1dDogRXZlbnRFbWl0dGVyPFVwbG9hZElucHV0Pik6IFN1YnNjcmlwdGlvbiB7XHJcbiAgICByZXR1cm4gaW5wdXQuc3Vic2NyaWJlKChldmVudDogVXBsb2FkSW5wdXQpID0+IHtcclxuICAgICAgc3dpdGNoIChldmVudC50eXBlKSB7XHJcbiAgICAgICAgY2FzZSAndXBsb2FkRmlsZSc6XHJcbiAgICAgICAgICBjb25zdCB1cGxvYWRGaWxlSW5kZXggPSB0aGlzLnF1ZXVlLmZpbmRJbmRleChmaWxlID0+IGZpbGUgPT09IGV2ZW50LmZpbGUpO1xyXG4gICAgICAgICAgaWYgKHVwbG9hZEZpbGVJbmRleCAhPT0gLTEgJiYgZXZlbnQuZmlsZSkge1xyXG4gICAgICAgICAgICB0aGlzLnVwbG9hZFNjaGVkdWxlci5uZXh0KHsgZmlsZTogdGhpcy5xdWV1ZVt1cGxvYWRGaWxlSW5kZXhdLCBldmVudDogZXZlbnQgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICd1cGxvYWRBbGwnOlxyXG4gICAgICAgICAgY29uc3QgZmlsZXMgPSB0aGlzLnF1ZXVlLmZpbHRlcihmaWxlID0+IGZpbGUucHJvZ3Jlc3Muc3RhdHVzID09PSBVcGxvYWRTdGF0dXMuUXVldWUpO1xyXG4gICAgICAgICAgZmlsZXMuZm9yRWFjaChmaWxlID0+IHRoaXMudXBsb2FkU2NoZWR1bGVyLm5leHQoeyBmaWxlOiBmaWxlLCBldmVudDogZXZlbnQgfSkpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnY2FuY2VsJzpcclxuICAgICAgICAgIGNvbnN0IGlkID0gZXZlbnQuaWQgfHwgbnVsbDtcclxuICAgICAgICAgIGlmICghaWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY29uc3Qgc3VicyA9IHRoaXMuc3Vicy5maWx0ZXIoc3ViID0+IHN1Yi5pZCA9PT0gaWQpO1xyXG4gICAgICAgICAgc3Vicy5mb3JFYWNoKHN1YiA9PiB7XHJcbiAgICAgICAgICAgIGlmIChzdWIuc3ViKSB7XHJcbiAgICAgICAgICAgICAgc3ViLnN1Yi51bnN1YnNjcmliZSgpO1xyXG4gICAgICAgICAgICAgIGNvbnN0IGZpbGVJbmRleCA9IHRoaXMucXVldWUuZmluZEluZGV4KGZpbGUgPT4gZmlsZS5pZCA9PT0gaWQpO1xyXG4gICAgICAgICAgICAgIGlmIChmaWxlSW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnF1ZXVlW2ZpbGVJbmRleF0ucHJvZ3Jlc3Muc3RhdHVzID0gVXBsb2FkU3RhdHVzLkNhbmNlbGxlZDtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VydmljZUV2ZW50cy5lbWl0KHt0eXBlOiAnY2FuY2VsbGVkJywgZmlsZTogdGhpcy5xdWV1ZVtmaWxlSW5kZXhdfSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ2NhbmNlbEFsbCc6XHJcbiAgICAgICAgICB0aGlzLnN1YnMuZm9yRWFjaChzdWIgPT4ge1xyXG4gICAgICAgICAgICBpZiAoc3ViLnN1Yikge1xyXG4gICAgICAgICAgICAgIHN1Yi5zdWIudW5zdWJzY3JpYmUoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgZmlsZSA9IHRoaXMucXVldWUuZmluZCh1cGxvYWRGaWxlID0+IHVwbG9hZEZpbGUuaWQgPT09IHN1Yi5pZCk7XHJcbiAgICAgICAgICAgIGlmIChmaWxlKSB7XHJcbiAgICAgICAgICAgICAgZmlsZS5wcm9ncmVzcy5zdGF0dXMgPSBVcGxvYWRTdGF0dXMuQ2FuY2VsbGVkO1xyXG4gICAgICAgICAgICAgIHRoaXMuc2VydmljZUV2ZW50cy5lbWl0KHsgdHlwZTogJ2NhbmNlbGxlZCcsIGZpbGU6IGZpbGUgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAncmVtb3ZlJzpcclxuICAgICAgICAgIGlmICghZXZlbnQuaWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGNvbnN0IGkgPSB0aGlzLnF1ZXVlLmZpbmRJbmRleChmaWxlID0+IGZpbGUuaWQgPT09IGV2ZW50LmlkKTtcclxuICAgICAgICAgIGlmIChpICE9PSAtMSkge1xyXG4gICAgICAgICAgICBjb25zdCBmaWxlID0gdGhpcy5xdWV1ZVtpXTtcclxuICAgICAgICAgICAgdGhpcy5xdWV1ZS5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2VydmljZUV2ZW50cy5lbWl0KHsgdHlwZTogJ3JlbW92ZWQnLCBmaWxlOiBmaWxlIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAncmVtb3ZlQWxsJzpcclxuICAgICAgICAgIGlmICh0aGlzLnF1ZXVlLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLnF1ZXVlID0gW107XHJcbiAgICAgICAgICAgIHRoaXMuc2VydmljZUV2ZW50cy5lbWl0KHsgdHlwZTogJ3JlbW92ZWRBbGwnIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgc3RhcnRVcGxvYWQodXBsb2FkOiB7IGZpbGU6IFVwbG9hZEZpbGUsIGV2ZW50OiBVcGxvYWRJbnB1dCB9KTogT2JzZXJ2YWJsZTxVcGxvYWRPdXRwdXQ+IHtcclxuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZShvYnNlcnZlciA9PiB7XHJcbiAgICAgIGNvbnN0IHN1YiA9IHRoaXMudXBsb2FkRmlsZSh1cGxvYWQuZmlsZSwgdXBsb2FkLmV2ZW50KVxyXG4gICAgICAgIC5waXBlKGZpbmFsaXplKCgpID0+IHtcclxuICAgICAgICAgIGlmICghb2JzZXJ2ZXIuY2xvc2VkKSB7XHJcbiAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSkpXHJcbiAgICAgICAgLnN1YnNjcmliZShvdXRwdXQgPT4ge1xyXG4gICAgICAgICAgb2JzZXJ2ZXIubmV4dChvdXRwdXQpO1xyXG4gICAgICAgIH0sIGVyciA9PiB7XHJcbiAgICAgICAgICBvYnNlcnZlci5lcnJvcihlcnIpO1xyXG4gICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcclxuICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5zdWJzLnB1c2goeyBpZDogdXBsb2FkLmZpbGUuaWQsIHN1Yjogc3ViIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICB1cGxvYWRGaWxlKGZpbGU6IFVwbG9hZEZpbGUsIGV2ZW50OiBVcGxvYWRJbnB1dCk6IE9ic2VydmFibGU8VXBsb2FkT3V0cHV0PiB7XHJcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUob2JzZXJ2ZXIgPT4ge1xyXG4gICAgICBjb25zdCB1cmwgPSBldmVudC51cmwgfHwgJyc7XHJcbiAgICAgIGNvbnN0IG1ldGhvZCA9IGV2ZW50Lm1ldGhvZCB8fCAnUE9TVCc7XHJcbiAgICAgIGNvbnN0IGRhdGEgPSBldmVudC5kYXRhIHx8IHt9O1xyXG4gICAgICBjb25zdCBoZWFkZXJzID0gZXZlbnQuaGVhZGVycyB8fCB7fTtcclxuXHJcbiAgICAgIGNvbnN0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgICBjb25zdCB0aW1lOiBudW1iZXIgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgICAgbGV0IHByb2dyZXNzU3RhcnRUaW1lOiBudW1iZXIgPSAoZmlsZS5wcm9ncmVzcy5kYXRhICYmIGZpbGUucHJvZ3Jlc3MuZGF0YS5zdGFydFRpbWUpIHx8IHRpbWU7XHJcbiAgICAgIGxldCBzcGVlZCA9IDA7XHJcbiAgICAgIGxldCBldGE6IG51bWJlciB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgICAgeGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIChlOiBQcm9ncmVzc0V2ZW50KSA9PiB7XHJcbiAgICAgICAgaWYgKGUubGVuZ3RoQ29tcHV0YWJsZSkge1xyXG4gICAgICAgICAgY29uc3QgcGVyY2VudGFnZSA9IE1hdGgucm91bmQoKGUubG9hZGVkICogMTAwKSAvIGUudG90YWwpO1xyXG4gICAgICAgICAgY29uc3QgZGlmZiA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdGltZTtcclxuICAgICAgICAgIHNwZWVkID0gTWF0aC5yb3VuZChlLmxvYWRlZCAvIGRpZmYgKiAxMDAwKTtcclxuICAgICAgICAgIHByb2dyZXNzU3RhcnRUaW1lID0gKGZpbGUucHJvZ3Jlc3MuZGF0YSAmJiBmaWxlLnByb2dyZXNzLmRhdGEuc3RhcnRUaW1lKSB8fCBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgICAgICAgIGV0YSA9IE1hdGguY2VpbCgoZS50b3RhbCAtIGUubG9hZGVkKSAvIHNwZWVkKTtcclxuXHJcbiAgICAgICAgICBmaWxlLnByb2dyZXNzID0ge1xyXG4gICAgICAgICAgICBzdGF0dXM6IFVwbG9hZFN0YXR1cy5VcGxvYWRpbmcsXHJcbiAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICBwZXJjZW50YWdlOiBwZXJjZW50YWdlLFxyXG4gICAgICAgICAgICAgIHNwZWVkOiBzcGVlZCxcclxuICAgICAgICAgICAgICBzcGVlZEh1bWFuOiBgJHtodW1hbml6ZUJ5dGVzKHNwZWVkKX0vc2AsXHJcbiAgICAgICAgICAgICAgc3RhcnRUaW1lOiBwcm9ncmVzc1N0YXJ0VGltZSxcclxuICAgICAgICAgICAgICBlbmRUaW1lOiBudWxsLFxyXG4gICAgICAgICAgICAgIGV0YTogZXRhLFxyXG4gICAgICAgICAgICAgIGV0YUh1bWFuOiB0aGlzLnNlY29uZHNUb0h1bWFuKGV0YSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICBvYnNlcnZlci5uZXh0KHsgdHlwZTogJ3VwbG9hZGluZycsIGZpbGU6IGZpbGUgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LCBmYWxzZSk7XHJcblxyXG4gICAgICB4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgKGU6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZSk7XHJcbiAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgPT4ge1xyXG4gICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gWE1MSHR0cFJlcXVlc3QuRE9ORSkge1xyXG4gICAgICAgICAgY29uc3Qgc3BlZWRBdmVyYWdlID0gTWF0aC5yb3VuZChmaWxlLnNpemUgLyAobmV3IERhdGUoKS5nZXRUaW1lKCkgLSBwcm9ncmVzc1N0YXJ0VGltZSkgKiAxMDAwKTtcclxuICAgICAgICAgIGZpbGUucHJvZ3Jlc3MgPSB7XHJcbiAgICAgICAgICAgIHN0YXR1czogVXBsb2FkU3RhdHVzLkRvbmUsXHJcbiAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICBwZXJjZW50YWdlOiAxMDAsXHJcbiAgICAgICAgICAgICAgc3BlZWQ6IHNwZWVkQXZlcmFnZSxcclxuICAgICAgICAgICAgICBzcGVlZEh1bWFuOiBgJHtodW1hbml6ZUJ5dGVzKHNwZWVkQXZlcmFnZSl9L3NgLFxyXG4gICAgICAgICAgICAgIHN0YXJ0VGltZTogcHJvZ3Jlc3NTdGFydFRpbWUsXHJcbiAgICAgICAgICAgICAgZW5kVGltZTogbmV3IERhdGUoKS5nZXRUaW1lKCksXHJcbiAgICAgICAgICAgICAgZXRhOiBldGEsXHJcbiAgICAgICAgICAgICAgZXRhSHVtYW46IHRoaXMuc2Vjb25kc1RvSHVtYW4oZXRhIHx8IDApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgZmlsZS5yZXNwb25zZVN0YXR1cyA9IHhoci5zdGF0dXM7XHJcblxyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgZmlsZS5yZXNwb25zZSA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlKTtcclxuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgZmlsZS5yZXNwb25zZSA9IHhoci5yZXNwb25zZTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBmaWxlLnJlc3BvbnNlSGVhZGVycyA9IHRoaXMucGFyc2VSZXNwb25zZUhlYWRlcnMoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKTtcclxuXHJcbiAgICAgICAgICBvYnNlcnZlci5uZXh0KHsgdHlwZTogJ2RvbmUnLCBmaWxlOiBmaWxlIH0pO1xyXG5cclxuICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgeGhyLm9wZW4obWV0aG9kLCB1cmwsIHRydWUpO1xyXG4gICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gZXZlbnQud2l0aENyZWRlbnRpYWxzID8gdHJ1ZSA6IGZhbHNlO1xyXG5cclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCB1cGxvYWRGaWxlID0gPEJsb2JGaWxlPmZpbGUubmF0aXZlRmlsZTtcclxuICAgICAgICBjb25zdCB1cGxvYWRJbmRleCA9IHRoaXMucXVldWUuZmluZEluZGV4KG91dEZpbGUgPT4gb3V0RmlsZS5uYXRpdmVGaWxlID09PSB1cGxvYWRGaWxlKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMucXVldWVbdXBsb2FkSW5kZXhdLnByb2dyZXNzLnN0YXR1cyA9PT0gVXBsb2FkU3RhdHVzLkNhbmNlbGxlZCkge1xyXG4gICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIE9iamVjdC5rZXlzKGhlYWRlcnMpLmZvckVhY2goa2V5ID0+IHhoci5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgaGVhZGVyc1trZXldKSk7XHJcblxyXG4gICAgICAgIGxldCBib2R5VG9TZW5kO1xyXG5cclxuICAgICAgICBpZiAoZXZlbnQuaW5jbHVkZVdlYktpdEZvcm1Cb3VuZGFyeSAhPT0gZmFsc2UpIHtcclxuICAgICAgICAgIE9iamVjdC5rZXlzKGRhdGEpLmZvckVhY2goa2V5ID0+IGZpbGUuZm9ybS5hcHBlbmQoa2V5LCBkYXRhW2tleV0pKTtcclxuICAgICAgICAgIGZpbGUuZm9ybS5hcHBlbmQoZXZlbnQuZmllbGROYW1lIHx8ICdmaWxlJywgdXBsb2FkRmlsZSwgdXBsb2FkRmlsZS5uYW1lKTtcclxuICAgICAgICAgIGJvZHlUb1NlbmQgPSBmaWxlLmZvcm07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGJvZHlUb1NlbmQgPSB1cGxvYWRGaWxlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zZXJ2aWNlRXZlbnRzLmVtaXQoeyB0eXBlOiAnc3RhcnQnLCBmaWxlOiBmaWxlIH0pO1xyXG4gICAgICAgIHhoci5zZW5kKGJvZHlUb1NlbmQpO1xyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgICB4aHIuYWJvcnQoKTtcclxuICAgICAgfTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgc2Vjb25kc1RvSHVtYW4oc2VjOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIG5ldyBEYXRlKHNlYyAqIDEwMDApLnRvSVNPU3RyaW5nKCkuc3Vic3RyKDExLCA4KTtcclxuICB9XHJcblxyXG4gIGdlbmVyYXRlSWQoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoNyk7XHJcbiAgfVxyXG5cclxuICBzZXRDb250ZW50VHlwZXMoY29udGVudFR5cGVzOiBzdHJpbmdbXSk6IHZvaWQge1xyXG4gICAgaWYgKHR5cGVvZiBjb250ZW50VHlwZXMgIT0gJ3VuZGVmaW5lZCcgJiYgY29udGVudFR5cGVzIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgaWYgKGNvbnRlbnRUeXBlcy5maW5kKCh0eXBlOiBzdHJpbmcpID0+IHR5cGUgPT09ICcqJykgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHRoaXMuY29udGVudFR5cGVzID0gWycqJ107XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5jb250ZW50VHlwZXMgPSBjb250ZW50VHlwZXM7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdGhpcy5jb250ZW50VHlwZXMgPSBbJyonXTtcclxuICB9XHJcblxyXG4gIGFsbENvbnRlbnRUeXBlc0FsbG93ZWQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5jb250ZW50VHlwZXMuZmluZCgodHlwZTogc3RyaW5nKSA9PiB0eXBlID09PSAnKicpICE9PSB1bmRlZmluZWQ7XHJcbiAgfVxyXG5cclxuICBpc0NvbnRlbnRUeXBlQWxsb3dlZChtaW1ldHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICBpZiAodGhpcy5hbGxDb250ZW50VHlwZXNBbGxvd2VkKCkpIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5jb250ZW50VHlwZXMuZmluZCgodHlwZTogc3RyaW5nKSA9PiB0eXBlID09PSBtaW1ldHlwZSkgIT09IHVuZGVmaW5lZDtcclxuICB9XHJcblxyXG4gIG1ha2VVcGxvYWRGaWxlKGZpbGU6IEZpbGUsIGluZGV4OiBudW1iZXIpOiBVcGxvYWRGaWxlIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGZpbGVJbmRleDogaW5kZXgsXHJcbiAgICAgIGlkOiB0aGlzLmdlbmVyYXRlSWQoKSxcclxuICAgICAgbmFtZTogZmlsZS5uYW1lLFxyXG4gICAgICBzaXplOiBmaWxlLnNpemUsXHJcbiAgICAgIHR5cGU6IGZpbGUudHlwZSxcclxuICAgICAgZm9ybTogbmV3IEZvcm1EYXRhKCksXHJcbiAgICAgIHByb2dyZXNzOiB7XHJcbiAgICAgICAgc3RhdHVzOiBVcGxvYWRTdGF0dXMuUXVldWUsXHJcbiAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgcGVyY2VudGFnZTogMCxcclxuICAgICAgICAgIHNwZWVkOiAwLFxyXG4gICAgICAgICAgc3BlZWRIdW1hbjogYCR7aHVtYW5pemVCeXRlcygwKX0vc2AsXHJcbiAgICAgICAgICBzdGFydFRpbWU6IG51bGwsXHJcbiAgICAgICAgICBlbmRUaW1lOiBudWxsLFxyXG4gICAgICAgICAgZXRhOiBudWxsLFxyXG4gICAgICAgICAgZXRhSHVtYW46IG51bGxcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIGxhc3RNb2RpZmllZERhdGU6IGZpbGUubGFzdE1vZGlmaWVkRGF0ZSxcclxuICAgICAgc3ViOiB1bmRlZmluZWQsXHJcbiAgICAgIG5hdGl2ZUZpbGU6IGZpbGVcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHBhcnNlUmVzcG9uc2VIZWFkZXJzKGh0dHBIZWFkZXJzOiBCeXRlU3RyaW5nKSB7XHJcbiAgICBpZiAoIWh0dHBIZWFkZXJzKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHJldHVybiBodHRwSGVhZGVycy5zcGxpdCgnXFxuJylcclxuICAgICAgLm1hcCh4ID0+IHguc3BsaXQoLzogKi8sIDIpKVxyXG4gICAgICAuZmlsdGVyKHggPT4geFswXSlcclxuICAgICAgLnJlZHVjZSgoYWMsIHgpID0+IHtcclxuICAgICAgICBhY1t4WzBdXSA9IHhbMV07XHJcbiAgICAgICAgcmV0dXJuIGFjO1xyXG4gICAgICB9LCB7fSk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7IERpcmVjdGl2ZSwgRWxlbWVudFJlZiwgRXZlbnRFbWl0dGVyLCBJbnB1dCwgT3V0cHV0LCBPbkluaXQsIE9uRGVzdHJveSwgSG9zdExpc3RlbmVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IFVwbG9hZE91dHB1dCwgVXBsb2FkSW5wdXQsIFVwbG9hZGVyT3B0aW9ucyB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XHJcbmltcG9ydCB7IE5nVXBsb2FkZXJTZXJ2aWNlIH0gZnJvbSAnLi9uZ3gtdXBsb2FkZXIuY2xhc3MnO1xyXG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcclxuXHJcbkBEaXJlY3RpdmUoe1xyXG4gIHNlbGVjdG9yOiAnW25nRmlsZURyb3BdJ1xyXG59KVxyXG5leHBvcnQgY2xhc3MgTmdGaWxlRHJvcERpcmVjdGl2ZSBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcclxuICBASW5wdXQoKSBvcHRpb25zOiBVcGxvYWRlck9wdGlvbnM7XHJcbiAgQElucHV0KCkgdXBsb2FkSW5wdXQ6IEV2ZW50RW1pdHRlcjxVcGxvYWRJbnB1dD47XHJcbiAgQE91dHB1dCgpIHVwbG9hZE91dHB1dDogRXZlbnRFbWl0dGVyPFVwbG9hZE91dHB1dD47XHJcblxyXG4gIHVwbG9hZDogTmdVcGxvYWRlclNlcnZpY2U7XHJcbiAgZWw6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcblxyXG4gIF9zdWI6IFN1YnNjcmlwdGlvbltdO1xyXG5cclxuICBjb25zdHJ1Y3RvcihwdWJsaWMgZWxlbWVudFJlZjogRWxlbWVudFJlZikge1xyXG4gICAgdGhpcy51cGxvYWRPdXRwdXQgPSBuZXcgRXZlbnRFbWl0dGVyPFVwbG9hZE91dHB1dD4oKTtcclxuICB9XHJcblxyXG4gIG5nT25Jbml0KCkge1xyXG4gICAgdGhpcy5fc3ViID0gW107XHJcbiAgICBjb25zdCBjb25jdXJyZW5jeSA9IHRoaXMub3B0aW9ucyAmJiB0aGlzLm9wdGlvbnMuY29uY3VycmVuY3kgfHwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xyXG4gICAgY29uc3QgYWxsb3dlZENvbnRlbnRUeXBlcyA9IHRoaXMub3B0aW9ucyAmJiB0aGlzLm9wdGlvbnMuYWxsb3dlZENvbnRlbnRUeXBlcyB8fCBbJyonXTtcclxuICAgIGNvbnN0IG1heFVwbG9hZHMgPSB0aGlzLm9wdGlvbnMgJiYgdGhpcy5vcHRpb25zLm1heFVwbG9hZHMgfHwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xyXG4gICAgdGhpcy51cGxvYWQgPSBuZXcgTmdVcGxvYWRlclNlcnZpY2UoY29uY3VycmVuY3ksIGFsbG93ZWRDb250ZW50VHlwZXMsIG1heFVwbG9hZHMpO1xyXG5cclxuICAgIHRoaXMuZWwgPSB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcclxuXHJcbiAgICB0aGlzLl9zdWIucHVzaChcclxuICAgICAgdGhpcy51cGxvYWQuc2VydmljZUV2ZW50cy5zdWJzY3JpYmUoKGV2ZW50OiBVcGxvYWRPdXRwdXQpID0+IHtcclxuICAgICAgICB0aGlzLnVwbG9hZE91dHB1dC5lbWl0KGV2ZW50KTtcclxuICAgICAgfSlcclxuICAgICk7XHJcblxyXG4gICAgaWYgKHRoaXMudXBsb2FkSW5wdXQgaW5zdGFuY2VvZiBFdmVudEVtaXR0ZXIpIHtcclxuICAgICAgdGhpcy5fc3ViLnB1c2godGhpcy51cGxvYWQuaW5pdElucHV0RXZlbnRzKHRoaXMudXBsb2FkSW5wdXQpKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLnN0b3BFdmVudCwgZmFsc2UpO1xyXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdkcmFnZW50ZXInLCB0aGlzLnN0b3BFdmVudCwgZmFsc2UpO1xyXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIHRoaXMuc3RvcEV2ZW50LCBmYWxzZSk7XHJcbiAgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpIHtcclxuICAgIHRoaXMuX3N1Yi5mb3JFYWNoKHN1YiA9PiBzdWIudW5zdWJzY3JpYmUoKSk7XHJcbiAgfVxyXG5cclxuICBzdG9wRXZlbnQgPSAoZTogRXZlbnQpID0+IHtcclxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgfVxyXG5cclxuICBASG9zdExpc3RlbmVyKCdkcm9wJywgWyckZXZlbnQnXSlcclxuICBwdWJsaWMgb25Ecm9wKGU6IGFueSkge1xyXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICBjb25zdCBldmVudDogVXBsb2FkT3V0cHV0ID0geyB0eXBlOiAnZHJvcCcgfTtcclxuICAgIHRoaXMudXBsb2FkT3V0cHV0LmVtaXQoZXZlbnQpO1xyXG4gICAgdGhpcy51cGxvYWQuaGFuZGxlRmlsZXMoZS5kYXRhVHJhbnNmZXIuZmlsZXMpO1xyXG4gIH1cclxuXHJcbiAgQEhvc3RMaXN0ZW5lcignZHJhZ292ZXInLCBbJyRldmVudCddKVxyXG4gIHB1YmxpYyBvbkRyYWdPdmVyKGU6IEV2ZW50KSB7XHJcbiAgICBpZiAoIWUpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGV2ZW50OiBVcGxvYWRPdXRwdXQgPSB7IHR5cGU6ICdkcmFnT3ZlcicgfTtcclxuICAgIHRoaXMudXBsb2FkT3V0cHV0LmVtaXQoZXZlbnQpO1xyXG4gIH1cclxuXHJcbiAgQEhvc3RMaXN0ZW5lcignZHJhZ2xlYXZlJywgWyckZXZlbnQnXSlcclxuICBwdWJsaWMgb25EcmFnTGVhdmUoZTogRXZlbnQpIHtcclxuICAgIGlmICghZSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZXZlbnQ6IFVwbG9hZE91dHB1dCA9IHsgdHlwZTogJ2RyYWdPdXQnIH07XHJcbiAgICB0aGlzLnVwbG9hZE91dHB1dC5lbWl0KGV2ZW50KTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgRGlyZWN0aXZlLCBFbGVtZW50UmVmLCBFdmVudEVtaXR0ZXIsIElucHV0LCBPdXRwdXQsIE9uSW5pdCwgT25EZXN0cm95IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IFVwbG9hZE91dHB1dCwgVXBsb2FkZXJPcHRpb25zIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcclxuaW1wb3J0IHsgTmdVcGxvYWRlclNlcnZpY2UgfSBmcm9tICcuL25neC11cGxvYWRlci5jbGFzcyc7XHJcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xyXG5cclxuQERpcmVjdGl2ZSh7XHJcbiAgc2VsZWN0b3I6ICdbbmdGaWxlU2VsZWN0XSdcclxufSlcclxuZXhwb3J0IGNsYXNzIE5nRmlsZVNlbGVjdERpcmVjdGl2ZSBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcclxuICBASW5wdXQoKSBvcHRpb25zOiBVcGxvYWRlck9wdGlvbnM7XHJcbiAgQElucHV0KCkgdXBsb2FkSW5wdXQ6IEV2ZW50RW1pdHRlcjxhbnk+O1xyXG4gIEBPdXRwdXQoKSB1cGxvYWRPdXRwdXQ6IEV2ZW50RW1pdHRlcjxVcGxvYWRPdXRwdXQ+O1xyXG5cclxuICB1cGxvYWQ6IE5nVXBsb2FkZXJTZXJ2aWNlO1xyXG4gIGVsOiBIVE1MSW5wdXRFbGVtZW50O1xyXG5cclxuICBfc3ViOiBTdWJzY3JpcHRpb25bXTtcclxuXHJcbiAgY29uc3RydWN0b3IocHVibGljIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHtcclxuICAgIHRoaXMudXBsb2FkT3V0cHV0ID0gbmV3IEV2ZW50RW1pdHRlcjxVcGxvYWRPdXRwdXQ+KCk7XHJcbiAgfVxyXG5cclxuICBuZ09uSW5pdCgpIHtcclxuICAgIHRoaXMuX3N1YiA9IFtdO1xyXG4gICAgY29uc3QgY29uY3VycmVuY3kgPSB0aGlzLm9wdGlvbnMgJiYgdGhpcy5vcHRpb25zLmNvbmN1cnJlbmN5IHx8IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcclxuICAgIGNvbnN0IGFsbG93ZWRDb250ZW50VHlwZXMgPSB0aGlzLm9wdGlvbnMgJiYgdGhpcy5vcHRpb25zLmFsbG93ZWRDb250ZW50VHlwZXMgfHwgWycqJ107XHJcbiAgICBjb25zdCBtYXhVcGxvYWRzID0gdGhpcy5vcHRpb25zICYmIHRoaXMub3B0aW9ucy5tYXhVcGxvYWRzIHx8IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcclxuICAgIHRoaXMudXBsb2FkID0gbmV3IE5nVXBsb2FkZXJTZXJ2aWNlKGNvbmN1cnJlbmN5LCBhbGxvd2VkQ29udGVudFR5cGVzLCBtYXhVcGxvYWRzKTtcclxuXHJcbiAgICB0aGlzLmVsID0gdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuZmlsZUxpc3RlbmVyLCBmYWxzZSk7XHJcblxyXG4gICAgdGhpcy5fc3ViLnB1c2goXHJcbiAgICAgIHRoaXMudXBsb2FkLnNlcnZpY2VFdmVudHMuc3Vic2NyaWJlKChldmVudDogVXBsb2FkT3V0cHV0KSA9PiB7XHJcbiAgICAgICAgdGhpcy51cGxvYWRPdXRwdXQuZW1pdChldmVudCk7XHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG5cclxuICAgIGlmICh0aGlzLnVwbG9hZElucHV0IGluc3RhbmNlb2YgRXZlbnRFbWl0dGVyKSB7XHJcbiAgICAgIHRoaXMuX3N1Yi5wdXNoKHRoaXMudXBsb2FkLmluaXRJbnB1dEV2ZW50cyh0aGlzLnVwbG9hZElucHV0KSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpIHtcclxuICAgIGlmICh0aGlzLmVsKXtcclxuICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB0aGlzLmZpbGVMaXN0ZW5lciwgZmFsc2UpO1xyXG4gICAgICB0aGlzLl9zdWIuZm9yRWFjaChzdWIgPT4gc3ViLnVuc3Vic2NyaWJlKCkpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZmlsZUxpc3RlbmVyID0gKCkgPT4ge1xyXG4gICAgaWYgKHRoaXMuZWwuZmlsZXMpIHtcclxuICAgICAgdGhpcy51cGxvYWQuaGFuZGxlRmlsZXModGhpcy5lbC5maWxlcyk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IE5nRmlsZURyb3BEaXJlY3RpdmUgfSBmcm9tICcuL25nLWZpbGUtZHJvcC5kaXJlY3RpdmUnO1xyXG5pbXBvcnQgeyBOZ0ZpbGVTZWxlY3REaXJlY3RpdmUgfSBmcm9tICcuL25nLWZpbGUtc2VsZWN0LmRpcmVjdGl2ZSc7XHJcblxyXG5ATmdNb2R1bGUoe1xyXG4gIGRlY2xhcmF0aW9uczogW05nRmlsZURyb3BEaXJlY3RpdmUsIE5nRmlsZVNlbGVjdERpcmVjdGl2ZV0sXHJcbiAgZXhwb3J0czogW05nRmlsZURyb3BEaXJlY3RpdmUsIE5nRmlsZVNlbGVjdERpcmVjdGl2ZV1cclxufSlcclxuZXhwb3J0IGNsYXNzIE5neFVwbG9hZGVyTW9kdWxlIHsgfVxyXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFhRSxRQUFLO0lBQ0wsWUFBUztJQUNULE9BQUk7SUFDSixZQUFTOzs7Ozs7Ozs7Ozs7Ozs7QUNYWCx1QkFBOEIsS0FBYTtJQUN6QyxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7UUFDZixPQUFPLFFBQVEsQ0FBQztLQUNqQjs7UUFFSyxDQUFDLEdBQUcsSUFBSTs7UUFDUixLQUFLLEdBQWEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElB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