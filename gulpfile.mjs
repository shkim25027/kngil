// gulpfile.mjs
import gulp, { src, dest, watch, series, parallel } from "gulp";
import gulpSass from "gulp-sass"; //SCSS → CSS 컴파일
import * as sass from "sass";
import postcss from "gulp-postcss"; //CSS 후처리, 플러그인 적용
import autoprefixer from "autoprefixer"; //브라우저 벤더 프리픽스 자동 추가
import cssnano from "cssnano"; //CSS 최소화 (minify) SCSS → CSS 후 종합 최적화(PostCSS 필요)
import browserSyncLib from "browser-sync"; // 개발 서버를 띄우고 파일 변경 시 브라우저 자동 새로고침
import rename from "gulp-rename"; //파일 이름 변경 (예: style.css → style.min.css)
import terser from "gulp-terser"; //JS 압축/최적화
import imagemin from "gulp-imagemin"; //PNG, JPEG, GIF, SVG 이미지 용량 최적화
import imageminOptipng from "imagemin-optipng"; //PNG 최적화
import imageminSvgo from "imagemin-svgo"; //SVG 최적화
import includer from "gulp-file-include"; //Gulp 빌드 시 정적 HTML 조립
import prettier from "gulp-prettier"; //JS/CSS/HTML 코드 자동 포맷팅
import newer from "gulp-newer";
import { deleteAsync } from "del";

const babel = await import("gulp-babel").then((mod) => mod.default || mod);
const CacheBuster = await import("gulp-cachebust").then(
  (mod) => mod.default || mod
);
const cachebust = new CacheBuster();

const browserSync = browserSyncLib.create();
const sassCompiler = gulpSass(sass);

// ------------------------------------
// Paths
// ------------------------------------
const paths = {
  build: "./dist/",
  scss: {
    src: "./markup/assets/css/scss/**/*.scss",
    ignore: "!./markup/assets/css/scss/import",
    dest: "./dist/css",
  },
  csscopy: {
    src: "./markup/assets/css/lib/**/*",
    dest: "./dist/css/lib",
  },
  js: {
    src: "./markup/assets/js/**/*.js",
    ignore: "!./markup/assets/js/lib",
    dest: "./dist/js",
  },
  jscopy: { src: "./markup/assets/js/lib/**/*", dest: "./dist/js/lib" },
  img: {
    src: "./markup/assets/images/**/*.{png,jpg,jpeg,svg}",
    dest: "./dist/img",
  },
  fonts: { src: "./markup/assets/fonts/**/*", dest: "./dist/fonts" },
  video: { src: "./markup/assets/video/**/*", dest: "./dist/video" },
  html: {
    src: "./markup/html/**/*.html",
    // ignore: "!./markup/html/_include",
    ignore: [
      "!./markup/html/_include/", // include 폴더 제외
      "!./markup/html/_sub/", // sub 폴더 제외
    ],
    dest: "./dist",
  },
};

// ------------------------------------
// Tasks
// ------------------------------------

// Clean dist
async function clean() {
  return deleteAsync([paths.build + "**/*"], { force: true });
}

// Fonts
function fonts() {
  return src(paths.fonts.src).pipe(dest(paths.fonts.dest));
}

// Video - 비디오 파일은 변환 없이 그대로 복사 (바이너리 모드)
function video() {
  return src(paths.video.src, {
    encoding: false, // 바이너리 모드로 처리
    buffer: true
  }).pipe(dest(paths.video.dest));
}

// Images
function images() {
  return src(paths.img.src, {
    encoding: false,
    buffer: true,
  })
    .pipe(newer(paths.img.dest))
    .pipe(
      imagemin(
        [
          //0: 최적화 안 함 (빠름, 용량 큰 편)
          //3: 적당한 최적화 (속도와 용량 균형) ✅ 권장
          //5: 기본값 (더 작은 용량, 좀 더 느림)
          //7: 최대 최적화 (가장 작은 용량, 매우 느림)
          imageminOptipng({ optimizationLevel: 3 }), // 5 대신 3으로 낮춤
          imageminSvgo({
            plugins: [{ name: "removeViewBox", active: false }],
          }),
        ],

        {
          verbose: true, // 로그 출력
        }
      )
    )
    .pipe(dest(paths.img.dest));
  //return src(paths.img.src).pipe(imagemin()).pipe(dest(paths.img.dest));
  // return src(paths.img.src).pipe(dest(paths.img.dest));
}

// SCSS → CSS
function scss() {
  return src([paths.scss.src, paths.scss.ignore])
    .pipe(sassCompiler({ quietDeps: true }).on("error", sassCompiler.logError))
    //.pipe(postcss([autoprefixer(), cssnano()]))
    //.pipe(rename({ suffix: ".min" }))
    .pipe(dest(paths.scss.dest))
    .pipe(browserSync.stream());
}

// CSS Library copy
function csscopy() {
  return src(paths.csscopy.src).pipe(dest(paths.csscopy.dest));
}

// JS (각 파일을 개별로 빌드하여 출력)
function scripts() {
  return src([paths.js.src, paths.js.ignore], { base: "./markup/assets/js" })
    .pipe(babel({ presets: ["@babel/preset-env"] }))
    .pipe(terser())
    .pipe(dest(paths.js.dest))
    .pipe(browserSync.stream());
}

// JS Library copy
function jscopy() {
  return src(paths.jscopy.src).pipe(dest(paths.jscopy.dest));
}

// HTML SSI
function html() {
  return src([paths.html.src, ...paths.html.ignore]) // 배열로 합침
    .pipe(
      includer({
        prefix: "@@", // include 구문: @@include("header.html")
        basepath: "./markup/html", // ✅ 기준 경로를 html 폴더 전체로 설정
      })
    )
    .pipe(prettier())
    .pipe(dest(paths.html.dest))
    .pipe(browserSync.stream());
}

// Cache bust
function cache() {
  return src(`${paths.html.dest}/**/*.html`)
    .pipe(cachebust.references())
    .pipe(dest(paths.html.dest));
}

// BrowserSync
function serve() {
  browserSync.init({ server: { baseDir: paths.build }, port: 3000 });
  watch(paths.scss.src, scss);
  watch(paths.csscopy.src, csscopy);
  watch(paths.js.src, scripts);
  watch(paths.jscopy.src, jscopy);
  watch(paths.img.src, images);
  watch(paths.video.src, video);
  watch(paths.fonts.src, fonts);
  watch(paths.html.src, html);
}

// ------------------------------------
// Series / Parallel Tasks
// ------------------------------------
const build = series(
  clean,
  parallel(fonts, images,video, scss, csscopy, scripts, jscopy, html),
  cache
);

const dev = series(
  clean,
  parallel(fonts, images,video, scss, csscopy, scripts, jscopy, html),
  parallel(serve)
);

export { build, dev, clean };
export default dev;
