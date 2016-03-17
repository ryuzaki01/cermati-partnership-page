'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var less = require('gulp-less');
var util = require('gulp-util');
var minifyCSS = require('gulp-minify-css');
var livereload = require('gulp-livereload');
var del = require('del');
var imageMin = require('gulp-imagemin');
var jpegRecompress = require('imagemin-jpeg-recompress');
var pngQuant = require('imagemin-pngquant');
var webpackStream = require('webpack-stream');
var autoprefixer = require('gulp-autoprefixer');

require('dotenv').load({path: '.env'});

/*
 * Create variables for our project paths so we can change in one place
 */
var paths = {
  src: ['package.json'],
  watch: {
    files: [
      './css/*.less'
    ]
  },
  less: ['./css/*.less'],
  vendorCss: [
    './js/jquery-ui/jquery-ui.min.css',
    './js/jquery-ui/jquery.responsiveTabs.css'
  ],

  // TODO: Can't move this to dist easily. i have to update all css reference for each plugin
  cssOutput: './dist/css/',
  cssOutputFilePattern: '*.css',
  cssOutputFileName: 'all.min.css',
  vendorCssOutputFileName: 'vendor.min.css',
  images: ['./images/*'],

  // TODO: the dist/image is not used for now and it is ignore in the .gitignore. We need to update a bunch of css.
  // will do this when we update the css
  imageOutput: './dist/images/',
  mainScript: 'main',
  clientScriptOutput: './dist/js/',
  clientScriptOutputFileName: 'main.js'
};

// You can use multiple globbing patterns as you would with `gulp.src`
gulp.task('cleanCss', function (cb) {
  del([
    paths.cssOutput + paths.cssOutputFilePattern
  ], cb);
});

// You can use multiple globbing patterns as you would with `gulp.src`
gulp.task('cleanClientScript', function (cb) {
  del([
    paths.clientScriptOutput
  ], cb);
});

gulp.task('cleanImages', function (cb) {
  del([
    paths.imageOutput
  ], cb);
});

gulp.task('less', ['cleanCss'], function () {
  var prefixerPipe = autoprefixer({
    browsers: '> 1%',
    cascade: false
  });

  return gulp.src(paths.less)
    .pipe(less({compress: true}).on('error', util.log))
    .pipe(concat(paths.cssOutputFileName))
    .pipe(prefixerPipe)
    .pipe(minifyCSS())
    .pipe(gulp.dest(paths.cssOutput))
    .pipe(livereload());
});

gulp.task('css', ['less'], function () {
  return gulp.src(paths.vendorCss)
    .pipe(concat(paths.vendorCssOutputFileName))
    .pipe(minifyCSS())
    .pipe(gulp.dest(paths.cssOutput))
    .pipe(livereload());
});

gulp.task('clientScript', [ 'cleanClientScript'], function () {
  return webpackStream(require('./webpack.config'))
  .pipe(gulp.dest(paths.clientScriptOutput));
});

// Copy all static images
gulp.task('images', ['cleanImages'], function () {
  return gulp.src(paths.images)

    // Pass in options to the task
    .pipe(imageMin({
      optimizationLevel: 6,
      progressive: true
    }))
    .pipe(pngQuant({quality: '65-80', speed: 2})())
    .pipe(jpegRecompress({
        quality: 'medium',
        loops: 2,
        min: 65,
        max: 90
      })())
    .pipe(gulp.dest(paths.imageOutput));
});

// ------------------------------------
// Watch tasks
// ------------------------------------
gulp.task('watch-less', function () {
  livereload.listen();
  gulp.watch(paths.watch.files, ['css']);
});

// In the CI we want to run the client script and build css
gulp.task('build', ['clientScript', 'css', 'images'], function () {
  if (process.env.SHIPPABLE) {
    // This is needed because keystone.mongoose.disconnect sometimes didn't kill the process
    // so in CI environment, the process can be running forever
    process.exit(0);
  }
});

// Default task for local environment
gulp.task('default', ['build', 'images']);
