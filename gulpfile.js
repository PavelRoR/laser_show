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

//  Сервер
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "app"
        }
    });
})

// Наблюдение за изменениями
gulp.task('watch', ['html', 'styl', 'css'], function() {
    gulp.watch('app/build/html/*.html', ['html'])
    gulp.watch('app/build/css/*.css', ['css'])
    gulp.watch('app/build/styl/*.styl', ['styl'])
    gulp.watch('app/build/js/*.js', ['scripts'])
});

// html

// Сборка в 1 файл
gulp.task('html', function() {
    return gulp.src('app/build/index.html')
        .pipe(rigger())
        .pipe(gulp.dest('app'))
        .pipe(browserSync.reload({ stream: true }))
});

// Минификация готового файла
gulp.task('minify', function() {
    return gulp.src('app/index.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.reload({ stream: true }))
});

// Css

// Stylus
gulp.task('styl', function() {
    return gulp.src('app/build/styl/*.styl')
        .pipe(styl({
            compress: true
        }))
        .pipe(gulp.dest('app/build/css'))
})

//  Соединение в 1 файл
gulp.task('cssconcat', function() {
    return gulp.src('app/build/css/*.css')
        .pipe(concat('main.css'))
        .pipe(uncss({
            html: ['index.html', 'app/index.html']
        }))
        .pipe(nano())
        .pipe(gulp.dest('app/css'));
});

//  Добавление префиксов
gulp.task('css', function() {
    var processors = [
        autoprefixer({
            browsers: ['last 9 versions']
        }),
        cssnext,
        precss
    ];
    return gulp.src('app/css/main.css')
        .pipe(postcss(processors))
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.reload({ stream: true }))
});

// Js
gulp.task('scripts', function() {
    return gulp.src('app/build/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('app/js'));
})

// Js-перенос
gulp.task('js-replace', function() {
    return gulp.src('app/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
})

gulp.task('image', function() {
    gulp.src('app/build/img/*')
        .pipe(gulp.dest('app/img'))
        .pipe(gulp.dest('dist/img'))
        .pipe(browserSync.reload({ stream: true }))
});


// таски по умолчанию
gulp.task('default', ['html', 'minify', 'styl', 'cssconcat', 'css', 'scripts', 'js-replace', 'image', 'watch', 'browser-sync']);