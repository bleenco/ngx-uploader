import { NgUploaderService } from './ngx-uploader.class';
import { expect } from 'chai';
import 'mocha';
import { describe } from 'selenium-webdriver/testing';

import rewire = require('rewire');
let rewiredNgUploaderService = rewire('./ngx-uploader.class');

describe('NgUploaderService constructor', () => {
  it('without parameters should return allowedContentTypes = [\'*\']', () => {
    let uploader = new NgUploaderService();
    expect(uploader.contentTypes).to.have.lengthOf(1);
    expect(uploader.contentTypes).to.be.an('array').that.contain('*');
  });

  it('should return [\'image/jpeg\']', () => {
    let uploader = new NgUploaderService(1, ['image/jpeg']);
    expect(uploader.contentTypes).to.have.lengthOf(1);
    expect(uploader.contentTypes).to.be.an('array').that.not.contain('*');
    expect(uploader.contentTypes).to.be.an('array').that.contains('image/jpeg');
  });
});

describe('setContentTypes function', () => {
  let uploader = new NgUploaderService();

  it('should return [\'*\']', () => {
    uploader.setContentTypes(['*']);
    expect(uploader.contentTypes).to.have.lengthOf(1);
    expect(uploader.contentTypes).to.be.an('array').that.contain('*');
  });

  it('should return [\'image/jpeg\']', () => {
    uploader.setContentTypes(['image/jpeg']);
    expect(uploader.contentTypes).to.have.lengthOf(1);
    expect(uploader.contentTypes).to.be.an('array').that.contain('image/jpeg');
  });
});

describe('isContentTypeAllowed function', () => {
  var private_uploader = rewiredNgUploaderService.__get__('NgUploaderService');

  it('should return true', () => {
    let uploader = new private_uploader();
    expect(uploader.isContentTypeAllowed('all/you-can-eat')).is.true;
  });

  it('should return true', () => {
    let uploader = new private_uploader(1, ['image/jpeg', 'image/png', 'image/gif']);
    expect(uploader.isContentTypeAllowed('image/jpeg')).is.true;
    expect(uploader.isContentTypeAllowed('image/gif')).is.true;
    expect(uploader.isContentTypeAllowed('image/png')).is.true;
  });

  it('should return false', () => {
    let uploader = new private_uploader(1, ['image/jpeg', 'image/png', 'image/gif']);
    expect(uploader.isContentTypeAllowed('image/webm')).is.false;
  });
});

describe('allContentTypesAllowed function', () => {
  let rewiredUploader = rewiredNgUploaderService.__get__('NgUploaderService');

  it('should return true', () => {
    let uploader = new rewiredUploader();
    expect(uploader.allContentTypesAllowed()).is.true;
  });

  it('should return false', () => {
    let uploader = new rewiredUploader(1, ['image/jpeg', 'image/png', 'image/gif']);
    expect(uploader.allContentTypesAllowed()).is.false;
  });
});





