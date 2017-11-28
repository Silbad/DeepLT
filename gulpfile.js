'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var syncy = require('syncy');
let cleanCSS = require('gulp-clean-css');

// mise à jour des fichiers spécifiques provenant de node_modules
gulp.task('sync-jquery', (done) => {
    syncy(['node_modules/jquery/dist/*.js'], 'js/', {
        verbose: true,
        updateAndDelete: false,
        base: 'node_modules/jquery/dist/'
    })
    .then(() => {
        done();
    })
    .catch((err) => {
        done(err);
    });
});

gulp.task('sync-popper', (done) => {
    syncy(['node_modules/popper.js/dist/umd/*.js'], 'js/', {
        verbose: true,
        updateAndDelete: false,
        base: 'node_modules/popper.js/dist/umd/'
    })
    .then(() => {
        done();
    })
    .catch((err) => {
        done(err);
    });
});

gulp.task('sync-bootstrap', (done) => {
    syncy(['node_modules/bootstrap/dist/js/*.js'], 'js/', {
        verbose: true,
        updateAndDelete: false,
        base: 'node_modules/bootstrap/dist/js/'
    })
    .then(() => {
        done();
    })
    .catch((err) => {
        done(err);
    });
});

gulp.task('sync-fa', (done) => {
    syncy(['node_modules/font-awesome/fonts/**'], 'fonts/', {
        verbose: true,
        base: 'node_modules/font-awesome/fonts/'
    })
    .then(() => {
        done();
    })
    .catch((err) => {
        done(err);
    });
});

// sass -> css -> min
gulp.task('sass', function () {
    return gulp.src('./scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(rename('deeplt.css'))
        .pipe(gulp.dest('./css'))
        .on('end', function () {
            return gulp.src('./css/*.css')
                .pipe(cleanCSS())
                .pipe(rename('deeplt-min.css'))
                .pipe(gulp.dest('./css'));
        });
});

// watch
gulp.task('watch', function () {
    gulp.watch('scss/**/*.scss', ['sass']);
});

gulp.task('default', ['sync-jquery', 'sync-popper', 'sync-bootstrap', 'sync-fa', 'sass', 'watch']);
