var gulp = require('gulp'), // сам gulp
    autoprefixer = require('autoprefixer'), // префиксы для css-стилей
    cssnext = require('cssnext'), // для autoprefixer
    precss = require('precss'), // для autoprefixer
    postcss = require('gulp-postcss'), // для autoprefixer
    watch = require('gulp-watch'), // смотреть за файлами
    browserSync = require('browser-sync').create(), // Сервер
    concat = require('gulp-concat'), // соединение файлов
    uglify = require('gulp-uglify'), // сжатие js
    styl = require('gulp-stylus'), // для stylus
    validator = require('gulp-html'), // обработка  html
    imagemin = require('gulp-imagemin'), // сжатие изображений
    rigger = require('gulp-rigger'), // вкладывать части в один файл
    htmlmin = require('gulp-htmlmin'), // минификатор html
    uncss = require('gulp-uncss'), // удаление неиспользуемых css
    nano = require('gulp-cssnano'); // 

var reload = '.pipe(browserSync.reload({ stream: true }))';
var bld = 'app/build';

//  Сервер
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "app"
        }
    });
})

// Наблюдение за изменениями
gulp.task('watch', ['css', 'html', 'styl'], function() {
    gulp.watch('bld/html/*.html', ['html'])
    gulp.watch('bld/css/*.css', ['css'])
    gulp.watch('bld/styl/*.styl', ['styl'])
    gulp.watch('bld/js/*.js', ['scripts'])
});

// html

// Сборка в 1 файл
gulp.task('html', function() {
    return gulp.src('bld/html/index.html')
        .pipe(rigger())
        .pipe(gulp.dest('app'))
    reload
});

// Минификация готового файла
gulp.task('minify', function() {
    return gulp.src('app/index.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('dist'));
    reload
});

// Css

// Stylus
gulp.task('styl', function() {
    return gulp.src('bld/styl/*.styl')
        .pipe(styl({
            compress: true
        }))
        .pipe(gulp.dest('bld/css'))
})

// Js
gulp.task('scripts', function() {
    return gulp.src('bld/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('app/js'));
})

// Js-перенос
gulp.task('js-replace', function() {
    return gulp.src('app/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
})




// таски по умолчанию
gulp.task('default', ['html', 'minify', 'styl', 'scripts', 'js-replace', 'watch', 'browser-sync']);