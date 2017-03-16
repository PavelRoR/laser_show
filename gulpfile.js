var gulp = require('gulp'), // сам gulp
    pug = require('gulp-pug'), // Сборка pug
    gutil = require('gulp-util'), // Вывод ошибок
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
    plumber = require("gulp-plumber"), //предохранитель для остановки гальпа
    nano = require('gulp-cssnano'); // 

//  Сервер
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "app"
        }
    })
})

// Наблюдение за изменениями
gulp.task('watch', ['pug', 'styl', 'css', 'scripts'], function() {
    gulp.watch(['app/build/pug/*.pug',
            'app/build/index.pug',
        ], ['pug'])
        // gulp.watch('app/build/html/*.html', ['html'])
    gulp.watch('app/build/css/*.css', ['css'])
    gulp.watch(['app/build/styl/*.styl',
        'app/build/styl/components/*.styl'
    ], ['styl'])
    gulp.watch('app/build/js/*.js', ['scripts'])
        .pipe(plumber())
        .on('error', gutil.log)
});

// html

// Pug
gulp.task('pug', function buildHTML() {
    return gulp.src('app/build/index.pug')
        .pipe(plumber())
        .pipe(pug())
        .pipe(gulp.dest('app'))
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.reload({ stream: true }))
        .on('error', gutil.log)
});


// Сборка в 1 файл
// gulp.task('html', function() {
//     return gulp.src('app/build/index.html')
//         .pipe(rigger())
//         .pipe(gulp.dest('app'))
//         .pipe(browserSync.reload({ stream: true }))
// });

// Минификация готового файла
// gulp.task('minify', function() {
//     return gulp.src('app/index.html')
//         .pipe(htmlmin({ collapseWhitespace: true }))
//         .pipe(gulp.dest('dist'))
//         .pipe(browserSync.reload({ stream: true }))
// });

// Css

// Stylus
gulp.task('styl', function() {
    return gulp.src('app/build/styl/*.styl')
        .pipe(plumber())
        .pipe(styl({
            compress: true
        }))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({ stream: true }))
        .on('error', gutil.log)
})

//  Соединение в 1 файл
// gulp.task('cssconcat', function() {
//     return gulp.src('app/build/css/*.css')
//         .pipe(concat('main.css'))
//         .pipe(uncss({
//             html: ['index.html', 'app/index.html']
//         }))
//         .pipe(nano())
//         .pipe(gulp.dest('app/css'));
// });

//  Добавление префиксов
gulp.task('css', function() {
    var processors = [
        autoprefixer({
            browsers: ['last 9 versions']
        }),
        cssnext,
        precss
    ];
    return gulp.src('app/css/*.css')
        .pipe(plumber())
        .pipe(postcss(processors))
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.reload({ stream: true }))
        .on('error', gutil.log)
});

// Js
gulp.task('scripts', function() {
    return gulp.src('app/build/js/*.js')
        .pipe(plumber())
        .pipe(uglify())
        .pipe(gulp.dest('app/js'))
        .pipe(browserSync.reload({ stream: true }))
        .on('error', gutil.log)
})

// Js-перенос
gulp.task('js-replace', function() {
    return gulp.src('app/js/*.js')
        .pipe(uglify())
        .pipe(plumber())
        .pipe(gulp.dest('dist/js'))
        .on('error', gutil.log)
})

gulp.task('image', function() {
    gulp.src('app/build/img/*')
        .pipe(plumber())
        .pipe(gulp.dest('app/img'))
        .pipe(gulp.dest('dist/img'))
        .pipe(browserSync.reload({ stream: true }))
        .on('error', gutil.log)
});


// таски по умолчанию
gulp.task('default', ['pug', 'styl', 'css', 'scripts', 'js-replace', 'image', 'watch', 'browser-sync']);