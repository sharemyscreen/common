const fs = require('fs');
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const changelog = require('gulp-changelogmd');

gulp.task('default', function () {

});

gulp.task('lint', function () {
  return gulp.src(['./*.js', './lib/**/*.js', './test/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

// Versioning

gulp.task('changelog', function () {
  const pkg = JSON.parse(fs.readFileSync('./package.json'));

  return gulp.src('./CHANGELOG.md')
    .pipe(changelog(pkg.version))
    .pipe(gulp.dest('./'));
});

gulp.task('version', function () {
  const pkg = JSON.parse(fs.readFileSync('./package.json'));

  console.info(pkg.version);
});
