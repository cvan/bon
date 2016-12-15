'use strict';

var autoprefixer = require('gulp-autoprefixer');
var babelify = require('babelify');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var concat = require('gulp-concat');
var file = require('gulp-file');
var gls = require('gulp-live-server');
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var replace = require('gulp-replace');
var rimraf = require('rimraf');
var source = require('vinyl-source-stream');

var settings = require('./settings');

var server;
var watchEvent;

var isProd = process.env.NODE_ENVIRONMENT === 'production';

// DEVELOPMENT TASKS

/**
 * 1. Setup a web server with Live Reload.
 * 2. JS and CSS get processed and served from the `build` folder.
 */

// Task for setting up environment variables.
gulp.task('env', function () {
  process.env.APP_BASE_PATH = __dirname;
});

gulp.task('css', function () {
  // Extract the CSS from the JS Files and place into a single style with `autoprefixer`.
  return gulp.src('src/app/components/**/*.js')
    .pipe(replace(/(^[\s\S]*<style>|<\/style>[\s\S]*$)/gm, ''))
    .pipe(concat('style.css'))
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(gulp.dest('build/app'));
});

gulp.task('public', ['public-css', 'public-lib', 'browserify'], function () {
  return gulp.src('build/client/bundle.js')
    .pipe(gulp.dest('public/build/client'));
});

gulp.task('public-css', ['css'], function () {
  return gulp.src('build/app/**/*.css')
    .pipe(gulp.dest('public/build/app'));
});

gulp.task('public-lib', function () {
  return gulp.src('lib/**/*.js')
    .pipe(gulp.dest('public/lib'));
});

// Task for bundling JS using Browserify.
gulp.task('browserify', ['js-client', 'js-server', 'js-app'], function () {
  var b = browserify({
    entries: './build/client/index.js',
    debug: true,
    transform: [
      babelify.configure({
        optional: [
          'runtime',
          'es7.asyncFunctions'
        ]
      })
    ],
    fullPaths: true
  });
  return b.bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(gulp.dest('build/client'));
});

gulp.task('js-server', function () {
  return gulp.src('src/server/**/*.js')
    .pipe(gulp.dest('build/server'));
});

gulp.task('js-client', function () {
  return gulp.src('src/client/**/*.js')
    .pipe(gulp.dest('build/client'));
});

gulp.task('js-app', function () {
  return gulp.src('src/app/**/*.js')
    // Remove the styles (which were extracted).
    .pipe(replace(/<style>[\s\S]*<\/style>/gm, ''))
    .pipe(gulp.dest('build/app'));
});

// task for copying over root HTML file.
gulp.task('html', function () {
  gulp.src(['./index.html'])
    .pipe(gulp.dest('./build'));
});

gulp.task('build', ['html', 'public', 'env']);

// Task for serving assets.
gulp.task('serve', ['build'], function () {
  server = gls.new('app.js');
  server.start();

  if (!isProd) {
    gulp.watch(['./src/**/*.js'], function (event) {
      watchEvent = event;
      gulp.start('reload-server');
    });

    gulp.watch('app.js', server.start);
  }
});

gulp.task('reload-server', ['public'], function () {
  console.log('Reloading server!');
  server.notify(watchEvent);
});

// Delete `build` Directory.
gulp.task('delete-build', function () {
  rimraf('./build', function (err) {
    plugins.util.log(err);
  });
});

// Task for generating the Primus client.
gulp.task('primus', function () {
  var Primus = require('primus');
  var Emitter = require('primus-emitter');

  var primus = Primus.createServer(function connection (spark) {
  }, {
    port: settings.port,
    transformer: 'websockets'
  });

  primus.use('emitter', Emitter);

  var str = primus.library();

  return file('primus.js', str, {
    src: true
  }).pipe(gulp.dest('lib'));
});

// Default task.
gulp.task('default', ['serve']);
