import * as fs from 'fs';
import * as express from 'express';
import { Provider, NgModuleFactory, NgModuleRef, PlatformRef, ApplicationRef, Type } from '@angular/core';
import { platformServer, platformDynamicServer, PlatformState, INITIAL_CONFIG } from '@angular/platform-server';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/first';

export interface UniversalSetupOptions {
  aot?: boolean;
  universalOnInit?: string;
  ngModule: Type<{}> | NgModuleFactory<{}>;
  providers?: Provider[];
}

export interface UniversalOnInit {
  universalOnInit(moduleRef?: NgModuleRef<{}>, setupOptions?: UniversalSetupOptions): void;
}

const templateCache: { [key: string]: string } = {};

export function universalExpressEngine(setupOptions: UniversalSetupOptions) {
  setupOptions.providers = setupOptions.providers || [];
  setupOptions.universalOnInit = setupOptions.universalOnInit || 'universalOnInit';

  return function (filePath: string, options: { req: express.Request, res?: express.Response }, callback: express.Send) {
    try {
      const moduleFactory = setupOptions.ngModule;

      if (!moduleFactory) {
        throw new Error('You must pass a NgModule or NgModuleFactory to be bootstrapped.');
      }

      const extraProviders = setupOptions.providers.concat(
        getReqResProviders(options.req, options.res),
        [{ provide: INITIAL_CONFIG, useValue: { document: getDocument(filePath), url: options.req.url } }]
      );

      const moduleRefPromise = (moduleFactory.constructor === NgModuleFactory || setupOptions.aot) ?
        platformServer(extraProviders).bootstrapModuleFactory(<NgModuleFactory<{}>>moduleFactory) :
        platformDynamicServer(extraProviders).bootstrapModule(<Type<{}>>moduleFactory);

      moduleRefPromise.then((moduleRef: NgModuleRef<{}>) => {
        handleModuleRef(moduleRef, callback, setupOptions);
        return moduleRef;
      });
    } catch (e) {
      callback(e);
    }
  }
}

function getReqResProviders(req: express.Request, res: express.Response): Provider[] {
  const providers: Provider[] = [{ provide: 'REQUEST', useValue: req }];

  if (res) {
    providers.push({
      provide: 'RESPONSE',
      useValue: res
    });
  }

  return providers;
}

function getDocument(filePath: string): string {
  return templateCache[filePath] = templateCache[filePath] || fs.readFileSync(filePath).toString();
}

function handleModuleRef(moduleRef: NgModuleRef<{}>, callback: express.Send, setupOptions: UniversalSetupOptions) {
  const state = moduleRef.injector.get(PlatformState);
  const appRef = moduleRef.injector.get(ApplicationRef);

  appRef.isStable
    .filter((isStable: boolean) => isStable)
    .first()
    .subscribe((stable: boolean) => {
      try {
        if (!(<any>moduleRef).instance[setupOptions.universalOnInit]) {
          console.log(`Universal Error: Please provide ${setupOptions.universalOnInit} on the ngModule ${moduleRef}`);
        }

        (<any>moduleRef).instance[setupOptions.universalOnInit](moduleRef, setupOptions);
      } catch (e) {
        console.log('Universal Error', e);
      }

      callback(null, state.renderToString());
      moduleRef.destroy();
    }, (err) => console.log('Universal Error', err));
}
