import * as path from 'path';
import * as express from 'express';
import * as multer from 'multer';
import * as rimraf from 'rimraf';

let storage: multer.StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    cb(null, `${Math.random().toString(36).substring(7)}${ext}`);
  }
});

let upload: multer.Instance = multer({ storage: storage });

export let uploadRouter = express.Router();

uploadRouter.post('/upload', upload.any(), (req: express.Request, res: express.Response) => {
  rimraf.sync('uploads/**/*');
  res.status(200).json(req.files);
});
