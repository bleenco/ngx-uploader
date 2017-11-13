import { NgUploaderService, humanizeBytes } from './ngx-uploader.class';

describe('NgUploaderService constructor', () => {
  it('without parameters should return allowedContentTypes = [\'*\']', () => {
    let uploader: NgUploaderService = new NgUploaderService();
    expect(uploader.contentTypes.length).toEqual(1);
    expect(uploader.contentTypes).toEqual(['*']);
  });

  it('should return [\'image/jpeg\']', () => {
    let uploader = new NgUploaderService(1, ['image/jpeg']);
    expect(uploader.contentTypes.length).toEqual(1);
    expect(uploader.contentTypes).not.toContain('*');
    expect(uploader.contentTypes).toContain('image/jpeg');
    expect(uploader.contentTypes).toEqual(['image/jpeg']);
  });
});

describe('setContentTypes function', () => {
  let uploader = new NgUploaderService();

  it('should return [\'*\']', () => {
    uploader.setContentTypes(['*']);
    expect(uploader.contentTypes.length).toEqual(1);
    expect(uploader.contentTypes).toContain('*');
    expect(uploader.contentTypes).toEqual(['*']);
  });

  it('should return [\'image/jpeg\']', () => {
    uploader.setContentTypes(['image/jpeg']);
    expect(uploader.contentTypes.length).toEqual(1);
    expect(uploader.contentTypes).toContain('image/jpeg');
    expect(uploader.contentTypes).toEqual(['image/jpeg']);
  });
});

describe('isContentTypeAllowed function', () => {
  it('should return true', () => {
    let uploader = new NgUploaderService();
    expect(uploader.isContentTypeAllowed('all/you-can-eat')).toBeTruthy();
  });

  it('should return true', () => {
    let uploader = new NgUploaderService(1, ['image/jpeg', 'image/png', 'image/gif']);
    expect(uploader.isContentTypeAllowed('image/jpeg')).toBeTruthy();
    expect(uploader.isContentTypeAllowed('image/gif')).toBeTruthy();
    expect(uploader.isContentTypeAllowed('image/png')).toBeTruthy();
  });

  it('should return false', () => {
    let uploader = new NgUploaderService(1, ['image/jpeg', 'image/png', 'image/gif']);
    expect(uploader.isContentTypeAllowed('image/webm')).toBeFalsy();
  });
});

describe('allContentTypesAllowed function', () => {
  it('should return true', () => {
    let uploader = new NgUploaderService();
    expect(uploader.allContentTypesAllowed()).toBeTruthy();
  });

  it('should return false', () => {
    let uploader = new NgUploaderService(1, ['image/jpeg', 'image/png', 'image/gif']);
    expect(uploader.allContentTypesAllowed()).toBeFalsy();
  });
});

describe('humanizeBytes function', () => {
  it('should return 0 Bytes', () => {
    expect(humanizeBytes(0)).toEqual('0 Byte');
  });

  it('should return 1 KB', () => {
    expect(humanizeBytes(1024)).toEqual('1 KB');
  });

  it('should return 1.5 KB', () => {
    expect(humanizeBytes(1536)).toEqual('1.5 KB');
  });

  it('should return 1.75 KB', () => {
    expect(humanizeBytes(1792)).toEqual('1.75 KB');
  });

  it('should return 2 KB', () => {
    expect(humanizeBytes(2048)).toEqual('2 KB');
  });

  it('should return 1 MB', () => {
    expect(humanizeBytes(1048576)).toEqual('1 MB');
  });

  it('should return 1 GB', () => {
    expect(humanizeBytes(1073741824)).toEqual('1 GB');
  });

  it('should return 1 TB', () => {
    expect(humanizeBytes(1099511627776)).toEqual('1 TB');
  });

  it('should return 1 PB', () => {
    expect(humanizeBytes(1125899906842624)).toEqual('1 PB');
  });
});
