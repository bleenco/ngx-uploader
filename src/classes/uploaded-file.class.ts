export class UploadedFile {
  id: string;
  status: number;
  statusText: string;
  progress: Object;
  originalName: string;
  size: number;
  response: string;
  done: boolean;
  error: boolean;
  abort: boolean;
  startTime: number;
  endTime: number;
  speedAverage: number;
  speedAverageHumanized: string|null;

  constructor(id: string, originalName: string, size: number) {
    this.id = id;
    this.originalName = originalName;
    this.size = size;
    this.progress = {
      loaded: 0,
      total: 0,
      percent: 0,
      speed: 0,
      speedHumanized: null
    };
    this.done = false;
    this.error = false;
    this.abort = false;
    this.startTime = new Date().getTime();
    this.endTime = 0;
    this.speedAverage = 0;
    this.speedAverageHumanized = null;
  }

  setProgress(progress: Object): void {
    this.progress = progress;
  }

  setError(): void {
    this.error = true;
    this.done = true;
  }

  setAbort(): void {
    this.abort = true;
    this.done = true;
  }

  onFinished(status: number, statusText: string, response: string): void {
    this.endTime = new Date().getTime();
    this.speedAverage = this.size / (this.endTime - this.startTime) * 1000;
    this.speedAverage = parseInt(<any>this.speedAverage, 10);
    this.speedAverageHumanized = this.humanizeBytes(this.speedAverage);
    this.status = status;
    this.statusText = statusText;
    this.response = response;
    this.done = true;
  }

  humanizeBytes(bytes: number): string {
    if (bytes === 0) {
      return '0 Byte';
    }
    let k = 1024;
    const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    let i: number = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i] + '/s';
  }
}
