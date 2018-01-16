'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var syncy = require('syncy');
let cleanCSS = require('gulp-clean-css');

// mise à jour des fichiers spécifiques provenant de node_modules
gulp.task('sync-jquery', (done) => {
    syncy(['node_modules/jquery/dist/*jquery.min.js'], 'js/', {
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
    syncy(['node_modules/popper.js/dist/umd/*popper.min.js'], 'js/', {
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
    syncy(['node_modules/bootstrap/dist/js/*bootstrap.min.js'], 'js/', {
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

// popup : sass -> css -> min
gulp.task('sass-popup', function () {
    return gulp.src('./scss/popup.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(rename('popup.css'))
        .pipe(gulp.dest('./app'))
        .on('end', function () {
            return gulp.src('./app/popup.css')
                .pipe(cleanCSS())
                .pipe(rename('popup-min.css'))
                .pipe(gulp.dest('./app'));
        });
});

// options : sass -> css -> min
gulp.task('sass-options', function () {
    return gulp.src('./scss/options.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(rename('options.css'))
        .pipe(gulp.dest('./app'))
        .on('end', function () {
            return gulp.src('./app/options.css')
                .pipe(cleanCSS())
                .pipe(rename('options-min.css'))
                .pipe(gulp.dest('./app'));
        });
});

// watch
gulp.task('watch', function () {
    gulp.watch('scss/**/*.scss', ['sass-popup']);
    gulp.watch('scss/**/*.scss', ['sass-options']);
});

gulp.task('default', ['sync-jquery', 'sync-popper', 'sync-bootstrap', 'sync-fa', 'sass-popup', 'sass-options', 'watch']);
