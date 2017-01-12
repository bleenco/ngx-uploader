const gulp = require('gulp');
const typedoc = require('gulp-typedoc');
const conventionalChangelog = require('gulp-conventional-changelog');

gulp.task('changelog', () => {
  return gulp.src('CHANGELOG.md', {
    buffer: false
  })
  .pipe(conventionalChangelog({
    preset: 'angular',
    releaseCount: 1
  }, {
    currentTag: require('./package.json').version
  }))
  .pipe(gulp.dest('./'));
});

gulp.task('docs', () => {
  return gulp.src([
    'index.ts',
    '!node_modules/**/*'])
    .pipe(typedoc({
      name: 'ngx-uploader docs',
      mode: 'file',
      out: 'docs',
      ignoreCompilerErrors: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      target: 'ES5',
      moduleResolution: 'node',
      preserveConstEnums: true,
      stripInternal: true,
      suppressExcessPropertyErrors: true,
      suppressImplicitAnyIndexErrors: true,
      module: 'commonjs',
      ignoreCompilerErrors: true,
      noLib: true
    }));
});
