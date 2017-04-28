import 'core-js/es6/reflect';
import 'core-js/es7/reflect';
import 'zone.js/dist/zone-node';
import 'rxjs';
import * as express from 'express';
import { platformServer, renderModuleFactory } from '@angular/platform-server';
import { ServerAppModule } from './app/server-app.module';
import { universalExpressEngine } from './universal';
import { ROUTES } from './routes';
import { enableProdMode } from '@angular/core';
import { uploadRouter } from './api';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
const config = require('../config.json');

enableProdMode();

const app = express();
const port = config.port;

app.use(cors());
app.use(bodyParser.json());
app.engine('html', universalExpressEngine({
  ngModule: ServerAppModule
}));

app.use(cors());
app.use(bodyParser.json());
app.set('view engine', 'html');
app.set('views', 'dist');

app.use('/', express.static('dist', { index: false }));

ROUTES.forEach(route => {
  app.get(route, (req: express.Request, res: express.Response) => {
    console.time(`GET: ${ req.originalUrl }`);
    res.render('index', { req: req, res: res });
    console.timeEnd(`GET: ${ req.originalUrl }`);
  });
});

app.use(uploadRouter);

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
