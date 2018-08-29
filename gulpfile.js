let gulp = require('gulp');
let cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var pump = require('pump');


gulp.task('minify-css', () => {
    return gulp.src('css/*.css')
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(gulp.dest('dist'));
});


//gulp.task('compress', function () {
//    return gulp.src('js/*.js')
//        .pipe(uglify())
//        .pipe(gulp.dest('dist'));
//});

gulp.task('compress', function (cb) {
    pump([
        gulp.src('lib/*.js'),
        uglify(),
        gulp.dest('dist')
    ],
        cb
    );
});

gulp.task('default', function (callback) {
    runSequence(['minify-css', 'compress'],
        callback
    )
})