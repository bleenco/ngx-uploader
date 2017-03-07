import path from 'path';
import { readFileSync } from 'fs';
import node from 'rollup-plugin-node-resolve';
import buble from 'rollup-plugin-buble';

let pkg = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json')));

export default {
  entry: 'ngx-uploader.js',
  dest: 'bundle/ngx-uploader.umd.js',
  format: 'umd',
  moduleName: 'ngx-uploader',
  context: 'this',
  plugins: [ node(), buble() ],
  external: Object.keys(pkg.devDependencies),
  globals: {
    '@angular/core': 'vendor._angular_core',
    '@angular/common': 'vendor._angular_common',
    '@angular/platform-browser': 'vendor._angular_platformBrowser',
    '@angular/platform-browser-dynamic': 'vendor._angular_platformBrowserDynamic',
    '@angular/router': 'vendor._angular_router',
    '@angular/http': 'vendor._angular_http',
    '@angular/forms': 'vendor._angular_forms',
    'rxjs': 'vendor.rxjs'
  }
}
