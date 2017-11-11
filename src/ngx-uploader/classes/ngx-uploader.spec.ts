import { NgUploaderService, humanizeBytes } from './ngx-uploader.class';
import { expect } from 'chai';
import 'mocha';
import { describe } from 'selenium-webdriver/testing';

import * as rewire from 'rewire';
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
  let rewiredUploader = rewiredNgUploaderService.__get__('NgUploaderService');

  it('should return true', () => {
    let uploader = new rewiredUploader();
    expect(uploader.isContentTypeAllowed('all/you-can-eat')).is.true;
  });

  it('should return true', () => {
    let uploader = new rewiredUploader(1, ['image/jpeg', 'image/png', 'image/gif']);
    expect(uploader.isContentTypeAllowed('image/jpeg')).is.true;
    expect(uploader.isContentTypeAllowed('image/gif')).is.true;
    expect(uploader.isContentTypeAllowed('image/png')).is.true;
  });

  it('should return false', () => {
    let uploader = new rewiredUploader(1, ['image/jpeg', 'image/png', 'image/gif']);
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

describe('humanizeBytes function', () => {
  it('should return 0 Bytes', () => {
    expect(humanizeBytes(0)).to.equal('0 Byte');
  });

  it('should return 1 KB', () => {
    expect(humanizeBytes(1024)).to.equal('1 KB');
  });

  it('should return 1.5 KB', () => {
    expect(humanizeBytes(1536)).to.equal('1.5 KB');
  });

  it('should return 1.75 KB', () => {
    expect(humanizeBytes(1792)).to.equal('1.75 KB');
  });

  it('should return 2 KB', () => {
    expect(humanizeBytes(2048)).to.equal('2 KB');
  });

  it('should return 1 MB', () => {
    expect(humanizeBytes(1048576)).to.equal('1 MB');
  });

  it('should return 1 GB', () => {
    expect(humanizeBytes(1073741824)).to.equal('1 GB');
  });

  it('should return 1 TB', () => {
    expect(humanizeBytes(1099511627776)).to.equal('1 TB');
  });

  it('should return 1 PB', () => {
    expect(humanizeBytes(1125899906842624)).to.equal('1 PB');
  });
});




