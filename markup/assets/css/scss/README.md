# SCSS 폴더 가이드 (초보자용)

이 폴더는 사이트의 **스타일(디자인)**을 관리하는 SCSS 파일들이 들어 있습니다.  
처음 보시는 분도 **어디를 고치면 어떤 게 바뀌는지** 쉽게 찾을 수 있도록 정리해 두었습니다.

---

## 🚀 빠르게 찾기: "이걸 바꾸고 싶다" → "이 파일을 열자"

| 바꾸고 싶은 것 | 열어볼 파일 |
|----------------|-------------|
| **전체 글자 색, 배경 색, 버튼 색** | `_root.scss` (CSS 변수) |
| **헤더(로고, 메뉴)** | `layouts/_header.scss` |
| **푸터** | `layouts/_footer.scss` |
| **플로팅 버튼/메뉴** | `layouts/_floating.scss` |
| **버튼 모양** | `components/_buttons.scss` |
| **팝업 모양** | `components/_popup.scss` |
| **메인 페이지** | `pages/_main.scss` |
| **value(소개) 페이지** | `pages/value/` 폴더 |
| **제공 데이터 페이지** | `pages/provided/` 폴더 |
| **주요 기능 페이지** | `pages/primary/` 폴더 |
| **데이터분석 페이지** | `pages/analysis/` 폴더 |
| **결과(For BIM) 페이지** | `pages/results/` 폴더 |
| **FAQ / 구매 페이지** | `pages/_faq.scss`, `pages/_buy.scss` |
| **폰트, 리셋, 공통 유틸** | `import/`, `common/` 폴더 |

---

## 📁 폴더가 하는 일 (한 줄 요약)

```
scss/
├── _root.scss          ← 🎨 색상·그림자·그라데이션 등 "디자인 변수" (여기만 바꿔도 전체에 반영)
├── style.scss          ← 📄 페이지별 스타일만 묶어서 style.css 로 컴파일 (진입점)
├── common.scss         ← 🔧 공통 스타일 묶어서 common.css 로 컴파일 (진입점)
│
├── import/             ← 설정용 (변수, mixin, 리셋, 폰트 등) — 보통 수정 빈도 낮음
├── common/             ← 공통 스타일 (리셋, 타이포, 아이콘, 유틸, 모달, 애니메이션, 반응형)
├── layouts/            ← 헤더, 푸터, 본문, 플로팅 메뉴
├── components/         ← 버튼, 팝업, 다이어그램 등 재사용 UI
└── pages/              ← 페이지별 스타일 (메인, value, provided, primary, analysis, results, faq, buy)
```

- **style.css** = `style.scss`가 컴파일된 결과 (페이지 전용 스타일)
- **common.css** = `common.scss`가 컴파일된 결과 (공통 스타일)  
→ HTML에서는 `common.css` → `style.css` 순서로 로드합니다.

---

## 📂 각 폴더 안에는 뭐가 있나요?

### `import/` — 기본 설정
- `_variables.scss` : 폰트 크기, 줄간격, 폰트 패밀리 등
- `_mixin.scss` : 반복 쓰는 스타일 묶음 (flex, blind, ellipsis, 미디어쿼리 등)
- `_typography.scss` : 타이포그래피
- `_reset-css.scss` : 브라우저 기본 스타일 리셋
- `_px-convert.scss`, `_lib-fonts.scss` : 단위/폰트 보조

### `common/` — 공통 스타일
- `_reset.scss` : 기본 리셋·전역 설정
- `_typography.scss` : 공통 글자 스타일
- `_page-styles.scss` : 페이지 공통 스타일
- `_icons.scss` : 아이콘
- `_utilities.scss` : 유틸리티 클래스
- `_modal.scss` : 모달
- `_animations.scss` : 공통 애니메이션
- `_responsive.scss` : 반응형

### `layouts/` — 레이아웃
- `_header.scss` : 상단 헤더(로고, 메뉴)
- `_footer.scss` : 하단 푸터
- `_body.scss` : 본문 레이아웃
- `_floating.scss` : 플로팅 메뉴/버튼

### `components/` — 재사용 UI
- `_buttons.scss` : 버튼
- `_popup.scss` : 팝업
- `_diagram.scss` : 다이어그램
- `_layout-fix.scss` : 레이아웃 보정
- `_mouse-mark.scss` : 마우스 마크

### `pages/` — 페이지별
- `_main.scss` : 메인
- `value/` : 소개(value) 페이지 (variables, mixins, keyframes, base, sections, responsive)
- `provided/` : 제동데이터 페이지
- `primary/` : 주요 기능 페이지
- `analysis/` : 데이터분석 페이지
- `results/` : For BIM(결과) 페이지
- `_faq.scss` : FAQ
- `_buy.scss` : 구매

각 페이지 폴더 안에는 보통 `_variables.scss`, `_base.scss`, `_keyframes.scss`, `_responsive.scss` 등이 있고,  
`_index.scss`가 그 폴더의 스타일을 한 번에 불러옵니다.

---

## 🔧 자주 쓰는 작업

### 1) 색상만 바꾸고 싶을 때
- **전역 색** : `_root.scss` 안의 `:root { ... }` 값 수정  
  (예: `--text-primary`, `--color-green`, `--bg-base` 등)

### 2) 특정 페이지만 고칠 때
- 해당 페이지 폴더로 이동 (예: value 페이지 → `pages/value/`)
- 그 페이지 전용 변수는 보통 `_variables.scss`, 스타일은 `_base.scss` 또는 `_sections.scss`(및 그 안에서 불러오는 파일들)

### 3) Mixin 쓰는 방법 (다른 scss 파일 안에서)
```scss
@use "../import/_mixin" as *;   // layouts, components 에서
@use "../../import/_mixin" as *; // pages 또는 pages/xxx 에서

.내클래스 {
  @include flex(center, center);
  @include mq(tablet, max) { ... }
}
```

### 4) 변수 쓰는 방법
```scss
@use "../import/_variables" as *;
// 또는 페이지별 변수: @use "variables" as *;
```

---

## 📦 CSS가 로드되는 순서 (참고)

1. **common.css** (common.scss 컴파일)
   - import(폰트, 리셋 등) → layouts → components → common 스타일
2. **style.css** (style.scss 컴파일)
   - `_root.scss`(CSS 변수) → pages(페이지별 스타일)

즉, **공통 레이아웃·컴포넌트**가 먼저 로드되고, 그 다음 **페이지 전용 스타일**이 로드됩니다.

---

## ✅ 유지보수 팁

- **파일 이름 앞에 `_`가 붙은 파일**은 단독으로 컴파일되지 않고, 다른 파일에서 `@forward`/`@use`로 불러 씁니다.
- **색·간격 등은 가능한 한 `_root.scss`나 각 폴더의 `_variables.scss`에 두고**, 숫자를 직접 넣기보다 변수로 쓰면 나중에 수정이 쉽습니다.
- **새 페이지를 추가**할 때는 `pages/_index.scss`에 한 줄 `@forward "새폴더명/index";` 를 추가하고, `pages/새폴더명/` 안에 `_index.scss`와 필요한 scss 파일들을 만듭니다.

궁금한 점이 있으면 위 표에서 "바꾸고 싶은 것"에 맞는 파일을 먼저 열어보면 됩니다.
