import {
  it,
  iit,
  describe,
  ddescribe,
  expect,
  inject,
  injectAsync,
  TestComponentBuilder,
  beforeEachProviders
} from 'angular2/testing';
import {provide} from 'angular2/core';
import {Ng2Uploader} from './ng2-uploader';


describe('Ng2Uploader Service', () => {

  beforeEachProviders(() => [Ng2Uploader]);


  it('should ...', inject([Ng2Uploader], (service:Ng2Uploader) => {

  }));

});
