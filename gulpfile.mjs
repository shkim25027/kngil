// gulpfile.mjs
import gulp, { src, dest, watch, series, parallel } from "gulp";
import gulpSass from "gulp-sass"; //SCSS → CSS 컴파일
import * as sass from "sass";
import postcss from "gulp-postcss"; //CSS 후처리, 플러그인 적용
import autoprefixer from "autoprefixer"; //브라우저 벤더 프리픽스 자동 추가
import cssnano from "cssnano"; //CSS 최소화 (minify) SCSS → CSS 후 종합 최적화(PostCSS 필요)
import browserSyncLib from "browser-sync"; // 개발 서버를 띄우고 파일 변경 시 브라우저 자동 새로고침
import concat from "gulp-concat"; //여러 파일을 하나로 합침
import rename from "gulp-rename"; //파일 이름 변경 (예: style.css → style.min.css)
import terser from "gulp-terser"; //JS 압축/최적화
import imagemin from "gulp-imagemin"; //PNG, JPEG, GIF, SVG 이미지 용량 최적화
import imageminOptipng from "imagemin-optipng"; //PNG 최적화
import imageminSvgo from "imagemin-svgo"; //SVG 최적화
import includer from "gulp-file-include"; //Gulp 빌드 시 정적 HTML 조립
import prettier from "gulp-prettier"; //JS/CSS/HTML 코드 자동 포맷팅
import { deleteAsync } from "del";
import gulpCache from "gulp-cache"; // 파일 변경 감지 캐싱

const babel = await import("gulp-babel").then((mod) => mod.default || mod);
const CacheBuster = await import("gulp-cachebust").then(
  (mod) => mod.default || mod
);
const cachebust = new CacheBuster();

const browserSync = browserSyncLib.create();
const sassCompiler = gulpSass(sass);

// 개발 모드 플래그 (환경 변수로 제어 가능)
// build 작업에서는 항상 production 모드로 실행
const isDev = process.env.NODE_ENV !== "production" && process.argv.indexOf("build") === -1;

