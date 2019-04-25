var gulp            = require('gulp');
var $               = require('gulp-load-plugins')();
// var jade         = require('gulp-jade');
// var sass         = require('gulp-sass');
// var plumber      = require('gulp-plumber');
// var postcss      = require('gulp-postcss');
var autoprefixer    = require('autoprefixer');
var mainBowerFiles  = require('main-bower-files');
var browserSync     = require('browser-sync').create();
var minimist        = require('minimist');
var gulpSequence    = require('gulp-sequence')

var envOptions = {
    string: 'env',
    default: {
        env: 'develop'
    }
}
var options = minimist(process.argv.slice(2), envOptions);

gulp.task('copyHTML',function(){
    return gulp.src('./source/**/*.html')
    .pipe(gulp.dest('./public/'))
});

// jade
gulp.task('jade', function () {
    gulp.src('./source/*.jade')
        .pipe($.plumber())
        .pipe($.jade({
            pretty: true
        }))
        .pipe(gulp.dest('./public/'))
        .pipe(browserSync.stream())
});

// sass
gulp.task('sass', function () {
    var plugins = [
        autoprefixer({ browsers: ['last 2 version'] }),
    ];
    return gulp.src('./source/scss/**/*.scss')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.sass().on('error', $.sass.logError))
        // 編譯完成 css
        .pipe($.postcss(plugins))
        // .pipe($.if(options.env === 'production',$.minifyCss()))
        .pipe($.minifyCss())
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('./public/css'))
        .pipe(browserSync.stream())
});

// ES6
gulp.task('babel', () =>
    gulp.src('./source/js/**/*.js')
        .pipe($.sourcemaps.init())
        .pipe($.babel({
            presets: ['@babel/env']
        }))
        .pipe($.concat('all.js'))
        .pipe($.uglify())
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('./public/js'))
        .pipe(browserSync.stream())
);

// bower TASKNAME
gulp.task('bower', function () {
    // return gulp.src(mainBowerFiles())
    //     .pipe(gulp.dest('./.tmp/vendors'))
    return gulp.src(mainBowerFiles({
        "overrides": {
            "vue": {                       // 套件名稱
                "main": "dist/vue.js"      // 取用的資料夾路徑
            }
        }
    }))
        .pipe(gulp.dest('./.tmp/vendors'));
    cb(err);
});

// 壓縮檔案到指定資料夾
gulp.task('vendorsJs',['bower'], function () {
    return gulp.src('./.tmp/vendors/**/**.js')
        .pipe($.concat('vendors.js'))
        .pipe($.uglify({
            compress:{
                drop_console: true
            }
        }))
        .pipe(gulp.dest('./public/js'));
});

gulp.task('browser-sync',function(){
    browserSync.init({
        server:{
            baseDir:"./public"
        }
    });
});

// clean  刪除資料夾
gulp.task('clean', function () {
    return gulp.src(['./.tmp','./public'], { read: false })
        .pipe($.clean());
});

gulp.task('clean', function () {
    return gulp.src(['./.tmp', './public'], { read: false })
        .pipe($.clean());
});

gulp.task('watch', function () {
    gulp.watch('./source/scss/**/*.scss', ['sass']);
    gulp.watch('./source/js/**/*.js', ['babel']);
    gulp.watch('./source/*.jade', ['jade']);
});

gulp.task('deploy', function () {
    return gulp.src('./public/**/*')
        .pipe($.ghPages());
});

// 發布正式檔案
gulp.task('sequence', gulpSequence('clean', 'jade', 'sass', 'babel', 'vendorsJs'))

gulp.task('default', ['jade', 'sass', 'babel', 'vendorsJs','browser-sync','watch']);