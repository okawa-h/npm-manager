const gulp    = require('gulp');
const _stylus = require('stylus');
const stylus  = require('gulp-stylus');
const plumber = require('gulp-plumber');
const notify  = require('gulp-notify');
const runSequence   = require('run-sequence');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config');
const webpack = require('webpack');

const stylusPath = './src/stylus/**/';

gulp.task('style', () => {

	return gulp.src(stylusPath + '!(_)*.styl')
	.pipe(plumber({ errorHandler:notify.onError('<%= error.message %>') }))
	.pipe(stylus({ compress:true }))
	.pipe(gulp.dest('./app/files/css'));
	
});

gulp.task('js', () => {

	return webpackStream(webpackConfig, webpack)
	.pipe(plumber({ errorHandler:notify.onError('<%= error.message %>') }))
	.pipe(gulp.dest('./app/files/js'));

});

gulp.task('watch', () => {

	gulp.watch(stylusPath + '*.styl', ['style']);
	gulp.watch('./src/typescript/**/*.ts', ['js']);

});

gulp.task('default', () => {

	return runSequence(['style','js']);

});