// ------------------------------------
// Paths
// ------------------------------------
const paths = {
  build: "./dist/",
  scss: {
    src: "./markup/assets/css/scss/**/*.scss",
    ignore: "!./markup/assets/css/scss/import",
    dest: "./dist/assets/css",
  },
  csscopy: {
    src: "./markup/assets/css/lib/**/*",
    dest: "./dist/assets/css/lib",
  },
  js: {
    src: "./markup/assets/js/**/*.js",
    ignore: [
      "!./markup/assets/js/lib",
      "!./markup/assets/js/index.js",
      "!./markup/assets/js/pop_temp.js",
      "!./markup/assets/js/provided.js",
    ],
    dest: "./dist/assets/js",
  },
  jscopy: { src: "./markup/assets/js/lib/**/*", dest: "./dist/assets/js/lib" },
  jsindex: { src: "./markup/assets/js/index.js", dest: "./dist/assets/js" },
  jspoptemp: { src: "./markup/assets/js/pop_temp.js", dest: "./dist/assets/js" },
  jsprovided: { src: "./markup/assets/js/provided.js", dest: "./dist/assets/js" },
  img: {
    src: "./markup/assets/images/**/*.{png,jpg,jpeg,svg}",
    dest: "./dist/assets/images",
  },
  fonts: { src: "./markup/assets/fonts/**/*", dest: "./dist/assets/fonts" },
  video: { src: "./markup/assets/video/**/*", dest: "./dist/assets/video" },
  html: {
    src: "./markup/html/**/*.html",
    // ignore: "!./markup/html/_include",
    ignore: [
      "!./markup/html/_include/", // include 폴더 제외
      "!./markup/html/_sub/", // sub 폴더 제외
    ],
    dest: "./dist",
  },
  codingList: {
    html: "./markup/coding_list.html",
    folder: "./markup/_coding_list/**/*",
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

// Images - 개발 모드에서는 최적화 건너뛰기
function images() {
  const stream = src(paths.img.src, {
    encoding: false,
    buffer: true,
  });

  // 개발 모드가 아니거나 프로덕션 빌드일 때만 최적화 실행
  if (!isDev) {
    return stream
      .pipe(
        gulpCache(
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
          ),
          {
            name: "imagemin", // 캐시 이름
          }
        )
      )
      .pipe(dest(paths.img.dest));
  }

  // 개발 모드: 최적화 없이 그대로 복사 (빠름)
  return stream.pipe(dest(paths.img.dest));
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

// JS
function scripts() {
  const stream = src([paths.js.src, ...paths.js.ignore])
    .pipe(concat("common.js"));

  // 개발 모드가 아닐 때만 최적화 실행
  if (!isDev) {
    stream.pipe(babel({ presets: ["@babel/preset-env"] })).pipe(terser());
  }

  return stream
    //.pipe(rename({ suffix: ".min" }))
    .pipe(dest(paths.js.dest))
    .pipe(browserSync.stream());
}

// JS Library copy
function jscopy() {
  return src(paths.jscopy.src).pipe(dest(paths.jscopy.dest));
}

// JS Index copy (index.js는 별도로 복사)
function jsindex() {
  return src(paths.jsindex.src).pipe(dest(paths.jsindex.dest));
}

// JS pop_temp copy (pop_temp.html 전용, common.js에 포함하지 않음)
function jspoptemp() {
  return src(paths.jspoptemp.src).pipe(dest(paths.jspoptemp.dest));
}

// JS provided copy (provided.html 전용, common.js에 포함하지 않음)
function jsprovided() {
  return src(paths.jsprovided.src).pipe(dest(paths.jsprovided.dest));
}

// Coding List - coding_list.html 및 _coding_list 폴더 복사
function codingListHtml() {
  return src(paths.codingList.html).pipe(dest(paths.codingList.dest));
}
function codingListFolder() {
  return src(paths.codingList.folder, { base: "./markup" }).pipe(
    dest(paths.codingList.dest)
  );
}

// HTML SSI
function html() {
  let stream = src([paths.html.src, ...paths.html.ignore]) // 배열로 합침
    .pipe(
      includer({
        prefix: "@@", // include 구문: @@include("header.html")
        basepath: "./markup/html", // ✅ 기준 경로를 html 폴더 전체로 설정
      })
    );

  // 개발 모드가 아닐 때만 prettier 실행 (빌드 시에만 포맷팅)
  if (!isDev) {
    stream = stream.pipe(prettier());
  }

  return stream
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
  watch(paths.jsindex.src, jsindex);
  watch(paths.jspoptemp.src, jspoptemp);
  watch(paths.jsprovided.src, jsprovided);
  // 개발 모드에서는 이미지 최적화 없이 빠르게 복사만
  watch(paths.img.src, images);
  watch(paths.fonts.src, fonts);
  watch(paths.video.src, video);
  watch(paths.html.src, html);
  watch(paths.codingList.html, codingListHtml);
  watch(paths.codingList.folder, codingListFolder);
}

// ------------------------------------
// Series / Parallel Tasks
// ------------------------------------
// 프로덕션 빌드: 최적화 포함
const build = series(
  clean,
  parallel(
    fonts,
    images,
    video,
    scss,
    csscopy,
    scripts,
    jscopy,
    jsindex,
    jspoptemp,
    jsprovided,
    html,
    codingListHtml,
    codingListFolder
  ),
  cache
);

// 개발 모드: clean 없이 빠르게 시작 (이미 빌드된 파일 유지)
const dev = series(
  parallel(
    fonts,
    images,
    video,
    scss,
    csscopy,
    scripts,
    jscopy,
    jsindex,
    jspoptemp,
    jsprovided,
    html,
    codingListHtml,
    codingListFolder
  ),
  parallel(serve)
);

// 초기 빌드가 필요한 경우 사용
const devClean = series(
  clean,
  parallel(
    fonts,
    images,
    video,
    scss,
    csscopy,
    scripts,
    jscopy,
    jsindex,
    jspoptemp,
    jsprovided,
    html,
    codingListHtml,
    codingListFolder
  ),
  parallel(serve)
);

export { build, dev, devClean, clean };
export default dev;
