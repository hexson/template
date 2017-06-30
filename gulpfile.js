var gulp = require('gulp');
var del = require('del');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');


var NODE_ENV = process.env.NODE_ENV || '';

var isDev = function(){
  return NODE_ENV.trim() === 'development';
}();

var isProd = function(){
  return NODE_ENV.trim() === 'production';
}();


gulp.task('clean', function(cb){
  var stream = del(['dist/**/*'], cb);
  return stream;
});

gulp.task('build', ['clean'], function(){
  gulp.src('src/template.js')
      .pipe(uglify())
      .pipe(rename({ suffix: '.min' }))
      .pipe(gulp.dest('dist/'));
});

var taskList = [];

gulp.task('default', taskList);