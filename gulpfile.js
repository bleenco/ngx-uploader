const gulp = require('gulp');
const typedoc = require('gulp-typedoc');

gulp.task('docs', () => {
  return gulp.src([
    'index.ts',
    '!node_modules/**/*'])
    .pipe(typedoc({
      name: 'ng2-uploader docs',
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
