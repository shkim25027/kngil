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
import newer from "gulp-newer";
import { deleteAsync } from "del";

const babel = await import("gulp-babel").then((mod) => mod.default || mod);
const CacheBuster = await import("gulp-cachebust").then(
  (mod) => mod.default || mod
);
const cachebust = new CacheBuster();

const browserSync = browserSyncLib.create();
const sassCompiler = gulpSass(sass);

// 환경 변수 체크
const isProd = process.env.NODE_ENV === 'production';

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
    ignore: ["!./markup/assets/js/lib", 
      "!./markup/assets/js/common.js", 
      "!./markup/assets/js/faq.js", 
      "!./markup/assets/js/popup.js"],
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
    // markup 루트의 HTML도 빌드 (예: coding_list.html)
    extra: "./markup/coding_list.html",
    ignore: [
      "!./markup/html/_include/", // include 폴더 제외
      "!./markup/html/_sub/", // sub 폴더 제외
    ],
    dest: "./dist",
  },
  codinglist: {
    src: "./markup/_coding_list/**/*",
    dest: "./dist/_coding_list",
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

// Images - 개발용 (최적화 스킵)
function imagesDev() {
  return src(paths.img.src, {
    encoding: false,
    buffer: true,
  })
    .pipe(newer(paths.img.dest))
    .pipe(dest(paths.img.dest));
}

// Images - 프로덕션용 (최적화 적용)
function imagesProd() {
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
}

// SCSS → CSS (조건부 PostCSS 적용)
function scss() {
  let stream = src([paths.scss.src, paths.scss.ignore], { 
    since: gulp.lastRun(scss) // 증분 빌드
  })
    .pipe(sassCompiler({ quietDeps: true }).on("error", sassCompiler.logError));
  
  // 개발 모드에서는 PostCSS 생략 (속도 향상)
  if (isProd) {
    stream = stream.pipe(postcss([autoprefixer(), cssnano()]));
  }
  
  return stream
    .pipe(dest(paths.scss.dest))
    .pipe(browserSync.stream({ match: '**/*.css' })); // CSS만 주입
}

// CSS Library copy
function csscopy() {
  return src(paths.csscopy.src).pipe(dest(paths.csscopy.dest));
}

// 개별 파일 빌드 (증분 빌드, 프로덕션에서만 terser)
function scripts() {
  let stream = src([paths.js.src, ...paths.js.ignore], {
    base: "./markup/assets/js",
    since: gulp.lastRun(scripts),
  })
    .pipe(babel({ presets: ["@babel/preset-env"] }));

  if (isProd) {
    stream = stream.pipe(terser());
  }

  return stream.pipe(dest(paths.js.dest)).pipe(browserSync.stream());
}

// 특정 파일들만 합치기 (main.js + util.js → bundle.js)
const scriptsBundleSrc = ["./markup/assets/js/common.js", "./markup/assets/js/faq.js", "./markup/assets/js/popup.js"];
function scriptsBundle() {
  let stream = src(scriptsBundleSrc)
    .pipe(concat("common.js"))
    .pipe(babel({ presets: ["@babel/preset-env"] }));

  if (isProd) {
    stream = stream.pipe(terser());
  }

  return stream.pipe(dest(paths.js.dest)).pipe(browserSync.stream());
}
// JS Library copy
function jscopy() {
  return src(paths.jscopy.src).pipe(dest(paths.jscopy.dest));
}

// HTML SSI (markup/html/** + markup/coding_list.html)
function html() {
  return src([paths.html.src, paths.html.extra, ...paths.html.ignore])
    .pipe(
      includer({
        prefix: "@@",
        basepath: "./markup/html",
      })
    )
    .pipe(prettier())
    .pipe(dest(paths.html.dest))
    .pipe(browserSync.stream());
}

// coding_list 전용 리소스 복사 (_coding_list 폴더)
function codinglistcopy() {
  return src(paths.codinglist.src).pipe(dest(paths.codinglist.dest));
}

// Cache bust
function cache() {
  return src(`${paths.html.dest}/**/*.html`)
    .pipe(cachebust.references())
    .pipe(dest(paths.html.dest));
}

// BrowserSync (최적화)
function serve() {
  browserSync.init({ 
    server: { baseDir: paths.build }, 
    port: 3000,
    notify: false, // 알림 끄기
    ui: false, // UI 끄기
    ghostMode: false // 동기화 끄기
  });
  
  watch(paths.scss.src, scss);
  watch(paths.csscopy.src, csscopy);
  watch(paths.js.src, scripts);
  watch(scriptsBundleSrc, scriptsBundle);
  watch(paths.jscopy.src, jscopy);
  watch(paths.img.src, { delay: 1000 }, imagesDev); // 지연 추가
  watch(paths.video.src, video);
  watch(paths.fonts.src, fonts);
  watch([paths.html.src, paths.html.extra], html);
  watch(paths.codinglist.src, codinglistcopy);
}

// ------------------------------------
// Series / Parallel Tasks
// ------------------------------------

// 프로덕션 빌드 - 완전한 최적화
const build = series(
  clean,
  parallel(fonts, imagesProd, video, scss, csscopy, scripts, scriptsBundle, jscopy, html, codinglistcopy),
  cache
);

// 개발 빌드 - 빠른 빌드
const dev = series(
  clean,
  parallel(fonts, imagesDev, video, scss, csscopy, scripts, scriptsBundle, jscopy, html, codinglistcopy),
  parallel(serve)
);

export { build, dev, clean };
export default dev;
