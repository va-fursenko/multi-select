var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    livereload = require('gulp-livereload'),
    vueify = require('gulp-vueify'),
    webpack = require('webpack-stream'),
    fs = require('fs');

var srcPath = './src',
    distPath = './dist';

gulp.task('js', function () {
    return gulp.src([
        srcPath + '/**/*.js',
        srcPath + '/**/*.vue'
    ])
    .pipe(vueify())
    .pipe(sourcemaps.init())
    .pipe(uglify({
        compress: {
            drop_debugger: false
        }
    }))
    .on('error', function (err) {
        console.log(err);
    })
    .pipe(concat('vue-multi-select.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(distPath))
    .pipe(livereload());
});