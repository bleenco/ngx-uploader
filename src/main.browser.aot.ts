import './styles';
import './polyfills';
import { platformBrowser } from '@angular/platform-browser';
import { enableProdMode } from '@angular/core';
import { BrowserAppModuleNgFactory } from './ngfactory/app/browser-app.module.ngfactory';

enableProdMode();
platformBrowser().bootstrapModuleFactory(BrowserAppModuleNgFactory);
