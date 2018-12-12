(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('rxjs'), require('rxjs/operators')) :
    typeof define === 'function' && define.amd ? define('ngx-uploader', ['exports', '@angular/core', 'rxjs', 'rxjs/operators'], factory) :
    (factory((global['ngx-uploader'] = {}),global.ng.core,global.rxjs,global.rxjs.operators));
}(this, (function (exports,core,rxjs,operators) { 'use strict';

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

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

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
            if (concurrency === void 0) {
                concurrency = Number.POSITIVE_INFINITY;
            }
            if (contentTypes === void 0) {
                contentTypes = ['*'];
            }
            if (maxUploads === void 0) {
                maxUploads = Number.POSITIVE_INFINITY;
            }
            var _this = this;
            this.queue = [];
            this.serviceEvents = new core.EventEmitter();
            this.uploadScheduler = new rxjs.Subject();
            this.subs = [];
            this.contentTypes = contentTypes;
            this.maxUploads = maxUploads;
            this.uploadScheduler
                .pipe(operators.mergeMap(function (upload) { return _this.startUpload(upload); }, concurrency))
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
                return new rxjs.Observable(function (observer) {
                    /** @type {?} */
                    var sub = _this.uploadFile(upload.file, upload.event)
                        .pipe(operators.finalize(function () {
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
                return new rxjs.Observable(function (observer) {
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
                        var uploadFile_1 = ( /** @type {?} */(file.nativeFile));
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
            this.uploadOutput = new core.EventEmitter();
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
                if (this.uploadInput instanceof core.EventEmitter) {
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
            { type: core.Directive, args: [{
                        selector: '[ngFileDrop]'
                    },] },
        ];
        NgFileDropDirective.ctorParameters = function () {
            return [
                { type: core.ElementRef }
            ];
        };
        NgFileDropDirective.propDecorators = {
            options: [{ type: core.Input }],
            uploadInput: [{ type: core.Input }],
            uploadOutput: [{ type: core.Output }],
            onDrop: [{ type: core.HostListener, args: ['drop', ['$event'],] }],
            onDragOver: [{ type: core.HostListener, args: ['dragover', ['$event'],] }],
            onDragLeave: [{ type: core.HostListener, args: ['dragleave', ['$event'],] }]
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
            this.uploadOutput = new core.EventEmitter();
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
                if (this.uploadInput instanceof core.EventEmitter) {
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
            { type: core.Directive, args: [{
                        selector: '[ngFileSelect]'
                    },] },
        ];
        NgFileSelectDirective.ctorParameters = function () {
            return [
                { type: core.ElementRef }
            ];
        };
        NgFileSelectDirective.propDecorators = {
            options: [{ type: core.Input }],
            uploadInput: [{ type: core.Input }],
            uploadOutput: [{ type: core.Output }]
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
            { type: core.NgModule, args: [{
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

    exports.UploadStatus = UploadStatus;
    exports.NgFileDropDirective = NgFileDropDirective;
    exports.NgFileSelectDirective = NgFileSelectDirective;
    exports.humanizeBytes = humanizeBytes;
    exports.NgUploaderService = NgUploaderService;
    exports.NgxUploaderModule = NgxUploaderModule;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LXVwbG9hZGVyLnVtZC5qcy5tYXAiLCJzb3VyY2VzIjpbIm5nOi8vbmd4LXVwbG9hZGVyL2xpYi9pbnRlcmZhY2VzLnRzIixudWxsLCJuZzovL25neC11cGxvYWRlci9saWIvbmd4LXVwbG9hZGVyLmNsYXNzLnRzIiwibmc6Ly9uZ3gtdXBsb2FkZXIvbGliL25nLWZpbGUtZHJvcC5kaXJlY3RpdmUudHMiLCJuZzovL25neC11cGxvYWRlci9saWIvbmctZmlsZS1zZWxlY3QuZGlyZWN0aXZlLnRzIiwibmc6Ly9uZ3gtdXBsb2FkZXIvbGliL25neC11cGxvYWRlci5tb2R1bGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFVwbG9hZGVyT3B0aW9ucyB7XHJcbiAgY29uY3VycmVuY3k6IG51bWJlcjtcclxuICBhbGxvd2VkQ29udGVudFR5cGVzPzogc3RyaW5nW107XHJcbiAgbWF4VXBsb2Fkcz86IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBCbG9iRmlsZSBleHRlbmRzIEJsb2Ige1xyXG4gIG5hbWU6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGVudW0gVXBsb2FkU3RhdHVzIHtcclxuICBRdWV1ZSxcclxuICBVcGxvYWRpbmcsXHJcbiAgRG9uZSxcclxuICBDYW5jZWxsZWRcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBVcGxvYWRQcm9ncmVzcyB7XHJcbiAgc3RhdHVzOiBVcGxvYWRTdGF0dXM7XHJcbiAgZGF0YT86IHtcclxuICAgIHBlcmNlbnRhZ2U6IG51bWJlcjtcclxuICAgIHNwZWVkOiBudW1iZXI7XHJcbiAgICBzcGVlZEh1bWFuOiBzdHJpbmc7XHJcbiAgICBzdGFydFRpbWU6IG51bWJlciB8IG51bGw7XHJcbiAgICBlbmRUaW1lOiBudW1iZXIgfCBudWxsO1xyXG4gICAgZXRhOiBudW1iZXIgfCBudWxsO1xyXG4gICAgZXRhSHVtYW46IHN0cmluZyB8IG51bGw7XHJcbiAgfTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBVcGxvYWRGaWxlIHtcclxuICBpZDogc3RyaW5nO1xyXG4gIGZpbGVJbmRleDogbnVtYmVyO1xyXG4gIGxhc3RNb2RpZmllZERhdGU6IERhdGU7XHJcbiAgbmFtZTogc3RyaW5nO1xyXG4gIHNpemU6IG51bWJlcjtcclxuICB0eXBlOiBzdHJpbmc7XHJcbiAgZm9ybTogRm9ybURhdGE7XHJcbiAgcHJvZ3Jlc3M6IFVwbG9hZFByb2dyZXNzO1xyXG4gIHJlc3BvbnNlPzogYW55O1xyXG4gIHJlc3BvbnNlU3RhdHVzPzogbnVtYmVyO1xyXG4gIHN1Yj86IFN1YnNjcmlwdGlvbiB8IGFueTtcclxuICBuYXRpdmVGaWxlPzogRmlsZTtcclxuICByZXNwb25zZUhlYWRlcnM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFVwbG9hZE91dHB1dCB7XHJcbiAgdHlwZTogJ2FkZGVkVG9RdWV1ZScgfCAnYWxsQWRkZWRUb1F1ZXVlJyB8ICd1cGxvYWRpbmcnIHwgJ2RvbmUnIHwgJ3N0YXJ0JyB8ICdjYW5jZWxsZWQnIHwgJ2RyYWdPdmVyJ1xyXG4gICAgICB8ICdkcmFnT3V0JyB8ICdkcm9wJyB8ICdyZW1vdmVkJyB8ICdyZW1vdmVkQWxsJyB8ICdyZWplY3RlZCc7XHJcbiAgZmlsZT86IFVwbG9hZEZpbGU7XHJcbiAgbmF0aXZlRmlsZT86IEZpbGU7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVXBsb2FkSW5wdXQge1xyXG4gIHR5cGU6ICd1cGxvYWRBbGwnIHwgJ3VwbG9hZEZpbGUnIHwgJ2NhbmNlbCcgfCAnY2FuY2VsQWxsJyB8ICdyZW1vdmUnIHwgJ3JlbW92ZUFsbCc7XHJcbiAgdXJsPzogc3RyaW5nO1xyXG4gIG1ldGhvZD86IHN0cmluZztcclxuICBpZD86IHN0cmluZztcclxuICBmaWVsZE5hbWU/OiBzdHJpbmc7XHJcbiAgZmlsZUluZGV4PzogbnVtYmVyO1xyXG4gIGZpbGU/OiBVcGxvYWRGaWxlO1xyXG4gIGRhdGE/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IEJsb2IgfTtcclxuICBoZWFkZXJzPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcclxuICBpbmNsdWRlV2ViS2l0Rm9ybUJvdW5kYXJ5PzogYm9vbGVhbjsgLy8gSWYgZmFsc2UsIG9ubHkgdGhlIGZpbGUgaXMgc2VuZCB0cm91Z2ggeGhyLnNlbmQgKFdlYktpdEZvcm1Cb3VuZGFyeSBpcyBvbWl0KVxyXG4gIHdpdGhDcmVkZW50aWFscz86IGJvb2xlYW47XHJcbn1cclxuIiwiLyohICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbkNvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2VcclxudGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGVcclxuTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcclxuXHJcblRISVMgQ09ERSBJUyBQUk9WSURFRCBPTiBBTiAqQVMgSVMqIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTllcclxuS0lORCwgRUlUSEVSIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIFdJVEhPVVQgTElNSVRBVElPTiBBTlkgSU1QTElFRFxyXG5XQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgVElUTEUsIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLFxyXG5NRVJDSEFOVEFCTElUWSBPUiBOT04tSU5GUklOR0VNRU5ULlxyXG5cclxuU2VlIHRoZSBBcGFjaGUgVmVyc2lvbiAyLjAgTGljZW5zZSBmb3Igc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zXHJcbmFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cclxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cclxuLyogZ2xvYmFsIFJlZmxlY3QsIFByb21pc2UgKi9cclxuXHJcbnZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24oZCwgYikge1xyXG4gICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcclxuICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXh0ZW5kcyhkLCBiKSB7XHJcbiAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XHJcbiAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgX19hc3NpZ24gPSBmdW5jdGlvbigpIHtcclxuICAgIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiBfX2Fzc2lnbih0KSB7XHJcbiAgICAgICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XHJcbiAgICAgICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSkgdFtwXSA9IHNbcF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIF9fYXNzaWduLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3Jlc3QocywgZSkge1xyXG4gICAgdmFyIHQgPSB7fTtcclxuICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSAmJiBlLmluZGV4T2YocCkgPCAwKVxyXG4gICAgICAgIHRbcF0gPSBzW3BdO1xyXG4gICAgaWYgKHMgIT0gbnVsbCAmJiB0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyA9PT0gXCJmdW5jdGlvblwiKVxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBwID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhzKTsgaSA8IHAubGVuZ3RoOyBpKyspIGlmIChlLmluZGV4T2YocFtpXSkgPCAwKVxyXG4gICAgICAgICAgICB0W3BbaV1dID0gc1twW2ldXTtcclxuICAgIHJldHVybiB0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xyXG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XHJcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xyXG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcGFyYW0ocGFyYW1JbmRleCwgZGVjb3JhdG9yKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwga2V5KSB7IGRlY29yYXRvcih0YXJnZXQsIGtleSwgcGFyYW1JbmRleCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpIHtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0ZXIodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHJlc3VsdC52YWx1ZSk7IH0pLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZ2VuZXJhdG9yKHRoaXNBcmcsIGJvZHkpIHtcclxuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XHJcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xyXG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcclxuICAgICAgICB3aGlsZSAoXykgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xyXG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XHJcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxyXG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHBvcnRTdGFyKG0sIGV4cG9ydHMpIHtcclxuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKCFleHBvcnRzLmhhc093blByb3BlcnR5KHApKSBleHBvcnRzW3BdID0gbVtwXTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fdmFsdWVzKG8pIHtcclxuICAgIHZhciBtID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXSwgaSA9IDA7XHJcbiAgICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAobyAmJiBpID49IG8ubGVuZ3RoKSBvID0gdm9pZCAwO1xyXG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogbyAmJiBvW2krK10sIGRvbmU6ICFvIH07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVhZChvLCBuKSB7XHJcbiAgICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl07XHJcbiAgICBpZiAoIW0pIHJldHVybiBvO1xyXG4gICAgdmFyIGkgPSBtLmNhbGwobyksIHIsIGFyID0gW10sIGU7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHdoaWxlICgobiA9PT0gdm9pZCAwIHx8IG4tLSA+IDApICYmICEociA9IGkubmV4dCgpKS5kb25lKSBhci5wdXNoKHIudmFsdWUpO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGVycm9yKSB7IGUgPSB7IGVycm9yOiBlcnJvciB9OyB9XHJcbiAgICBmaW5hbGx5IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAociAmJiAhci5kb25lICYmIChtID0gaVtcInJldHVyblwiXSkpIG0uY2FsbChpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmluYWxseSB7IGlmIChlKSB0aHJvdyBlLmVycm9yOyB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZCgpIHtcclxuICAgIGZvciAodmFyIGFyID0gW10sIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgIGFyID0gYXIuY29uY2F0KF9fcmVhZChhcmd1bWVudHNbaV0pKTtcclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXQodikge1xyXG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBfX2F3YWl0ID8gKHRoaXMudiA9IHYsIHRoaXMpIDogbmV3IF9fYXdhaXQodik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jR2VuZXJhdG9yKHRoaXNBcmcsIF9hcmd1bWVudHMsIGdlbmVyYXRvcikge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBnID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pLCBpLCBxID0gW107XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaWYgKGdbbl0pIGlbbl0gPSBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKGEsIGIpIHsgcS5wdXNoKFtuLCB2LCBhLCBiXSkgPiAxIHx8IHJlc3VtZShuLCB2KTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHJlc3VtZShuLCB2KSB7IHRyeSB7IHN0ZXAoZ1tuXSh2KSk7IH0gY2F0Y2ggKGUpIHsgc2V0dGxlKHFbMF1bM10sIGUpOyB9IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAocikgeyByLnZhbHVlIGluc3RhbmNlb2YgX19hd2FpdCA/IFByb21pc2UucmVzb2x2ZShyLnZhbHVlLnYpLnRoZW4oZnVsZmlsbCwgcmVqZWN0KSA6IHNldHRsZShxWzBdWzJdLCByKTsgfVxyXG4gICAgZnVuY3Rpb24gZnVsZmlsbCh2YWx1ZSkgeyByZXN1bWUoXCJuZXh0XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gcmVqZWN0KHZhbHVlKSB7IHJlc3VtZShcInRocm93XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKGYsIHYpIHsgaWYgKGYodiksIHEuc2hpZnQoKSwgcS5sZW5ndGgpIHJlc3VtZShxWzBdWzBdLCBxWzBdWzFdKTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0RlbGVnYXRvcihvKSB7XHJcbiAgICB2YXIgaSwgcDtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiwgZnVuY3Rpb24gKGUpIHsgdGhyb3cgZTsgfSksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4sIGYpIHsgaVtuXSA9IG9bbl0gPyBmdW5jdGlvbiAodikgeyByZXR1cm4gKHAgPSAhcCkgPyB7IHZhbHVlOiBfX2F3YWl0KG9bbl0odikpLCBkb25lOiBuID09PSBcInJldHVyblwiIH0gOiBmID8gZih2KSA6IHY7IH0gOiBmOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jVmFsdWVzKG8pIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgbSA9IG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdLCBpO1xyXG4gICAgcmV0dXJuIG0gPyBtLmNhbGwobykgOiAobyA9IHR5cGVvZiBfX3ZhbHVlcyA9PT0gXCJmdW5jdGlvblwiID8gX192YWx1ZXMobykgOiBvW1N5bWJvbC5pdGVyYXRvcl0oKSwgaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGkpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlbbl0gPSBvW25dICYmIGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IHYgPSBvW25dKHYpLCBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCB2LmRvbmUsIHYudmFsdWUpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgZCwgdikgeyBQcm9taXNlLnJlc29sdmUodikudGhlbihmdW5jdGlvbih2KSB7IHJlc29sdmUoeyB2YWx1ZTogdiwgZG9uZTogZCB9KTsgfSwgcmVqZWN0KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tYWtlVGVtcGxhdGVPYmplY3QoY29va2VkLCByYXcpIHtcclxuICAgIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvb2tlZCwgXCJyYXdcIiwgeyB2YWx1ZTogcmF3IH0pOyB9IGVsc2UgeyBjb29rZWQucmF3ID0gcmF3OyB9XHJcbiAgICByZXR1cm4gY29va2VkO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0U3Rhcihtb2QpIHtcclxuICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XHJcbiAgICB2YXIgcmVzdWx0ID0ge307XHJcbiAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgaW4gbW9kKSBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwobW9kLCBrKSkgcmVzdWx0W2tdID0gbW9kW2tdO1xyXG4gICAgcmVzdWx0LmRlZmF1bHQgPSBtb2Q7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnREZWZhdWx0KG1vZCkge1xyXG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBkZWZhdWx0OiBtb2QgfTtcclxufVxyXG4iLCJpbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3ViamVjdCwgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IG1lcmdlTWFwLCBmaW5hbGl6ZSB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuaW1wb3J0IHsgVXBsb2FkRmlsZSwgVXBsb2FkT3V0cHV0LCBVcGxvYWRJbnB1dCwgVXBsb2FkU3RhdHVzLCBCbG9iRmlsZSB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaHVtYW5pemVCeXRlcyhieXRlczogbnVtYmVyKTogc3RyaW5nIHtcclxuICBpZiAoYnl0ZXMgPT09IDApIHtcclxuICAgIHJldHVybiAnMCBCeXRlJztcclxuICB9XHJcblxyXG4gIGNvbnN0IGsgPSAxMDI0O1xyXG4gIGNvbnN0IHNpemVzOiBzdHJpbmdbXSA9IFsnQnl0ZXMnLCAnS0InLCAnTUInLCAnR0InLCAnVEInLCAnUEInXTtcclxuICBjb25zdCBpOiBudW1iZXIgPSBNYXRoLmZsb29yKE1hdGgubG9nKGJ5dGVzKSAvIE1hdGgubG9nKGspKTtcclxuXHJcbiAgcmV0dXJuIHBhcnNlRmxvYXQoKGJ5dGVzIC8gTWF0aC5wb3coaywgaSkpLnRvRml4ZWQoMikpICsgJyAnICsgc2l6ZXNbaV07XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBOZ1VwbG9hZGVyU2VydmljZSB7XHJcbiAgcXVldWU6IFVwbG9hZEZpbGVbXTtcclxuICBzZXJ2aWNlRXZlbnRzOiBFdmVudEVtaXR0ZXI8VXBsb2FkT3V0cHV0PjtcclxuICB1cGxvYWRTY2hlZHVsZXI6IFN1YmplY3Q8eyBmaWxlOiBVcGxvYWRGaWxlLCBldmVudDogVXBsb2FkSW5wdXQgfT47XHJcbiAgc3ViczogeyBpZDogc3RyaW5nLCBzdWI6IFN1YnNjcmlwdGlvbiB9W107XHJcbiAgY29udGVudFR5cGVzOiBzdHJpbmdbXTtcclxuICBtYXhVcGxvYWRzOiBudW1iZXI7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGNvbmN1cnJlbmN5OiBudW1iZXIgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksIGNvbnRlbnRUeXBlczogc3RyaW5nW10gPSBbJyonXSwgbWF4VXBsb2FkczogbnVtYmVyID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKSB7XHJcbiAgICB0aGlzLnF1ZXVlID0gW107XHJcbiAgICB0aGlzLnNlcnZpY2VFdmVudHMgPSBuZXcgRXZlbnRFbWl0dGVyPFVwbG9hZE91dHB1dD4oKTtcclxuICAgIHRoaXMudXBsb2FkU2NoZWR1bGVyID0gbmV3IFN1YmplY3QoKTtcclxuICAgIHRoaXMuc3VicyA9IFtdO1xyXG4gICAgdGhpcy5jb250ZW50VHlwZXMgPSBjb250ZW50VHlwZXM7XHJcbiAgICB0aGlzLm1heFVwbG9hZHMgPSBtYXhVcGxvYWRzO1xyXG5cclxuICAgIHRoaXMudXBsb2FkU2NoZWR1bGVyXHJcbiAgICAgIC5waXBlKFxyXG4gICAgICAgIG1lcmdlTWFwKHVwbG9hZCA9PiB0aGlzLnN0YXJ0VXBsb2FkKHVwbG9hZCksIGNvbmN1cnJlbmN5KVxyXG4gICAgICApXHJcbiAgICAgIC5zdWJzY3JpYmUodXBsb2FkT3V0cHV0ID0+IHRoaXMuc2VydmljZUV2ZW50cy5lbWl0KHVwbG9hZE91dHB1dCkpO1xyXG4gIH1cclxuXHJcbiAgaGFuZGxlRmlsZXMoaW5jb21pbmdGaWxlczogRmlsZUxpc3QpOiB2b2lkIHtcclxuICAgIGNvbnN0IGFsbG93ZWRJbmNvbWluZ0ZpbGVzOiBGaWxlW10gPSBbXS5yZWR1Y2UuY2FsbChpbmNvbWluZ0ZpbGVzLCAoYWNjOiBGaWxlW10sIGNoZWNrRmlsZTogRmlsZSwgaTogbnVtYmVyKSA9PiB7XHJcbiAgICAgIGNvbnN0IGZ1dHVyZVF1ZXVlTGVuZ3RoID0gYWNjLmxlbmd0aCArIHRoaXMucXVldWUubGVuZ3RoICsgMTtcclxuICAgICAgaWYgKHRoaXMuaXNDb250ZW50VHlwZUFsbG93ZWQoY2hlY2tGaWxlLnR5cGUpICYmIGZ1dHVyZVF1ZXVlTGVuZ3RoIDw9IHRoaXMubWF4VXBsb2Fkcykge1xyXG4gICAgICAgIGFjYyA9IGFjYy5jb25jYXQoY2hlY2tGaWxlKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCByZWplY3RlZEZpbGU6IFVwbG9hZEZpbGUgPSB0aGlzLm1ha2VVcGxvYWRGaWxlKGNoZWNrRmlsZSwgaSk7XHJcbiAgICAgICAgdGhpcy5zZXJ2aWNlRXZlbnRzLmVtaXQoeyB0eXBlOiAncmVqZWN0ZWQnLCBmaWxlOiByZWplY3RlZEZpbGUgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBhY2M7XHJcbiAgICB9LCBbXSk7XHJcblxyXG4gICAgdGhpcy5xdWV1ZS5wdXNoKC4uLltdLm1hcC5jYWxsKGFsbG93ZWRJbmNvbWluZ0ZpbGVzLCAoZmlsZTogRmlsZSwgaTogbnVtYmVyKSA9PiB7XHJcbiAgICAgIGNvbnN0IHVwbG9hZEZpbGU6IFVwbG9hZEZpbGUgPSB0aGlzLm1ha2VVcGxvYWRGaWxlKGZpbGUsIGkpO1xyXG4gICAgICB0aGlzLnNlcnZpY2VFdmVudHMuZW1pdCh7IHR5cGU6ICdhZGRlZFRvUXVldWUnLCBmaWxlOiB1cGxvYWRGaWxlIH0pO1xyXG4gICAgICByZXR1cm4gdXBsb2FkRmlsZTtcclxuICAgIH0pKTtcclxuXHJcbiAgICB0aGlzLnNlcnZpY2VFdmVudHMuZW1pdCh7IHR5cGU6ICdhbGxBZGRlZFRvUXVldWUnIH0pO1xyXG4gIH1cclxuXHJcbiAgaW5pdElucHV0RXZlbnRzKGlucHV0OiBFdmVudEVtaXR0ZXI8VXBsb2FkSW5wdXQ+KTogU3Vic2NyaXB0aW9uIHtcclxuICAgIHJldHVybiBpbnB1dC5zdWJzY3JpYmUoKGV2ZW50OiBVcGxvYWRJbnB1dCkgPT4ge1xyXG4gICAgICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcclxuICAgICAgICBjYXNlICd1cGxvYWRGaWxlJzpcclxuICAgICAgICAgIGNvbnN0IHVwbG9hZEZpbGVJbmRleCA9IHRoaXMucXVldWUuZmluZEluZGV4KGZpbGUgPT4gZmlsZSA9PT0gZXZlbnQuZmlsZSk7XHJcbiAgICAgICAgICBpZiAodXBsb2FkRmlsZUluZGV4ICE9PSAtMSAmJiBldmVudC5maWxlKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBsb2FkU2NoZWR1bGVyLm5leHQoeyBmaWxlOiB0aGlzLnF1ZXVlW3VwbG9hZEZpbGVJbmRleF0sIGV2ZW50OiBldmVudCB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3VwbG9hZEFsbCc6XHJcbiAgICAgICAgICBjb25zdCBmaWxlcyA9IHRoaXMucXVldWUuZmlsdGVyKGZpbGUgPT4gZmlsZS5wcm9ncmVzcy5zdGF0dXMgPT09IFVwbG9hZFN0YXR1cy5RdWV1ZSk7XHJcbiAgICAgICAgICBmaWxlcy5mb3JFYWNoKGZpbGUgPT4gdGhpcy51cGxvYWRTY2hlZHVsZXIubmV4dCh7IGZpbGU6IGZpbGUsIGV2ZW50OiBldmVudCB9KSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdjYW5jZWwnOlxyXG4gICAgICAgICAgY29uc3QgaWQgPSBldmVudC5pZCB8fCBudWxsO1xyXG4gICAgICAgICAgaWYgKCFpZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb25zdCBzdWJzID0gdGhpcy5zdWJzLmZpbHRlcihzdWIgPT4gc3ViLmlkID09PSBpZCk7XHJcbiAgICAgICAgICBzdWJzLmZvckVhY2goc3ViID0+IHtcclxuICAgICAgICAgICAgaWYgKHN1Yi5zdWIpIHtcclxuICAgICAgICAgICAgICBzdWIuc3ViLnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgICAgICAgICAgY29uc3QgZmlsZUluZGV4ID0gdGhpcy5xdWV1ZS5maW5kSW5kZXgoZmlsZSA9PiBmaWxlLmlkID09PSBpZCk7XHJcbiAgICAgICAgICAgICAgaWYgKGZpbGVJbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucXVldWVbZmlsZUluZGV4XS5wcm9ncmVzcy5zdGF0dXMgPSBVcGxvYWRTdGF0dXMuQ2FuY2VsbGVkO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXJ2aWNlRXZlbnRzLmVtaXQoe3R5cGU6ICdjYW5jZWxsZWQnLCBmaWxlOiB0aGlzLnF1ZXVlW2ZpbGVJbmRleF19KTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnY2FuY2VsQWxsJzpcclxuICAgICAgICAgIHRoaXMuc3Vicy5mb3JFYWNoKHN1YiA9PiB7XHJcbiAgICAgICAgICAgIGlmIChzdWIuc3ViKSB7XHJcbiAgICAgICAgICAgICAgc3ViLnN1Yi51bnN1YnNjcmliZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBmaWxlID0gdGhpcy5xdWV1ZS5maW5kKHVwbG9hZEZpbGUgPT4gdXBsb2FkRmlsZS5pZCA9PT0gc3ViLmlkKTtcclxuICAgICAgICAgICAgaWYgKGZpbGUpIHtcclxuICAgICAgICAgICAgICBmaWxlLnByb2dyZXNzLnN0YXR1cyA9IFVwbG9hZFN0YXR1cy5DYW5jZWxsZWQ7XHJcbiAgICAgICAgICAgICAgdGhpcy5zZXJ2aWNlRXZlbnRzLmVtaXQoeyB0eXBlOiAnY2FuY2VsbGVkJywgZmlsZTogZmlsZSB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdyZW1vdmUnOlxyXG4gICAgICAgICAgaWYgKCFldmVudC5pZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgY29uc3QgaSA9IHRoaXMucXVldWUuZmluZEluZGV4KGZpbGUgPT4gZmlsZS5pZCA9PT0gZXZlbnQuaWQpO1xyXG4gICAgICAgICAgaWYgKGkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpbGUgPSB0aGlzLnF1ZXVlW2ldO1xyXG4gICAgICAgICAgICB0aGlzLnF1ZXVlLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgdGhpcy5zZXJ2aWNlRXZlbnRzLmVtaXQoeyB0eXBlOiAncmVtb3ZlZCcsIGZpbGU6IGZpbGUgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdyZW1vdmVBbGwnOlxyXG4gICAgICAgICAgaWYgKHRoaXMucXVldWUubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMucXVldWUgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5zZXJ2aWNlRXZlbnRzLmVtaXQoeyB0eXBlOiAncmVtb3ZlZEFsbCcgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBzdGFydFVwbG9hZCh1cGxvYWQ6IHsgZmlsZTogVXBsb2FkRmlsZSwgZXZlbnQ6IFVwbG9hZElucHV0IH0pOiBPYnNlcnZhYmxlPFVwbG9hZE91dHB1dD4ge1xyXG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKG9ic2VydmVyID0+IHtcclxuICAgICAgY29uc3Qgc3ViID0gdGhpcy51cGxvYWRGaWxlKHVwbG9hZC5maWxlLCB1cGxvYWQuZXZlbnQpXHJcbiAgICAgICAgLnBpcGUoZmluYWxpemUoKCkgPT4ge1xyXG4gICAgICAgICAgaWYgKCFvYnNlcnZlci5jbG9zZWQpIHtcclxuICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KSlcclxuICAgICAgICAuc3Vic2NyaWJlKG91dHB1dCA9PiB7XHJcbiAgICAgICAgICBvYnNlcnZlci5uZXh0KG91dHB1dCk7XHJcbiAgICAgICAgfSwgZXJyID0+IHtcclxuICAgICAgICAgIG9ic2VydmVyLmVycm9yKGVycik7XHJcbiAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xyXG4gICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnN1YnMucHVzaCh7IGlkOiB1cGxvYWQuZmlsZS5pZCwgc3ViOiBzdWIgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHVwbG9hZEZpbGUoZmlsZTogVXBsb2FkRmlsZSwgZXZlbnQ6IFVwbG9hZElucHV0KTogT2JzZXJ2YWJsZTxVcGxvYWRPdXRwdXQ+IHtcclxuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZShvYnNlcnZlciA9PiB7XHJcbiAgICAgIGNvbnN0IHVybCA9IGV2ZW50LnVybCB8fCAnJztcclxuICAgICAgY29uc3QgbWV0aG9kID0gZXZlbnQubWV0aG9kIHx8ICdQT1NUJztcclxuICAgICAgY29uc3QgZGF0YSA9IGV2ZW50LmRhdGEgfHwge307XHJcbiAgICAgIGNvbnN0IGhlYWRlcnMgPSBldmVudC5oZWFkZXJzIHx8IHt9O1xyXG5cclxuICAgICAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgIGNvbnN0IHRpbWU6IG51bWJlciA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgICBsZXQgcHJvZ3Jlc3NTdGFydFRpbWU6IG51bWJlciA9IChmaWxlLnByb2dyZXNzLmRhdGEgJiYgZmlsZS5wcm9ncmVzcy5kYXRhLnN0YXJ0VGltZSkgfHwgdGltZTtcclxuICAgICAgbGV0IHNwZWVkID0gMDtcclxuICAgICAgbGV0IGV0YTogbnVtYmVyIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgICB4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgKGU6IFByb2dyZXNzRXZlbnQpID0+IHtcclxuICAgICAgICBpZiAoZS5sZW5ndGhDb21wdXRhYmxlKSB7XHJcbiAgICAgICAgICBjb25zdCBwZXJjZW50YWdlID0gTWF0aC5yb3VuZCgoZS5sb2FkZWQgKiAxMDApIC8gZS50b3RhbCk7XHJcbiAgICAgICAgICBjb25zdCBkaWZmID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0aW1lO1xyXG4gICAgICAgICAgc3BlZWQgPSBNYXRoLnJvdW5kKGUubG9hZGVkIC8gZGlmZiAqIDEwMDApO1xyXG4gICAgICAgICAgcHJvZ3Jlc3NTdGFydFRpbWUgPSAoZmlsZS5wcm9ncmVzcy5kYXRhICYmIGZpbGUucHJvZ3Jlc3MuZGF0YS5zdGFydFRpbWUpIHx8IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgICAgICAgZXRhID0gTWF0aC5jZWlsKChlLnRvdGFsIC0gZS5sb2FkZWQpIC8gc3BlZWQpO1xyXG5cclxuICAgICAgICAgIGZpbGUucHJvZ3Jlc3MgPSB7XHJcbiAgICAgICAgICAgIHN0YXR1czogVXBsb2FkU3RhdHVzLlVwbG9hZGluZyxcclxuICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgIHBlcmNlbnRhZ2U6IHBlcmNlbnRhZ2UsXHJcbiAgICAgICAgICAgICAgc3BlZWQ6IHNwZWVkLFxyXG4gICAgICAgICAgICAgIHNwZWVkSHVtYW46IGAke2h1bWFuaXplQnl0ZXMoc3BlZWQpfS9zYCxcclxuICAgICAgICAgICAgICBzdGFydFRpbWU6IHByb2dyZXNzU3RhcnRUaW1lLFxyXG4gICAgICAgICAgICAgIGVuZFRpbWU6IG51bGwsXHJcbiAgICAgICAgICAgICAgZXRhOiBldGEsXHJcbiAgICAgICAgICAgICAgZXRhSHVtYW46IHRoaXMuc2Vjb25kc1RvSHVtYW4oZXRhKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgIG9ic2VydmVyLm5leHQoeyB0eXBlOiAndXBsb2FkaW5nJywgZmlsZTogZmlsZSB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sIGZhbHNlKTtcclxuXHJcbiAgICAgIHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCAoZTogRXZlbnQpID0+IHtcclxuICAgICAgICBvYnNlcnZlci5lcnJvcihlKTtcclxuICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSA9PiB7XHJcbiAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSBYTUxIdHRwUmVxdWVzdC5ET05FKSB7XHJcbiAgICAgICAgICBjb25zdCBzcGVlZEF2ZXJhZ2UgPSBNYXRoLnJvdW5kKGZpbGUuc2l6ZSAvIChuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHByb2dyZXNzU3RhcnRUaW1lKSAqIDEwMDApO1xyXG4gICAgICAgICAgZmlsZS5wcm9ncmVzcyA9IHtcclxuICAgICAgICAgICAgc3RhdHVzOiBVcGxvYWRTdGF0dXMuRG9uZSxcclxuICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgIHBlcmNlbnRhZ2U6IDEwMCxcclxuICAgICAgICAgICAgICBzcGVlZDogc3BlZWRBdmVyYWdlLFxyXG4gICAgICAgICAgICAgIHNwZWVkSHVtYW46IGAke2h1bWFuaXplQnl0ZXMoc3BlZWRBdmVyYWdlKX0vc2AsXHJcbiAgICAgICAgICAgICAgc3RhcnRUaW1lOiBwcm9ncmVzc1N0YXJ0VGltZSxcclxuICAgICAgICAgICAgICBlbmRUaW1lOiBuZXcgRGF0ZSgpLmdldFRpbWUoKSxcclxuICAgICAgICAgICAgICBldGE6IGV0YSxcclxuICAgICAgICAgICAgICBldGFIdW1hbjogdGhpcy5zZWNvbmRzVG9IdW1hbihldGEgfHwgMClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICBmaWxlLnJlc3BvbnNlU3RhdHVzID0geGhyLnN0YXR1cztcclxuXHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBmaWxlLnJlc3BvbnNlID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2UpO1xyXG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBmaWxlLnJlc3BvbnNlID0geGhyLnJlc3BvbnNlO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGZpbGUucmVzcG9uc2VIZWFkZXJzID0gdGhpcy5wYXJzZVJlc3BvbnNlSGVhZGVycyh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpO1xyXG5cclxuICAgICAgICAgIG9ic2VydmVyLm5leHQoeyB0eXBlOiAnZG9uZScsIGZpbGU6IGZpbGUgfSk7XHJcblxyXG4gICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG4gICAgICB4aHIub3BlbihtZXRob2QsIHVybCwgdHJ1ZSk7XHJcbiAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSBldmVudC53aXRoQ3JlZGVudGlhbHMgPyB0cnVlIDogZmFsc2U7XHJcblxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHVwbG9hZEZpbGUgPSA8QmxvYkZpbGU+ZmlsZS5uYXRpdmVGaWxlO1xyXG4gICAgICAgIGNvbnN0IHVwbG9hZEluZGV4ID0gdGhpcy5xdWV1ZS5maW5kSW5kZXgob3V0RmlsZSA9PiBvdXRGaWxlLm5hdGl2ZUZpbGUgPT09IHVwbG9hZEZpbGUpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5xdWV1ZVt1cGxvYWRJbmRleF0ucHJvZ3Jlc3Muc3RhdHVzID09PSBVcGxvYWRTdGF0dXMuQ2FuY2VsbGVkKSB7XHJcbiAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgT2JqZWN0LmtleXMoaGVhZGVycykuZm9yRWFjaChrZXkgPT4geGhyLnNldFJlcXVlc3RIZWFkZXIoa2V5LCBoZWFkZXJzW2tleV0pKTtcclxuXHJcbiAgICAgICAgbGV0IGJvZHlUb1NlbmQ7XHJcblxyXG4gICAgICAgIGlmIChldmVudC5pbmNsdWRlV2ViS2l0Rm9ybUJvdW5kYXJ5ICE9PSBmYWxzZSkge1xyXG4gICAgICAgICAgT2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaChrZXkgPT4gZmlsZS5mb3JtLmFwcGVuZChrZXksIGRhdGFba2V5XSkpO1xyXG4gICAgICAgICAgZmlsZS5mb3JtLmFwcGVuZChldmVudC5maWVsZE5hbWUgfHwgJ2ZpbGUnLCB1cGxvYWRGaWxlLCB1cGxvYWRGaWxlLm5hbWUpO1xyXG4gICAgICAgICAgYm9keVRvU2VuZCA9IGZpbGUuZm9ybTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYm9keVRvU2VuZCA9IHVwbG9hZEZpbGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnNlcnZpY2VFdmVudHMuZW1pdCh7IHR5cGU6ICdzdGFydCcsIGZpbGU6IGZpbGUgfSk7XHJcbiAgICAgICAgeGhyLnNlbmQoYm9keVRvU2VuZCk7XHJcbiAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICAgIHhoci5hYm9ydCgpO1xyXG4gICAgICB9O1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBzZWNvbmRzVG9IdW1hbihzZWM6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gbmV3IERhdGUoc2VjICogMTAwMCkudG9JU09TdHJpbmcoKS5zdWJzdHIoMTEsIDgpO1xyXG4gIH1cclxuXHJcbiAgZ2VuZXJhdGVJZCgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZyg3KTtcclxuICB9XHJcblxyXG4gIHNldENvbnRlbnRUeXBlcyhjb250ZW50VHlwZXM6IHN0cmluZ1tdKTogdm9pZCB7XHJcbiAgICBpZiAodHlwZW9mIGNvbnRlbnRUeXBlcyAhPSAndW5kZWZpbmVkJyAmJiBjb250ZW50VHlwZXMgaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICBpZiAoY29udGVudFR5cGVzLmZpbmQoKHR5cGU6IHN0cmluZykgPT4gdHlwZSA9PT0gJyonKSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgdGhpcy5jb250ZW50VHlwZXMgPSBbJyonXTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmNvbnRlbnRUeXBlcyA9IGNvbnRlbnRUeXBlcztcclxuICAgICAgfVxyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0aGlzLmNvbnRlbnRUeXBlcyA9IFsnKiddO1xyXG4gIH1cclxuXHJcbiAgYWxsQ29udGVudFR5cGVzQWxsb3dlZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmNvbnRlbnRUeXBlcy5maW5kKCh0eXBlOiBzdHJpbmcpID0+IHR5cGUgPT09ICcqJykgIT09IHVuZGVmaW5lZDtcclxuICB9XHJcblxyXG4gIGlzQ29udGVudFR5cGVBbGxvd2VkKG1pbWV0eXBlOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIGlmICh0aGlzLmFsbENvbnRlbnRUeXBlc0FsbG93ZWQoKSkge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLmNvbnRlbnRUeXBlcy5maW5kKCh0eXBlOiBzdHJpbmcpID0+IHR5cGUgPT09IG1pbWV0eXBlKSAhPT0gdW5kZWZpbmVkO1xyXG4gIH1cclxuXHJcbiAgbWFrZVVwbG9hZEZpbGUoZmlsZTogRmlsZSwgaW5kZXg6IG51bWJlcik6IFVwbG9hZEZpbGUge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZmlsZUluZGV4OiBpbmRleCxcclxuICAgICAgaWQ6IHRoaXMuZ2VuZXJhdGVJZCgpLFxyXG4gICAgICBuYW1lOiBmaWxlLm5hbWUsXHJcbiAgICAgIHNpemU6IGZpbGUuc2l6ZSxcclxuICAgICAgdHlwZTogZmlsZS50eXBlLFxyXG4gICAgICBmb3JtOiBuZXcgRm9ybURhdGEoKSxcclxuICAgICAgcHJvZ3Jlc3M6IHtcclxuICAgICAgICBzdGF0dXM6IFVwbG9hZFN0YXR1cy5RdWV1ZSxcclxuICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICBwZXJjZW50YWdlOiAwLFxyXG4gICAgICAgICAgc3BlZWQ6IDAsXHJcbiAgICAgICAgICBzcGVlZEh1bWFuOiBgJHtodW1hbml6ZUJ5dGVzKDApfS9zYCxcclxuICAgICAgICAgIHN0YXJ0VGltZTogbnVsbCxcclxuICAgICAgICAgIGVuZFRpbWU6IG51bGwsXHJcbiAgICAgICAgICBldGE6IG51bGwsXHJcbiAgICAgICAgICBldGFIdW1hbjogbnVsbFxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgbGFzdE1vZGlmaWVkRGF0ZTogZmlsZS5sYXN0TW9kaWZpZWREYXRlLFxyXG4gICAgICBzdWI6IHVuZGVmaW5lZCxcclxuICAgICAgbmF0aXZlRmlsZTogZmlsZVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcGFyc2VSZXNwb25zZUhlYWRlcnMoaHR0cEhlYWRlcnM6IEJ5dGVTdHJpbmcpIHtcclxuICAgIGlmICghaHR0cEhlYWRlcnMpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGh0dHBIZWFkZXJzLnNwbGl0KCdcXG4nKVxyXG4gICAgICAubWFwKHggPT4geC5zcGxpdCgvOiAqLywgMikpXHJcbiAgICAgIC5maWx0ZXIoeCA9PiB4WzBdKVxyXG4gICAgICAucmVkdWNlKChhYywgeCkgPT4ge1xyXG4gICAgICAgIGFjW3hbMF1dID0geFsxXTtcclxuICAgICAgICByZXR1cm4gYWM7XHJcbiAgICAgIH0sIHt9KTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgRGlyZWN0aXZlLCBFbGVtZW50UmVmLCBFdmVudEVtaXR0ZXIsIElucHV0LCBPdXRwdXQsIE9uSW5pdCwgT25EZXN0cm95LCBIb3N0TGlzdGVuZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgVXBsb2FkT3V0cHV0LCBVcGxvYWRJbnB1dCwgVXBsb2FkZXJPcHRpb25zIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcclxuaW1wb3J0IHsgTmdVcGxvYWRlclNlcnZpY2UgfSBmcm9tICcuL25neC11cGxvYWRlci5jbGFzcyc7XHJcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xyXG5cclxuQERpcmVjdGl2ZSh7XHJcbiAgc2VsZWN0b3I6ICdbbmdGaWxlRHJvcF0nXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBOZ0ZpbGVEcm9wRGlyZWN0aXZlIGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xyXG4gIEBJbnB1dCgpIG9wdGlvbnM6IFVwbG9hZGVyT3B0aW9ucztcclxuICBASW5wdXQoKSB1cGxvYWRJbnB1dDogRXZlbnRFbWl0dGVyPFVwbG9hZElucHV0PjtcclxuICBAT3V0cHV0KCkgdXBsb2FkT3V0cHV0OiBFdmVudEVtaXR0ZXI8VXBsb2FkT3V0cHV0PjtcclxuXHJcbiAgdXBsb2FkOiBOZ1VwbG9hZGVyU2VydmljZTtcclxuICBlbDogSFRNTElucHV0RWxlbWVudDtcclxuXHJcbiAgX3N1YjogU3Vic2NyaXB0aW9uW107XHJcblxyXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlbGVtZW50UmVmOiBFbGVtZW50UmVmKSB7XHJcbiAgICB0aGlzLnVwbG9hZE91dHB1dCA9IG5ldyBFdmVudEVtaXR0ZXI8VXBsb2FkT3V0cHV0PigpO1xyXG4gIH1cclxuXHJcbiAgbmdPbkluaXQoKSB7XHJcbiAgICB0aGlzLl9zdWIgPSBbXTtcclxuICAgIGNvbnN0IGNvbmN1cnJlbmN5ID0gdGhpcy5vcHRpb25zICYmIHRoaXMub3B0aW9ucy5jb25jdXJyZW5jeSB8fCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XHJcbiAgICBjb25zdCBhbGxvd2VkQ29udGVudFR5cGVzID0gdGhpcy5vcHRpb25zICYmIHRoaXMub3B0aW9ucy5hbGxvd2VkQ29udGVudFR5cGVzIHx8IFsnKiddO1xyXG4gICAgY29uc3QgbWF4VXBsb2FkcyA9IHRoaXMub3B0aW9ucyAmJiB0aGlzLm9wdGlvbnMubWF4VXBsb2FkcyB8fCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XHJcbiAgICB0aGlzLnVwbG9hZCA9IG5ldyBOZ1VwbG9hZGVyU2VydmljZShjb25jdXJyZW5jeSwgYWxsb3dlZENvbnRlbnRUeXBlcywgbWF4VXBsb2Fkcyk7XHJcblxyXG4gICAgdGhpcy5lbCA9IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xyXG5cclxuICAgIHRoaXMuX3N1Yi5wdXNoKFxyXG4gICAgICB0aGlzLnVwbG9hZC5zZXJ2aWNlRXZlbnRzLnN1YnNjcmliZSgoZXZlbnQ6IFVwbG9hZE91dHB1dCkgPT4ge1xyXG4gICAgICAgIHRoaXMudXBsb2FkT3V0cHV0LmVtaXQoZXZlbnQpO1xyXG4gICAgICB9KVxyXG4gICAgKTtcclxuXHJcbiAgICBpZiAodGhpcy51cGxvYWRJbnB1dCBpbnN0YW5jZW9mIEV2ZW50RW1pdHRlcikge1xyXG4gICAgICB0aGlzLl9zdWIucHVzaCh0aGlzLnVwbG9hZC5pbml0SW5wdXRFdmVudHModGhpcy51cGxvYWRJbnB1dCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuc3RvcEV2ZW50LCBmYWxzZSk7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdlbnRlcicsIHRoaXMuc3RvcEV2ZW50LCBmYWxzZSk7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgdGhpcy5zdG9wRXZlbnQsIGZhbHNlKTtcclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCkge1xyXG4gICAgdGhpcy5fc3ViLmZvckVhY2goc3ViID0+IHN1Yi51bnN1YnNjcmliZSgpKTtcclxuICB9XHJcblxyXG4gIHN0b3BFdmVudCA9IChlOiBFdmVudCkgPT4ge1xyXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICB9XHJcblxyXG4gIEBIb3N0TGlzdGVuZXIoJ2Ryb3AnLCBbJyRldmVudCddKVxyXG4gIHB1YmxpYyBvbkRyb3AoZTogYW55KSB7XHJcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgIGNvbnN0IGV2ZW50OiBVcGxvYWRPdXRwdXQgPSB7IHR5cGU6ICdkcm9wJyB9O1xyXG4gICAgdGhpcy51cGxvYWRPdXRwdXQuZW1pdChldmVudCk7XHJcbiAgICB0aGlzLnVwbG9hZC5oYW5kbGVGaWxlcyhlLmRhdGFUcmFuc2Zlci5maWxlcyk7XHJcbiAgfVxyXG5cclxuICBASG9zdExpc3RlbmVyKCdkcmFnb3ZlcicsIFsnJGV2ZW50J10pXHJcbiAgcHVibGljIG9uRHJhZ092ZXIoZTogRXZlbnQpIHtcclxuICAgIGlmICghZSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZXZlbnQ6IFVwbG9hZE91dHB1dCA9IHsgdHlwZTogJ2RyYWdPdmVyJyB9O1xyXG4gICAgdGhpcy51cGxvYWRPdXRwdXQuZW1pdChldmVudCk7XHJcbiAgfVxyXG5cclxuICBASG9zdExpc3RlbmVyKCdkcmFnbGVhdmUnLCBbJyRldmVudCddKVxyXG4gIHB1YmxpYyBvbkRyYWdMZWF2ZShlOiBFdmVudCkge1xyXG4gICAgaWYgKCFlKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBldmVudDogVXBsb2FkT3V0cHV0ID0geyB0eXBlOiAnZHJhZ091dCcgfTtcclxuICAgIHRoaXMudXBsb2FkT3V0cHV0LmVtaXQoZXZlbnQpO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgeyBEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIEV2ZW50RW1pdHRlciwgSW5wdXQsIE91dHB1dCwgT25Jbml0LCBPbkRlc3Ryb3kgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgVXBsb2FkT3V0cHV0LCBVcGxvYWRlck9wdGlvbnMgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xyXG5pbXBvcnQgeyBOZ1VwbG9hZGVyU2VydmljZSB9IGZyb20gJy4vbmd4LXVwbG9hZGVyLmNsYXNzJztcclxuaW1wb3J0IHsgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XHJcblxyXG5ARGlyZWN0aXZlKHtcclxuICBzZWxlY3RvcjogJ1tuZ0ZpbGVTZWxlY3RdJ1xyXG59KVxyXG5leHBvcnQgY2xhc3MgTmdGaWxlU2VsZWN0RGlyZWN0aXZlIGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xyXG4gIEBJbnB1dCgpIG9wdGlvbnM6IFVwbG9hZGVyT3B0aW9ucztcclxuICBASW5wdXQoKSB1cGxvYWRJbnB1dDogRXZlbnRFbWl0dGVyPGFueT47XHJcbiAgQE91dHB1dCgpIHVwbG9hZE91dHB1dDogRXZlbnRFbWl0dGVyPFVwbG9hZE91dHB1dD47XHJcblxyXG4gIHVwbG9hZDogTmdVcGxvYWRlclNlcnZpY2U7XHJcbiAgZWw6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcblxyXG4gIF9zdWI6IFN1YnNjcmlwdGlvbltdO1xyXG5cclxuICBjb25zdHJ1Y3RvcihwdWJsaWMgZWxlbWVudFJlZjogRWxlbWVudFJlZikge1xyXG4gICAgdGhpcy51cGxvYWRPdXRwdXQgPSBuZXcgRXZlbnRFbWl0dGVyPFVwbG9hZE91dHB1dD4oKTtcclxuICB9XHJcblxyXG4gIG5nT25Jbml0KCkge1xyXG4gICAgdGhpcy5fc3ViID0gW107XHJcbiAgICBjb25zdCBjb25jdXJyZW5jeSA9IHRoaXMub3B0aW9ucyAmJiB0aGlzLm9wdGlvbnMuY29uY3VycmVuY3kgfHwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xyXG4gICAgY29uc3QgYWxsb3dlZENvbnRlbnRUeXBlcyA9IHRoaXMub3B0aW9ucyAmJiB0aGlzLm9wdGlvbnMuYWxsb3dlZENvbnRlbnRUeXBlcyB8fCBbJyonXTtcclxuICAgIGNvbnN0IG1heFVwbG9hZHMgPSB0aGlzLm9wdGlvbnMgJiYgdGhpcy5vcHRpb25zLm1heFVwbG9hZHMgfHwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xyXG4gICAgdGhpcy51cGxvYWQgPSBuZXcgTmdVcGxvYWRlclNlcnZpY2UoY29uY3VycmVuY3ksIGFsbG93ZWRDb250ZW50VHlwZXMsIG1heFVwbG9hZHMpO1xyXG5cclxuICAgIHRoaXMuZWwgPSB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcclxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy5maWxlTGlzdGVuZXIsIGZhbHNlKTtcclxuXHJcbiAgICB0aGlzLl9zdWIucHVzaChcclxuICAgICAgdGhpcy51cGxvYWQuc2VydmljZUV2ZW50cy5zdWJzY3JpYmUoKGV2ZW50OiBVcGxvYWRPdXRwdXQpID0+IHtcclxuICAgICAgICB0aGlzLnVwbG9hZE91dHB1dC5lbWl0KGV2ZW50KTtcclxuICAgICAgfSlcclxuICAgICk7XHJcblxyXG4gICAgaWYgKHRoaXMudXBsb2FkSW5wdXQgaW5zdGFuY2VvZiBFdmVudEVtaXR0ZXIpIHtcclxuICAgICAgdGhpcy5fc3ViLnB1c2godGhpcy51cGxvYWQuaW5pdElucHV0RXZlbnRzKHRoaXMudXBsb2FkSW5wdXQpKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCkge1xyXG4gICAgaWYgKHRoaXMuZWwpe1xyXG4gICAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuZmlsZUxpc3RlbmVyLCBmYWxzZSk7XHJcbiAgICAgIHRoaXMuX3N1Yi5mb3JFYWNoKHN1YiA9PiBzdWIudW5zdWJzY3JpYmUoKSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmaWxlTGlzdGVuZXIgPSAoKSA9PiB7XHJcbiAgICBpZiAodGhpcy5lbC5maWxlcykge1xyXG4gICAgICB0aGlzLnVwbG9hZC5oYW5kbGVGaWxlcyh0aGlzLmVsLmZpbGVzKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgTmdGaWxlRHJvcERpcmVjdGl2ZSB9IGZyb20gJy4vbmctZmlsZS1kcm9wLmRpcmVjdGl2ZSc7XHJcbmltcG9ydCB7IE5nRmlsZVNlbGVjdERpcmVjdGl2ZSB9IGZyb20gJy4vbmctZmlsZS1zZWxlY3QuZGlyZWN0aXZlJztcclxuXHJcbkBOZ01vZHVsZSh7XHJcbiAgZGVjbGFyYXRpb25zOiBbTmdGaWxlRHJvcERpcmVjdGl2ZSwgTmdGaWxlU2VsZWN0RGlyZWN0aXZlXSxcclxuICBleHBvcnRzOiBbTmdGaWxlRHJvcERpcmVjdGl2ZSwgTmdGaWxlU2VsZWN0RGlyZWN0aXZlXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgTmd4VXBsb2FkZXJNb2R1bGUgeyB9XHJcbiJdLCJuYW1lcyI6WyJFdmVudEVtaXR0ZXIiLCJTdWJqZWN0IiwibWVyZ2VNYXAiLCJPYnNlcnZhYmxlIiwiZmluYWxpemUiLCJEaXJlY3RpdmUiLCJFbGVtZW50UmVmIiwiSW5wdXQiLCJPdXRwdXQiLCJIb3N0TGlzdGVuZXIiLCJOZ01vZHVsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O1FBYUUsUUFBSztRQUNMLFlBQVM7UUFDVCxPQUFJO1FBQ0osWUFBUzs7Ozs7OztJQ2hCWDs7Ozs7Ozs7Ozs7Ozs7QUFjQSxvQkF1R3VCLENBQUMsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxHQUFHLE9BQU8sTUFBTSxLQUFLLFVBQVUsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxDQUFDO1lBQUUsT0FBTyxDQUFDLENBQUM7UUFDakIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDakMsSUFBSTtZQUNBLE9BQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLElBQUk7Z0JBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDOUU7UUFD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