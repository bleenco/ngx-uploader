import * as cors from 'cors';
import * as fs from 'fs';
import * as path from 'path';
import * as express from 'express';
import * as multer from 'multer';
import * as bodyParser from 'body-parser';
import * as rimraf from 'rimraf';

let configFile: string = path.resolve(__dirname, '../config.json');
let config: any = JSON.parse(fs.readFileSync(configFile, 'utf8'));
let app: express.Application = express();

app.use(cors());
app.use(bodyParser.json());

let storage: multer.StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    cb(null, `${Math.random().toString(36).substring(7)}${ext}`);
  }
});

let upload: multer.Instance = multer({ storage: storage });

app.get('/', (req: express.Request, res: express.Response) => {
  res.status(200).send('Fake Upload Service Running.');
});

app.post('/upload', upload.any(), (req: express.Request, res: express.Response) => {
  rimraf.sync(path.resolve(__dirname, '../uploads/*'));
  res.status(200).json(req.files);
});

app.listen(config.port, () => console.log(`Server running on port ${config.port}`));
