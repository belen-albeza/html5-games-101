'use strict';

const gulp = require('gulp');
const gutil = require('gulp-util');
const pug = require('gulp-pug');
const ghPages = require('gulp-gh-pages');

const browserSync = require('browser-sync').create();
const del = require('del');

gulp.task('pug', function () {
    return gulp.src('src/index.pug')
        .pipe(pug({pretty: true}))
        .on('error', gutil.log)
        .pipe(gulp.dest('.tmp'))
        .pipe(browserSync.stream());
});

gulp.task('build', ['pug']);

gulp.task('clean', function () {
    return del(['.tmp', 'dist']);
});

gulp.task('dev', ['build'], function () {
    gulp.watch('src/**/*.{css,js}').on('change', browserSync.reload);
    gulp.watch('src/index.pug', ['pug']);

    browserSync.init({
        server: ['src', '.tmp']
    });
});

gulp.task('dist', ['build'], function () {
    return gulp.src(['.tmp/**/*', 'src/**/*', '!**/*.pug'])
        .pipe(gulp.dest('dist'));
});

gulp.task('deploy', ['dist'], function () {
    return gulp.src(['dist/**/*'])
        .pipe(ghPages());
});
