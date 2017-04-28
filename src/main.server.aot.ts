import 'core-js/es6/reflect';
import 'core-js/es7/reflect';
import 'zone.js/dist/zone-node';
import 'rxjs';
import * as express from 'express';
import { platformServer, renderModuleFactory } from '@angular/platform-server';
import { ServerAppModuleNgFactory } from './ngfactory/app/server-app.module.ngfactory';
import { universalExpressEngine } from './universal';
import { ROUTES } from './routes';
import { enableProdMode } from '@angular/core';

enableProdMode();

const app = express();
const port = 8000;

app.engine('html', universalExpressEngine({
  ngModule: ServerAppModuleNgFactory
}));

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

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
