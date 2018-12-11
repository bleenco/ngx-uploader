/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
import { EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { mergeMap, finalize } from 'rxjs/operators';
import { UploadStatus } from './interfaces';
/**
 * @param {?} bytes
 * @return {?}
 */
export function humanizeBytes(bytes) {
    if (bytes === 0) {
        return '0 Byte';
    }
    /** @type {?} */
    const k = 1024;
    /** @type {?} */
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    /** @type {?} */
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
export class NgUploaderService {
    /**
     * @param {?=} concurrency
     * @param {?=} contentTypes
     * @param {?=} maxUploads
     */
    constructor(concurrency = Number.POSITIVE_INFINITY, contentTypes = ['*'], maxUploads = Number.POSITIVE_INFINITY) {
        this.queue = [];
        this.serviceEvents = new EventEmitter();
        this.uploadScheduler = new Subject();
        this.subs = [];
        this.contentTypes = contentTypes;
        this.maxUploads = maxUploads;
        this.uploadScheduler
            .pipe(mergeMap(upload => this.startUpload(upload), concurrency))
            .subscribe(uploadOutput => this.serviceEvents.emit(uploadOutput));
    }
    /**
     * @param {?} incomingFiles
     * @return {?}
     */
    handleFiles(incomingFiles) {
        /** @type {?} */
        const allowedIncomingFiles = [].reduce.call(incomingFiles, (acc, checkFile, i) => {
            /** @type {?} */
            const futureQueueLength = acc.length + this.queue.length + 1;
            if (this.isContentTypeAllowed(checkFile.type) && futureQueueLength <= this.maxUploads) {
                acc = acc.concat(checkFile);
            }
            else {
                /** @type {?} */
                const rejectedFile = this.makeUploadFile(checkFile, i);
                this.serviceEvents.emit({ type: 'rejected', file: rejectedFile });
            }
            return acc;
        }, []);
        this.queue.push(...[].map.call(allowedIncomingFiles, (file, i) => {
            /** @type {?} */
            const uploadFile = this.makeUploadFile(file, i);
            this.serviceEvents.emit({ type: 'addedToQueue', file: uploadFile });
            return uploadFile;
        }));
        this.serviceEvents.emit({ type: 'allAddedToQueue' });
    }
    /**
     * @param {?} input
     * @return {?}
     */
    initInputEvents(input) {
        return input.subscribe((event) => {
            switch (event.type) {
                case 'uploadFile':
                    /** @type {?} */
                    const uploadFileIndex = this.queue.findIndex(file => file === event.file);
                    if (uploadFileIndex !== -1 && event.file) {
                        this.uploadScheduler.next({ file: this.queue[uploadFileIndex], event: event });
                    }
                    break;
                case 'uploadAll':
                    /** @type {?} */
                    const files = this.queue.filter(file => file.progress.status === UploadStatus.Queue);
                    files.forEach(file => this.uploadScheduler.next({ file: file, event: event }));
                    break;
                case 'cancel':
                    /** @type {?} */
                    const id = event.id || null;
                    if (!id) {
                        return;
                    }
                    /** @type {?} */
                    const subs = this.subs.filter(sub => sub.id === id);
                    subs.forEach(sub => {
                        if (sub.sub) {
                            sub.sub.unsubscribe();
                            /** @type {?} */
                            const fileIndex = this.queue.findIndex(file => file.id === id);
                            if (fileIndex !== -1) {
                                this.queue[fileIndex].progress.status = UploadStatus.Cancelled;
                                this.serviceEvents.emit({ type: 'cancelled', file: this.queue[fileIndex] });
                            }
                        }
                    });
                    break;
                case 'cancelAll':
                    this.subs.forEach(sub => {
                        if (sub.sub) {
                            sub.sub.unsubscribe();
                        }
                        /** @type {?} */
                        const file = this.queue.find(uploadFile => uploadFile.id === sub.id);
                        if (file) {
                            file.progress.status = UploadStatus.Cancelled;
                            this.serviceEvents.emit({ type: 'cancelled', file: file });
                        }
                    });
                    break;
                case 'remove':
                    if (!event.id) {
                        return;
                    }
                    /** @type {?} */
                    const i = this.queue.findIndex(file => file.id === event.id);
                    if (i !== -1) {
                        /** @type {?} */
                        const file = this.queue[i];
                        this.queue.splice(i, 1);
                        this.serviceEvents.emit({ type: 'removed', file: file });
                    }
                    break;
                case 'removeAll':
                    if (this.queue.length) {
                        this.queue = [];
                        this.serviceEvents.emit({ type: 'removedAll' });
                    }
                    break;
            }
        });
    }
    /**
     * @param {?} upload
     * @return {?}
     */
    startUpload(upload) {
        return new Observable(observer => {
            /** @type {?} */
            const sub = this.uploadFile(upload.file, upload.event)
                .pipe(finalize(() => {
                if (!observer.closed) {
                    observer.complete();
                }
            }))
                .subscribe(output => {
                observer.next(output);
            }, err => {
                observer.error(err);
                observer.complete();
            }, () => {
                observer.complete();
            });
            this.subs.push({ id: upload.file.id, sub: sub });
        });
    }
    /**
     * @param {?} file
     * @param {?} event
     * @return {?}
     */
    uploadFile(file, event) {
        return new Observable(observer => {
            /** @type {?} */
            const url = event.url || '';
            /** @type {?} */
            const method = event.method || 'POST';
            /** @type {?} */
            const data = event.data || {};
            /** @type {?} */
            const headers = event.headers || {};
            /** @type {?} */
            const xhr = new XMLHttpRequest();
            /** @type {?} */
            const time = new Date().getTime();
            /** @type {?} */
            let progressStartTime = (file.progress.data && file.progress.data.startTime) || time;
            /** @type {?} */
            let speed = 0;
            /** @type {?} */
            let eta = null;
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    /** @type {?} */
                    const percentage = Math.round((e.loaded * 100) / e.total);
                    /** @type {?} */
                    const diff = new Date().getTime() - time;
                    speed = Math.round(e.loaded / diff * 1000);
                    progressStartTime = (file.progress.data && file.progress.data.startTime) || new Date().getTime();
                    eta = Math.ceil((e.total - e.loaded) / speed);
                    file.progress = {
                        status: UploadStatus.Uploading,
                        data: {
                            percentage: percentage,
                            speed: speed,
                            speedHuman: `${humanizeBytes(speed)}/s`,
                            startTime: progressStartTime,
                            endTime: null,
                            eta: eta,
                            etaHuman: this.secondsToHuman(eta)
                        }
                    };
                    observer.next({ type: 'uploading', file: file });
                }
            }, false);
            xhr.upload.addEventListener('error', (e) => {
                observer.error(e);
                observer.complete();
            });
            xhr.onreadystatechange = () => {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    /** @type {?} */
                    const speedAverage = Math.round(file.size / (new Date().getTime() - progressStartTime) * 1000);
                    file.progress = {
                        status: UploadStatus.Done,
                        data: {
                            percentage: 100,
                            speed: speedAverage,
                            speedHuman: `${humanizeBytes(speedAverage)}/s`,
                            startTime: progressStartTime,
                            endTime: new Date().getTime(),
                            eta: eta,
                            etaHuman: this.secondsToHuman(eta || 0)
                        }
                    };
                    file.responseStatus = xhr.status;
                    try {
                        file.response = JSON.parse(xhr.response);
                    }
                    catch (e) {
                        file.response = xhr.response;
                    }
                    file.responseHeaders = this.parseResponseHeaders(xhr.getAllResponseHeaders());
                    observer.next({ type: 'done', file: file });
                    observer.complete();
                }
            };
            xhr.open(method, url, true);
            xhr.withCredentials = event.withCredentials ? true : false;
            try {
                /** @type {?} */
                const uploadFile = (/** @type {?} */ (file.nativeFile));
                /** @type {?} */
                const uploadIndex = this.queue.findIndex(outFile => outFile.nativeFile === uploadFile);
                if (this.queue[uploadIndex].progress.status === UploadStatus.Cancelled) {
                    observer.complete();
                }
                Object.keys(headers).forEach(key => xhr.setRequestHeader(key, headers[key]));
                /** @type {?} */
                let bodyToSend;
                if (event.includeWebKitFormBoundary !== false) {
                    Object.keys(data).forEach(key => file.form.append(key, data[key]));
                    file.form.append(event.fieldName || 'file', uploadFile, uploadFile.name);
                    bodyToSend = file.form;
                }
                else {
                    bodyToSend = uploadFile;
                }
                this.serviceEvents.emit({ type: 'start', file: file });
                xhr.send(bodyToSend);
            }
            catch (e) {
                observer.complete();
            }
            return () => {
                xhr.abort();
            };
        });
    }
    /**
     * @param {?} sec
     * @return {?}
     */
    secondsToHuman(sec) {
        return new Date(sec * 1000).toISOString().substr(11, 8);
    }
    /**
     * @return {?}
     */
    generateId() {
        return Math.random().toString(36).substring(7);
    }
    /**
     * @param {?} contentTypes
     * @return {?}
     */
    setContentTypes(contentTypes) {
        if (typeof contentTypes != 'undefined' && contentTypes instanceof Array) {
            if (contentTypes.find((type) => type === '*') !== undefined) {
                this.contentTypes = ['*'];
            }
            else {
                this.contentTypes = contentTypes;
            }
            return;
        }
        this.contentTypes = ['*'];
    }
    /**
     * @return {?}
     */
    allContentTypesAllowed() {
        return this.contentTypes.find((type) => type === '*') !== undefined;
    }
    /**
     * @param {?} mimetype
     * @return {?}
     */
    isContentTypeAllowed(mimetype) {
        if (this.allContentTypesAllowed()) {
            return true;
        }
        return this.contentTypes.find((type) => type === mimetype) !== undefined;
    }
    /**
     * @param {?} file
     * @param {?} index
     * @return {?}
     */
    makeUploadFile(file, index) {
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
                    speedHuman: `${humanizeBytes(0)}/s`,
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
    }
    /**
     * @param {?} httpHeaders
     * @return {?}
     */
    parseResponseHeaders(httpHeaders) {
        if (!httpHeaders) {
            return;
        }
        return httpHeaders.split('\n')
            .map(x => x.split(/: */, 2))
            .filter(x => x[0])
            .reduce((ac, x) => {
            ac[x[0]] = x[1];
            return ac;
        }, {});
    }
}
if (false) {
    /** @type {?} */
    NgUploaderService.prototype.queue;
    /** @type {?} */
    NgUploaderService.prototype.serviceEvents;
    /** @type {?} */
    NgUploaderService.prototype.uploadScheduler;
    /** @type {?} */
    NgUploaderService.prototype.subs;
    /** @type {?} */
    NgUploaderService.prototype.contentTypes;
    /** @type {?} */
    NgUploaderService.prototype.maxUploads;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LXVwbG9hZGVyLmNsYXNzLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmd4LXVwbG9hZGVyLyIsInNvdXJjZXMiOlsibGliL25neC11cGxvYWRlci5jbGFzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM3QyxPQUFPLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBZ0IsTUFBTSxNQUFNLENBQUM7QUFDekQsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNwRCxPQUFPLEVBQXlDLFlBQVksRUFBWSxNQUFNLGNBQWMsQ0FBQzs7Ozs7QUFFN0YsTUFBTSx3QkFBd0IsS0FBYTtJQUN6QyxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7UUFDZixPQUFPLFFBQVEsQ0FBQztLQUNqQjs7VUFFSyxDQUFDLEdBQUcsSUFBSTs7VUFDUixLQUFLLEdBQWEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQzs7VUFDekQsQ0FBQyxHQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTNELE9BQU8sVUFBVSxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxRSxDQUFDO0FBRUQsTUFBTTs7Ozs7O0lBUUosWUFBWSxjQUFzQixNQUFNLENBQUMsaUJBQWlCLEVBQUUsZUFBeUIsQ0FBQyxHQUFHLENBQUMsRUFBRSxhQUFxQixNQUFNLENBQUMsaUJBQWlCO1FBQ3ZJLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxZQUFZLEVBQWdCLENBQUM7UUFDdEQsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2YsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7UUFDakMsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFFN0IsSUFBSSxDQUFDLGVBQWU7YUFDakIsSUFBSSxDQUNILFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQzFEO2FBQ0EsU0FBUyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztJQUN0RSxDQUFDOzs7OztJQUVELFdBQVcsQ0FBQyxhQUF1Qjs7Y0FDM0Isb0JBQW9CLEdBQVcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsR0FBVyxFQUFFLFNBQWUsRUFBRSxDQUFTLEVBQUUsRUFBRTs7a0JBQ3ZHLGlCQUFpQixHQUFHLEdBQUcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQztZQUM1RCxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQWlCLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDckYsR0FBRyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDN0I7aUJBQU07O3NCQUNDLFlBQVksR0FBZSxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7Z0JBQ2xFLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQzthQUNuRTtZQUVELE9BQU8sR0FBRyxDQUFDO1FBQ2IsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUVOLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxJQUFVLEVBQUUsQ0FBUyxFQUFFLEVBQUU7O2tCQUN2RSxVQUFVLEdBQWUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQzNELElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQztZQUNwRSxPQUFPLFVBQVUsQ0FBQztRQUNwQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRUosSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7Ozs7O0lBRUQsZUFBZSxDQUFDLEtBQWdDO1FBQzlDLE9BQU8sS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQWtCLEVBQUUsRUFBRTtZQUM1QyxRQUFRLEtBQUssQ0FBQyxJQUFJLEVBQUU7Z0JBQ2xCLEtBQUssWUFBWTs7MEJBQ1QsZUFBZSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxJQUFJLENBQUM7b0JBQ3pFLElBQUksZUFBZSxLQUFLLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUU7d0JBQ3hDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7cUJBQ2hGO29CQUNELE1BQU07Z0JBQ1IsS0FBSyxXQUFXOzswQkFDUixLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxZQUFZLENBQUMsS0FBSyxDQUFDO29CQUNwRixLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQy9FLE1BQU07Z0JBQ1IsS0FBSyxRQUFROzswQkFDTCxFQUFFLEdBQUcsS0FBSyxDQUFDLEVBQUUsSUFBSSxJQUFJO29CQUMzQixJQUFJLENBQUMsRUFBRSxFQUFFO3dCQUNQLE9BQU87cUJBQ1I7OzBCQUNLLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDO29CQUNuRCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO3dCQUNqQixJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUU7NEJBQ1gsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7a0NBQ2hCLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDOzRCQUM5RCxJQUFJLFNBQVMsS0FBSyxDQUFDLENBQUMsRUFBRTtnQ0FDcEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUM7Z0NBQy9ELElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBQyxDQUFDLENBQUM7NkJBQzNFO3lCQUNGO29CQUNILENBQUMsQ0FBQyxDQUFDO29CQUNILE1BQU07Z0JBQ1IsS0FBSyxXQUFXO29CQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO3dCQUN0QixJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUU7NEJBQ1gsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQzt5QkFDdkI7OzhCQUVLLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQzt3QkFDcEUsSUFBSSxJQUFJLEVBQUU7NEJBQ1IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQzs0QkFDOUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO3lCQUM1RDtvQkFDSCxDQUFDLENBQUMsQ0FBQztvQkFDSCxNQUFNO2dCQUNSLEtBQUssUUFBUTtvQkFDWCxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRTt3QkFDYixPQUFPO3FCQUNSOzswQkFFSyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEtBQUssQ0FBQyxFQUFFLENBQUM7b0JBQzVELElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFOzs4QkFDTixJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7d0JBQzFCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzt3QkFDeEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO3FCQUMxRDtvQkFDRCxNQUFNO2dCQUNSLEtBQUssV0FBVztvQkFDZCxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO3dCQUNyQixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQzt3QkFDaEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQztxQkFDakQ7b0JBQ0QsTUFBTTthQUNUO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDOzs7OztJQUVELFdBQVcsQ0FBQyxNQUFnRDtRQUMxRCxPQUFPLElBQUksVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFOztrQkFDekIsR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDO2lCQUNuRCxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRTtnQkFDbEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7b0JBQ3BCLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztpQkFDckI7WUFDSCxDQUFDLENBQUMsQ0FBQztpQkFDRixTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ2xCLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDeEIsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFO2dCQUNQLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3BCLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN0QixDQUFDLEVBQUUsR0FBRyxFQUFFO2dCQUNOLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN0QixDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNuRCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Ozs7OztJQUVELFVBQVUsQ0FBQyxJQUFnQixFQUFFLEtBQWtCO1FBQzdDLE9BQU8sSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQUU7O2tCQUN6QixHQUFHLEdBQUcsS0FBSyxDQUFDLEdBQUcsSUFBSSxFQUFFOztrQkFDckIsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLElBQUksTUFBTTs7a0JBQy9CLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxJQUFJLEVBQUU7O2tCQUN2QixPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sSUFBSSxFQUFFOztrQkFFN0IsR0FBRyxHQUFHLElBQUksY0FBYyxFQUFFOztrQkFDMUIsSUFBSSxHQUFXLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFOztnQkFDckMsaUJBQWlCLEdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxJQUFJOztnQkFDeEYsS0FBSyxHQUFHLENBQUM7O2dCQUNULEdBQUcsR0FBa0IsSUFBSTtZQUU3QixHQUFHLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxDQUFDLENBQWdCLEVBQUUsRUFBRTtnQkFDM0QsSUFBSSxDQUFDLENBQUMsZ0JBQWdCLEVBQUU7OzBCQUNoQixVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQzs7MEJBQ25ELElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUk7b0JBQ3hDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDO29CQUMzQyxpQkFBaUIsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ2pHLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7b0JBRTlDLElBQUksQ0FBQyxRQUFRLEdBQUc7d0JBQ2QsTUFBTSxFQUFFLFlBQVksQ0FBQyxTQUFTO3dCQUM5QixJQUFJLEVBQUU7NEJBQ0osVUFBVSxFQUFFLFVBQVU7NEJBQ3RCLEtBQUssRUFBRSxLQUFLOzRCQUNaLFVBQVUsRUFBRSxHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSTs0QkFDdkMsU0FBUyxFQUFFLGlCQUFpQjs0QkFDNUIsT0FBTyxFQUFFLElBQUk7NEJBQ2IsR0FBRyxFQUFFLEdBQUc7NEJBQ1IsUUFBUSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDO3lCQUNuQztxQkFDRixDQUFDO29CQUVGLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2lCQUNsRDtZQUNILENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUVWLEdBQUcsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBUSxFQUFFLEVBQUU7Z0JBQ2hELFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xCLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN0QixDQUFDLENBQUMsQ0FBQztZQUVILEdBQUcsQ0FBQyxrQkFBa0IsR0FBRyxHQUFHLEVBQUU7Z0JBQzVCLElBQUksR0FBRyxDQUFDLFVBQVUsS0FBSyxjQUFjLENBQUMsSUFBSSxFQUFFOzswQkFDcEMsWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsaUJBQWlCLENBQUMsR0FBRyxJQUFJLENBQUM7b0JBQzlGLElBQUksQ0FBQyxRQUFRLEdBQUc7d0JBQ2QsTUFBTSxFQUFFLFlBQVksQ0FBQyxJQUFJO3dCQUN6QixJQUFJLEVBQUU7NEJBQ0osVUFBVSxFQUFFLEdBQUc7NEJBQ2YsS0FBSyxFQUFFLFlBQVk7NEJBQ25CLFVBQVUsRUFBRSxHQUFHLGFBQWEsQ0FBQyxZQUFZLENBQUMsSUFBSTs0QkFDOUMsU0FBUyxFQUFFLGlCQUFpQjs0QkFDNUIsT0FBTyxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFOzRCQUM3QixHQUFHLEVBQUUsR0FBRzs0QkFDUixRQUFRLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO3lCQUN4QztxQkFDRixDQUFDO29CQUVGLElBQUksQ0FBQyxjQUFjLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztvQkFFakMsSUFBSTt3QkFDRixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO3FCQUMxQztvQkFBQyxPQUFPLENBQUMsRUFBRTt3QkFDVixJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUM7cUJBQzlCO29CQUVELElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUM7b0JBRTlFLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO29CQUU1QyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7aUJBQ3JCO1lBQ0gsQ0FBQyxDQUFDO1lBRUYsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzVCLEdBQUcsQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFFM0QsSUFBSTs7c0JBQ0ksVUFBVSxHQUFHLG1CQUFVLElBQUksQ0FBQyxVQUFVLEVBQUE7O3NCQUN0QyxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxLQUFLLFVBQVUsQ0FBQztnQkFFdEYsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssWUFBWSxDQUFDLFNBQVMsRUFBRTtvQkFDdEUsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO2lCQUNyQjtnQkFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7b0JBRXpFLFVBQVU7Z0JBRWQsSUFBSSxLQUFLLENBQUMseUJBQXlCLEtBQUssS0FBSyxFQUFFO29CQUM3QyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNuRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxJQUFJLE1BQU0sRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN6RSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztpQkFDeEI7cUJBQU07b0JBQ0wsVUFBVSxHQUFHLFVBQVUsQ0FBQztpQkFDekI7Z0JBRUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUN2RCxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ3RCO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ3JCO1lBRUQsT0FBTyxHQUFHLEVBQUU7Z0JBQ1YsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2QsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDOzs7OztJQUVELGNBQWMsQ0FBQyxHQUFXO1FBQ3hCLE9BQU8sSUFBSSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDMUQsQ0FBQzs7OztJQUVELFVBQVU7UUFDUixPQUFPLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pELENBQUM7Ozs7O0lBRUQsZUFBZSxDQUFDLFlBQXNCO1FBQ3BDLElBQUksT0FBTyxZQUFZLElBQUksV0FBVyxJQUFJLFlBQVksWUFBWSxLQUFLLEVBQUU7WUFDdkUsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBWSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEtBQUssR0FBRyxDQUFDLEtBQUssU0FBUyxFQUFFO2dCQUNuRSxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDM0I7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7YUFDbEM7WUFDRCxPQUFPO1NBQ1I7UUFDRCxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDNUIsQ0FBQzs7OztJQUVELHNCQUFzQjtRQUNwQixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBWSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEtBQUssR0FBRyxDQUFDLEtBQUssU0FBUyxDQUFDO0lBQzlFLENBQUM7Ozs7O0lBRUQsb0JBQW9CLENBQUMsUUFBZ0I7UUFDbkMsSUFBSSxJQUFJLENBQUMsc0JBQXNCLEVBQUUsRUFBRTtZQUNqQyxPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQVksRUFBRSxFQUFFLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxLQUFLLFNBQVMsQ0FBQztJQUNuRixDQUFDOzs7Ozs7SUFFRCxjQUFjLENBQUMsSUFBVSxFQUFFLEtBQWE7UUFDdEMsT0FBTztZQUNMLFNBQVMsRUFBRSxLQUFLO1lBQ2hCLEVBQUUsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ3JCLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLElBQUksRUFBRSxJQUFJLFFBQVEsRUFBRTtZQUNwQixRQUFRLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFLFlBQVksQ0FBQyxLQUFLO2dCQUMxQixJQUFJLEVBQUU7b0JBQ0osVUFBVSxFQUFFLENBQUM7b0JBQ2IsS0FBSyxFQUFFLENBQUM7b0JBQ1IsVUFBVSxFQUFFLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUNuQyxTQUFTLEVBQUUsSUFBSTtvQkFDZixPQUFPLEVBQUUsSUFBSTtvQkFDYixHQUFHLEVBQUUsSUFBSTtvQkFDVCxRQUFRLEVBQUUsSUFBSTtpQkFDZjthQUNGO1lBQ0QsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGdCQUFnQjtZQUN2QyxHQUFHLEVBQUUsU0FBUztZQUNkLFVBQVUsRUFBRSxJQUFJO1NBQ2pCLENBQUM7SUFDSixDQUFDOzs7OztJQUVPLG9CQUFvQixDQUFDLFdBQXVCO1FBQ2xELElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDaEIsT0FBTztTQUNSO1FBQ0QsT0FBTyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQzthQUMzQixHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQzthQUMzQixNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDakIsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ2hCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEIsT0FBTyxFQUFFLENBQUM7UUFDWixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDWCxDQUFDO0NBQ0Y7OztJQXJUQyxrQ0FBb0I7O0lBQ3BCLDBDQUEwQzs7SUFDMUMsNENBQW1FOztJQUNuRSxpQ0FBMEM7O0lBQzFDLHlDQUF1Qjs7SUFDdkIsdUNBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QsIFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBtZXJnZU1hcCwgZmluYWxpemUgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbmltcG9ydCB7IFVwbG9hZEZpbGUsIFVwbG9hZE91dHB1dCwgVXBsb2FkSW5wdXQsIFVwbG9hZFN0YXR1cywgQmxvYkZpbGUgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGh1bWFuaXplQnl0ZXMoYnl0ZXM6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgaWYgKGJ5dGVzID09PSAwKSB7XHJcbiAgICByZXR1cm4gJzAgQnl0ZSc7XHJcbiAgfVxyXG5cclxuICBjb25zdCBrID0gMTAyNDtcclxuICBjb25zdCBzaXplczogc3RyaW5nW10gPSBbJ0J5dGVzJywgJ0tCJywgJ01CJywgJ0dCJywgJ1RCJywgJ1BCJ107XHJcbiAgY29uc3QgaTogbnVtYmVyID0gTWF0aC5mbG9vcihNYXRoLmxvZyhieXRlcykgLyBNYXRoLmxvZyhrKSk7XHJcblxyXG4gIHJldHVybiBwYXJzZUZsb2F0KChieXRlcyAvIE1hdGgucG93KGssIGkpKS50b0ZpeGVkKDIpKSArICcgJyArIHNpemVzW2ldO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTmdVcGxvYWRlclNlcnZpY2Uge1xyXG4gIHF1ZXVlOiBVcGxvYWRGaWxlW107XHJcbiAgc2VydmljZUV2ZW50czogRXZlbnRFbWl0dGVyPFVwbG9hZE91dHB1dD47XHJcbiAgdXBsb2FkU2NoZWR1bGVyOiBTdWJqZWN0PHsgZmlsZTogVXBsb2FkRmlsZSwgZXZlbnQ6IFVwbG9hZElucHV0IH0+O1xyXG4gIHN1YnM6IHsgaWQ6IHN0cmluZywgc3ViOiBTdWJzY3JpcHRpb24gfVtdO1xyXG4gIGNvbnRlbnRUeXBlczogc3RyaW5nW107XHJcbiAgbWF4VXBsb2FkczogbnVtYmVyO1xyXG5cclxuICBjb25zdHJ1Y3Rvcihjb25jdXJyZW5jeTogbnVtYmVyID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLCBjb250ZW50VHlwZXM6IHN0cmluZ1tdID0gWycqJ10sIG1heFVwbG9hZHM6IG51bWJlciA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSkge1xyXG4gICAgdGhpcy5xdWV1ZSA9IFtdO1xyXG4gICAgdGhpcy5zZXJ2aWNlRXZlbnRzID0gbmV3IEV2ZW50RW1pdHRlcjxVcGxvYWRPdXRwdXQ+KCk7XHJcbiAgICB0aGlzLnVwbG9hZFNjaGVkdWxlciA9IG5ldyBTdWJqZWN0KCk7XHJcbiAgICB0aGlzLnN1YnMgPSBbXTtcclxuICAgIHRoaXMuY29udGVudFR5cGVzID0gY29udGVudFR5cGVzO1xyXG4gICAgdGhpcy5tYXhVcGxvYWRzID0gbWF4VXBsb2FkcztcclxuXHJcbiAgICB0aGlzLnVwbG9hZFNjaGVkdWxlclxyXG4gICAgICAucGlwZShcclxuICAgICAgICBtZXJnZU1hcCh1cGxvYWQgPT4gdGhpcy5zdGFydFVwbG9hZCh1cGxvYWQpLCBjb25jdXJyZW5jeSlcclxuICAgICAgKVxyXG4gICAgICAuc3Vic2NyaWJlKHVwbG9hZE91dHB1dCA9PiB0aGlzLnNlcnZpY2VFdmVudHMuZW1pdCh1cGxvYWRPdXRwdXQpKTtcclxuICB9XHJcblxyXG4gIGhhbmRsZUZpbGVzKGluY29taW5nRmlsZXM6IEZpbGVMaXN0KTogdm9pZCB7XHJcbiAgICBjb25zdCBhbGxvd2VkSW5jb21pbmdGaWxlczogRmlsZVtdID0gW10ucmVkdWNlLmNhbGwoaW5jb21pbmdGaWxlcywgKGFjYzogRmlsZVtdLCBjaGVja0ZpbGU6IEZpbGUsIGk6IG51bWJlcikgPT4ge1xyXG4gICAgICBjb25zdCBmdXR1cmVRdWV1ZUxlbmd0aCA9IGFjYy5sZW5ndGggKyB0aGlzLnF1ZXVlLmxlbmd0aCArIDE7XHJcbiAgICAgIGlmICh0aGlzLmlzQ29udGVudFR5cGVBbGxvd2VkKGNoZWNrRmlsZS50eXBlKSAmJiBmdXR1cmVRdWV1ZUxlbmd0aCA8PSB0aGlzLm1heFVwbG9hZHMpIHtcclxuICAgICAgICBhY2MgPSBhY2MuY29uY2F0KGNoZWNrRmlsZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc3QgcmVqZWN0ZWRGaWxlOiBVcGxvYWRGaWxlID0gdGhpcy5tYWtlVXBsb2FkRmlsZShjaGVja0ZpbGUsIGkpO1xyXG4gICAgICAgIHRoaXMuc2VydmljZUV2ZW50cy5lbWl0KHsgdHlwZTogJ3JlamVjdGVkJywgZmlsZTogcmVqZWN0ZWRGaWxlIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gYWNjO1xyXG4gICAgfSwgW10pO1xyXG5cclxuICAgIHRoaXMucXVldWUucHVzaCguLi5bXS5tYXAuY2FsbChhbGxvd2VkSW5jb21pbmdGaWxlcywgKGZpbGU6IEZpbGUsIGk6IG51bWJlcikgPT4ge1xyXG4gICAgICBjb25zdCB1cGxvYWRGaWxlOiBVcGxvYWRGaWxlID0gdGhpcy5tYWtlVXBsb2FkRmlsZShmaWxlLCBpKTtcclxuICAgICAgdGhpcy5zZXJ2aWNlRXZlbnRzLmVtaXQoeyB0eXBlOiAnYWRkZWRUb1F1ZXVlJywgZmlsZTogdXBsb2FkRmlsZSB9KTtcclxuICAgICAgcmV0dXJuIHVwbG9hZEZpbGU7XHJcbiAgICB9KSk7XHJcblxyXG4gICAgdGhpcy5zZXJ2aWNlRXZlbnRzLmVtaXQoeyB0eXBlOiAnYWxsQWRkZWRUb1F1ZXVlJyB9KTtcclxuICB9XHJcblxyXG4gIGluaXRJbnB1dEV2ZW50cyhpbnB1dDogRXZlbnRFbWl0dGVyPFVwbG9hZElucHV0Pik6IFN1YnNjcmlwdGlvbiB7XHJcbiAgICByZXR1cm4gaW5wdXQuc3Vic2NyaWJlKChldmVudDogVXBsb2FkSW5wdXQpID0+IHtcclxuICAgICAgc3dpdGNoIChldmVudC50eXBlKSB7XHJcbiAgICAgICAgY2FzZSAndXBsb2FkRmlsZSc6XHJcbiAgICAgICAgICBjb25zdCB1cGxvYWRGaWxlSW5kZXggPSB0aGlzLnF1ZXVlLmZpbmRJbmRleChmaWxlID0+IGZpbGUgPT09IGV2ZW50LmZpbGUpO1xyXG4gICAgICAgICAgaWYgKHVwbG9hZEZpbGVJbmRleCAhPT0gLTEgJiYgZXZlbnQuZmlsZSkge1xyXG4gICAgICAgICAgICB0aGlzLnVwbG9hZFNjaGVkdWxlci5uZXh0KHsgZmlsZTogdGhpcy5xdWV1ZVt1cGxvYWRGaWxlSW5kZXhdLCBldmVudDogZXZlbnQgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICd1cGxvYWRBbGwnOlxyXG4gICAgICAgICAgY29uc3QgZmlsZXMgPSB0aGlzLnF1ZXVlLmZpbHRlcihmaWxlID0+IGZpbGUucHJvZ3Jlc3Muc3RhdHVzID09PSBVcGxvYWRTdGF0dXMuUXVldWUpO1xyXG4gICAgICAgICAgZmlsZXMuZm9yRWFjaChmaWxlID0+IHRoaXMudXBsb2FkU2NoZWR1bGVyLm5leHQoeyBmaWxlOiBmaWxlLCBldmVudDogZXZlbnQgfSkpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnY2FuY2VsJzpcclxuICAgICAgICAgIGNvbnN0IGlkID0gZXZlbnQuaWQgfHwgbnVsbDtcclxuICAgICAgICAgIGlmICghaWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY29uc3Qgc3VicyA9IHRoaXMuc3Vicy5maWx0ZXIoc3ViID0+IHN1Yi5pZCA9PT0gaWQpO1xyXG4gICAgICAgICAgc3Vicy5mb3JFYWNoKHN1YiA9PiB7XHJcbiAgICAgICAgICAgIGlmIChzdWIuc3ViKSB7XHJcbiAgICAgICAgICAgICAgc3ViLnN1Yi51bnN1YnNjcmliZSgpO1xyXG4gICAgICAgICAgICAgIGNvbnN0IGZpbGVJbmRleCA9IHRoaXMucXVldWUuZmluZEluZGV4KGZpbGUgPT4gZmlsZS5pZCA9PT0gaWQpO1xyXG4gICAgICAgICAgICAgIGlmIChmaWxlSW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnF1ZXVlW2ZpbGVJbmRleF0ucHJvZ3Jlc3Muc3RhdHVzID0gVXBsb2FkU3RhdHVzLkNhbmNlbGxlZDtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VydmljZUV2ZW50cy5lbWl0KHt0eXBlOiAnY2FuY2VsbGVkJywgZmlsZTogdGhpcy5xdWV1ZVtmaWxlSW5kZXhdfSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ2NhbmNlbEFsbCc6XHJcbiAgICAgICAgICB0aGlzLnN1YnMuZm9yRWFjaChzdWIgPT4ge1xyXG4gICAgICAgICAgICBpZiAoc3ViLnN1Yikge1xyXG4gICAgICAgICAgICAgIHN1Yi5zdWIudW5zdWJzY3JpYmUoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgZmlsZSA9IHRoaXMucXVldWUuZmluZCh1cGxvYWRGaWxlID0+IHVwbG9hZEZpbGUuaWQgPT09IHN1Yi5pZCk7XHJcbiAgICAgICAgICAgIGlmIChmaWxlKSB7XHJcbiAgICAgICAgICAgICAgZmlsZS5wcm9ncmVzcy5zdGF0dXMgPSBVcGxvYWRTdGF0dXMuQ2FuY2VsbGVkO1xyXG4gICAgICAgICAgICAgIHRoaXMuc2VydmljZUV2ZW50cy5lbWl0KHsgdHlwZTogJ2NhbmNlbGxlZCcsIGZpbGU6IGZpbGUgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAncmVtb3ZlJzpcclxuICAgICAgICAgIGlmICghZXZlbnQuaWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGNvbnN0IGkgPSB0aGlzLnF1ZXVlLmZpbmRJbmRleChmaWxlID0+IGZpbGUuaWQgPT09IGV2ZW50LmlkKTtcclxuICAgICAgICAgIGlmIChpICE9PSAtMSkge1xyXG4gICAgICAgICAgICBjb25zdCBmaWxlID0gdGhpcy5xdWV1ZVtpXTtcclxuICAgICAgICAgICAgdGhpcy5xdWV1ZS5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2VydmljZUV2ZW50cy5lbWl0KHsgdHlwZTogJ3JlbW92ZWQnLCBmaWxlOiBmaWxlIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAncmVtb3ZlQWxsJzpcclxuICAgICAgICAgIGlmICh0aGlzLnF1ZXVlLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLnF1ZXVlID0gW107XHJcbiAgICAgICAgICAgIHRoaXMuc2VydmljZUV2ZW50cy5lbWl0KHsgdHlwZTogJ3JlbW92ZWRBbGwnIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgc3RhcnRVcGxvYWQodXBsb2FkOiB7IGZpbGU6IFVwbG9hZEZpbGUsIGV2ZW50OiBVcGxvYWRJbnB1dCB9KTogT2JzZXJ2YWJsZTxVcGxvYWRPdXRwdXQ+IHtcclxuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZShvYnNlcnZlciA9PiB7XHJcbiAgICAgIGNvbnN0IHN1YiA9IHRoaXMudXBsb2FkRmlsZSh1cGxvYWQuZmlsZSwgdXBsb2FkLmV2ZW50KVxyXG4gICAgICAgIC5waXBlKGZpbmFsaXplKCgpID0+IHtcclxuICAgICAgICAgIGlmICghb2JzZXJ2ZXIuY2xvc2VkKSB7XHJcbiAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSkpXHJcbiAgICAgICAgLnN1YnNjcmliZShvdXRwdXQgPT4ge1xyXG4gICAgICAgICAgb2JzZXJ2ZXIubmV4dChvdXRwdXQpO1xyXG4gICAgICAgIH0sIGVyciA9PiB7XHJcbiAgICAgICAgICBvYnNlcnZlci5lcnJvcihlcnIpO1xyXG4gICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcclxuICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5zdWJzLnB1c2goeyBpZDogdXBsb2FkLmZpbGUuaWQsIHN1Yjogc3ViIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICB1cGxvYWRGaWxlKGZpbGU6IFVwbG9hZEZpbGUsIGV2ZW50OiBVcGxvYWRJbnB1dCk6IE9ic2VydmFibGU8VXBsb2FkT3V0cHV0PiB7XHJcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUob2JzZXJ2ZXIgPT4ge1xyXG4gICAgICBjb25zdCB1cmwgPSBldmVudC51cmwgfHwgJyc7XHJcbiAgICAgIGNvbnN0IG1ldGhvZCA9IGV2ZW50Lm1ldGhvZCB8fCAnUE9TVCc7XHJcbiAgICAgIGNvbnN0IGRhdGEgPSBldmVudC5kYXRhIHx8IHt9O1xyXG4gICAgICBjb25zdCBoZWFkZXJzID0gZXZlbnQuaGVhZGVycyB8fCB7fTtcclxuXHJcbiAgICAgIGNvbnN0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgICBjb25zdCB0aW1lOiBudW1iZXIgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgICAgbGV0IHByb2dyZXNzU3RhcnRUaW1lOiBudW1iZXIgPSAoZmlsZS5wcm9ncmVzcy5kYXRhICYmIGZpbGUucHJvZ3Jlc3MuZGF0YS5zdGFydFRpbWUpIHx8IHRpbWU7XHJcbiAgICAgIGxldCBzcGVlZCA9IDA7XHJcbiAgICAgIGxldCBldGE6IG51bWJlciB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgICAgeGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIChlOiBQcm9ncmVzc0V2ZW50KSA9PiB7XHJcbiAgICAgICAgaWYgKGUubGVuZ3RoQ29tcHV0YWJsZSkge1xyXG4gICAgICAgICAgY29uc3QgcGVyY2VudGFnZSA9IE1hdGgucm91bmQoKGUubG9hZGVkICogMTAwKSAvIGUudG90YWwpO1xyXG4gICAgICAgICAgY29uc3QgZGlmZiA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdGltZTtcclxuICAgICAgICAgIHNwZWVkID0gTWF0aC5yb3VuZChlLmxvYWRlZCAvIGRpZmYgKiAxMDAwKTtcclxuICAgICAgICAgIHByb2dyZXNzU3RhcnRUaW1lID0gKGZpbGUucHJvZ3Jlc3MuZGF0YSAmJiBmaWxlLnByb2dyZXNzLmRhdGEuc3RhcnRUaW1lKSB8fCBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgICAgICAgIGV0YSA9IE1hdGguY2VpbCgoZS50b3RhbCAtIGUubG9hZGVkKSAvIHNwZWVkKTtcclxuXHJcbiAgICAgICAgICBmaWxlLnByb2dyZXNzID0ge1xyXG4gICAgICAgICAgICBzdGF0dXM6IFVwbG9hZFN0YXR1cy5VcGxvYWRpbmcsXHJcbiAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICBwZXJjZW50YWdlOiBwZXJjZW50YWdlLFxyXG4gICAgICAgICAgICAgIHNwZWVkOiBzcGVlZCxcclxuICAgICAgICAgICAgICBzcGVlZEh1bWFuOiBgJHtodW1hbml6ZUJ5dGVzKHNwZWVkKX0vc2AsXHJcbiAgICAgICAgICAgICAgc3RhcnRUaW1lOiBwcm9ncmVzc1N0YXJ0VGltZSxcclxuICAgICAgICAgICAgICBlbmRUaW1lOiBudWxsLFxyXG4gICAgICAgICAgICAgIGV0YTogZXRhLFxyXG4gICAgICAgICAgICAgIGV0YUh1bWFuOiB0aGlzLnNlY29uZHNUb0h1bWFuKGV0YSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICBvYnNlcnZlci5uZXh0KHsgdHlwZTogJ3VwbG9hZGluZycsIGZpbGU6IGZpbGUgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LCBmYWxzZSk7XHJcblxyXG4gICAgICB4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgKGU6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZSk7XHJcbiAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgPT4ge1xyXG4gICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gWE1MSHR0cFJlcXVlc3QuRE9ORSkge1xyXG4gICAgICAgICAgY29uc3Qgc3BlZWRBdmVyYWdlID0gTWF0aC5yb3VuZChmaWxlLnNpemUgLyAobmV3IERhdGUoKS5nZXRUaW1lKCkgLSBwcm9ncmVzc1N0YXJ0VGltZSkgKiAxMDAwKTtcclxuICAgICAgICAgIGZpbGUucHJvZ3Jlc3MgPSB7XHJcbiAgICAgICAgICAgIHN0YXR1czogVXBsb2FkU3RhdHVzLkRvbmUsXHJcbiAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICBwZXJjZW50YWdlOiAxMDAsXHJcbiAgICAgICAgICAgICAgc3BlZWQ6IHNwZWVkQXZlcmFnZSxcclxuICAgICAgICAgICAgICBzcGVlZEh1bWFuOiBgJHtodW1hbml6ZUJ5dGVzKHNwZWVkQXZlcmFnZSl9L3NgLFxyXG4gICAgICAgICAgICAgIHN0YXJ0VGltZTogcHJvZ3Jlc3NTdGFydFRpbWUsXHJcbiAgICAgICAgICAgICAgZW5kVGltZTogbmV3IERhdGUoKS5nZXRUaW1lKCksXHJcbiAgICAgICAgICAgICAgZXRhOiBldGEsXHJcbiAgICAgICAgICAgICAgZXRhSHVtYW46IHRoaXMuc2Vjb25kc1RvSHVtYW4oZXRhIHx8IDApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgZmlsZS5yZXNwb25zZVN0YXR1cyA9IHhoci5zdGF0dXM7XHJcblxyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgZmlsZS5yZXNwb25zZSA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlKTtcclxuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgZmlsZS5yZXNwb25zZSA9IHhoci5yZXNwb25zZTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBmaWxlLnJlc3BvbnNlSGVhZGVycyA9IHRoaXMucGFyc2VSZXNwb25zZUhlYWRlcnMoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKTtcclxuXHJcbiAgICAgICAgICBvYnNlcnZlci5uZXh0KHsgdHlwZTogJ2RvbmUnLCBmaWxlOiBmaWxlIH0pO1xyXG5cclxuICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgeGhyLm9wZW4obWV0aG9kLCB1cmwsIHRydWUpO1xyXG4gICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gZXZlbnQud2l0aENyZWRlbnRpYWxzID8gdHJ1ZSA6IGZhbHNlO1xyXG5cclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCB1cGxvYWRGaWxlID0gPEJsb2JGaWxlPmZpbGUubmF0aXZlRmlsZTtcclxuICAgICAgICBjb25zdCB1cGxvYWRJbmRleCA9IHRoaXMucXVldWUuZmluZEluZGV4KG91dEZpbGUgPT4gb3V0RmlsZS5uYXRpdmVGaWxlID09PSB1cGxvYWRGaWxlKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMucXVldWVbdXBsb2FkSW5kZXhdLnByb2dyZXNzLnN0YXR1cyA9PT0gVXBsb2FkU3RhdHVzLkNhbmNlbGxlZCkge1xyXG4gICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIE9iamVjdC5rZXlzKGhlYWRlcnMpLmZvckVhY2goa2V5ID0+IHhoci5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgaGVhZGVyc1trZXldKSk7XHJcblxyXG4gICAgICAgIGxldCBib2R5VG9TZW5kO1xyXG5cclxuICAgICAgICBpZiAoZXZlbnQuaW5jbHVkZVdlYktpdEZvcm1Cb3VuZGFyeSAhPT0gZmFsc2UpIHtcclxuICAgICAgICAgIE9iamVjdC5rZXlzKGRhdGEpLmZvckVhY2goa2V5ID0+IGZpbGUuZm9ybS5hcHBlbmQoa2V5LCBkYXRhW2tleV0pKTtcclxuICAgICAgICAgIGZpbGUuZm9ybS5hcHBlbmQoZXZlbnQuZmllbGROYW1lIHx8ICdmaWxlJywgdXBsb2FkRmlsZSwgdXBsb2FkRmlsZS5uYW1lKTtcclxuICAgICAgICAgIGJvZHlUb1NlbmQgPSBmaWxlLmZvcm07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGJvZHlUb1NlbmQgPSB1cGxvYWRGaWxlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zZXJ2aWNlRXZlbnRzLmVtaXQoeyB0eXBlOiAnc3RhcnQnLCBmaWxlOiBmaWxlIH0pO1xyXG4gICAgICAgIHhoci5zZW5kKGJvZHlUb1NlbmQpO1xyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgICB4aHIuYWJvcnQoKTtcclxuICAgICAgfTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgc2Vjb25kc1RvSHVtYW4oc2VjOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIG5ldyBEYXRlKHNlYyAqIDEwMDApLnRvSVNPU3RyaW5nKCkuc3Vic3RyKDExLCA4KTtcclxuICB9XHJcblxyXG4gIGdlbmVyYXRlSWQoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoNyk7XHJcbiAgfVxyXG5cclxuICBzZXRDb250ZW50VHlwZXMoY29udGVudFR5cGVzOiBzdHJpbmdbXSk6IHZvaWQge1xyXG4gICAgaWYgKHR5cGVvZiBjb250ZW50VHlwZXMgIT0gJ3VuZGVmaW5lZCcgJiYgY29udGVudFR5cGVzIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgaWYgKGNvbnRlbnRUeXBlcy5maW5kKCh0eXBlOiBzdHJpbmcpID0+IHR5cGUgPT09ICcqJykgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHRoaXMuY29udGVudFR5cGVzID0gWycqJ107XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5jb250ZW50VHlwZXMgPSBjb250ZW50VHlwZXM7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdGhpcy5jb250ZW50VHlwZXMgPSBbJyonXTtcclxuICB9XHJcblxyXG4gIGFsbENvbnRlbnRUeXBlc0FsbG93ZWQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5jb250ZW50VHlwZXMuZmluZCgodHlwZTogc3RyaW5nKSA9PiB0eXBlID09PSAnKicpICE9PSB1bmRlZmluZWQ7XHJcbiAgfVxyXG5cclxuICBpc0NvbnRlbnRUeXBlQWxsb3dlZChtaW1ldHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICBpZiAodGhpcy5hbGxDb250ZW50VHlwZXNBbGxvd2VkKCkpIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5jb250ZW50VHlwZXMuZmluZCgodHlwZTogc3RyaW5nKSA9PiB0eXBlID09PSBtaW1ldHlwZSkgIT09IHVuZGVmaW5lZDtcclxuICB9XHJcblxyXG4gIG1ha2VVcGxvYWRGaWxlKGZpbGU6IEZpbGUsIGluZGV4OiBudW1iZXIpOiBVcGxvYWRGaWxlIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGZpbGVJbmRleDogaW5kZXgsXHJcbiAgICAgIGlkOiB0aGlzLmdlbmVyYXRlSWQoKSxcclxuICAgICAgbmFtZTogZmlsZS5uYW1lLFxyXG4gICAgICBzaXplOiBmaWxlLnNpemUsXHJcbiAgICAgIHR5cGU6IGZpbGUudHlwZSxcclxuICAgICAgZm9ybTogbmV3IEZvcm1EYXRhKCksXHJcbiAgICAgIHByb2dyZXNzOiB7XHJcbiAgICAgICAgc3RhdHVzOiBVcGxvYWRTdGF0dXMuUXVldWUsXHJcbiAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgcGVyY2VudGFnZTogMCxcclxuICAgICAgICAgIHNwZWVkOiAwLFxyXG4gICAgICAgICAgc3BlZWRIdW1hbjogYCR7aHVtYW5pemVCeXRlcygwKX0vc2AsXHJcbiAgICAgICAgICBzdGFydFRpbWU6IG51bGwsXHJcbiAgICAgICAgICBlbmRUaW1lOiBudWxsLFxyXG4gICAgICAgICAgZXRhOiBudWxsLFxyXG4gICAgICAgICAgZXRhSHVtYW46IG51bGxcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIGxhc3RNb2RpZmllZERhdGU6IGZpbGUubGFzdE1vZGlmaWVkRGF0ZSxcclxuICAgICAgc3ViOiB1bmRlZmluZWQsXHJcbiAgICAgIG5hdGl2ZUZpbGU6IGZpbGVcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHBhcnNlUmVzcG9uc2VIZWFkZXJzKGh0dHBIZWFkZXJzOiBCeXRlU3RyaW5nKSB7XHJcbiAgICBpZiAoIWh0dHBIZWFkZXJzKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHJldHVybiBodHRwSGVhZGVycy5zcGxpdCgnXFxuJylcclxuICAgICAgLm1hcCh4ID0+IHguc3BsaXQoLzogKi8sIDIpKVxyXG4gICAgICAuZmlsdGVyKHggPT4geFswXSlcclxuICAgICAgLnJlZHVjZSgoYWMsIHgpID0+IHtcclxuICAgICAgICBhY1t4WzBdXSA9IHhbMV07XHJcbiAgICAgICAgcmV0dXJuIGFjO1xyXG4gICAgICB9LCB7fSk7XHJcbiAgfVxyXG59XHJcbiJdfQ==