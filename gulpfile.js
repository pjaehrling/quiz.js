var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('default', ['minquiz']);

gulp.task('minquiz', function() {
  gulp.src(['./js/player.js', './js/question.js', './js/quiz.js'])
    .pipe(concat('quiz.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./js/'))
});