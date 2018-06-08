import * as path from 'path';
import * as express from 'express';
import * as multer from 'multer';
import * as rimraf from 'rimraf';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import { mkdirSync, existsSync } from 'fs';
const config = {
  port: 4900
};
const uploadsDir = path.resolve(__dirname, 'uploads');

if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir);
}

const storage: multer.StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Math.random().toString(36).substring(7)}${ext}`);
  }
});

const upload: multer.Instance = multer({ storage: storage });

export const uploadRouter = express.Router();

uploadRouter.post('/upload', upload.any(), (req: express.Request, res: express.Response) => {
  rimraf.sync(`${uploadsDir}/**/*`);
  res.status(200).json(req.files);
});

function index(req: express.Request, res: express.Response): void {
  return res.status(200).sendFile(path.resolve(__dirname, '../ngx-uploader-demo/index.html'));
}

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(uploadRouter);

app.get('*.*', express.static(path.resolve(__dirname, '../ngx-uploader-demo'), { index: false }));
app.get('*', index);

app.listen(config.port, () => console.log(`Server running on port ${config.port}...`));
