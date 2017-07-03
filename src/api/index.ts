import * as path from 'path';
import * as express from 'express';
import * as multer from 'multer';
import * as rimraf from 'rimraf';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import { mkdirSync, existsSync } from 'fs';
const config = require('../../config.json');
const uploadsDir = path.resolve(__dirname, 'uploads');

if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir);
}

let storage: multer.StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    cb(null, `${Math.random().toString(36).substring(7)}${ext}`);
  }
});

let upload: multer.Instance = multer({ storage: storage });

export let uploadRouter = express.Router();

uploadRouter.post('/upload', upload.any(), (req: express.Request, res: express.Response) => {
  rimraf.sync(`${uploadsDir}/**/*`);
  res.status(200).json(req.files);
});

function index(req: express.Request, res: express.Response): void {
  return res.status(200).sendFile(path.resolve(__dirname, '../index.html'));
}

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(uploadRouter);

app.use('/css', express.static(path.resolve(__dirname, '../css'), { index: false }));
app.use('/js', express.static(path.resolve(__dirname, '../js'), { index: false }));
app.use('/images', express.static(path.resolve(__dirname, '../images'), { index: false }));
app.use('/css/fonts', express.static(path.resolve(__dirname, '../fonts'), { index: false }));
app.get('/', index);

app.listen(config.port, () => console.log(`Server running on port ${config.port}...`));
