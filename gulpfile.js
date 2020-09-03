const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const webp = require("gulp-webp");
const rename = require("gulp-rename");
const svgstore = require("gulp-svgstore");
const csso = require("gulp-csso");
const imagemin = require('gulp-imagemin');
const del = require("del");


// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// WebP

gulp.task('webp', () =>
  gulp.src('source/img/**/*.{png,jpg}')
  .pipe(webp())
  .pipe(gulp.dest('source/img'))
);

//SVG store

const sprite = () => {
  return gulp.src("source/img/**/icon-*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"))
}


exports.sprite = sprite;

// Images

const images = () => {
  return gulp.src("source/img/**/*.{jpg,svg,png}")
    .pipe(imagemin([
      imagemin.optipng({
        optimizationLevel: 3
      }),
      imagemin.mozjpeg({
        progressive: true
      }),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("source/img"))
}

exports.images = images;
// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;




// Copy

const copy = () => {
  return gulp.src([
      "source/fonts/**/*.{woff,woff2}",
      "source/img/**",
      "source/js/**",
      "source/*.ico"
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
};

exports.copy = copy

// JS
const js = () => {
  return gulp.src([
      "source/js/**/*.js"
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
};

exports.js = js

// Html

const html = () => {
  return gulp.src([
      "source/*.html"
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
};

exports.html = html

// Del

const clean = () => {
  return del("build");
}
exports.clean = clean

//Build


exports.build = gulp.series(
  clean,
  copy,
  styles,
  sprite,
  html,
  js
)

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("source/*.html", gulp.series("html")).on("change", sync.reload);
  gulp.watch("source/js/**/*.js", gulp.series("js")).on("change", sync.reload);
}

exports.default = gulp.series(
  clean,
  copy,
  styles,
  sprite,
  html,
  js,
  server,
  watcher
);
