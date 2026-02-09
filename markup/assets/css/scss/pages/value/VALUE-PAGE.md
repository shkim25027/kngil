# value 페이지 (value.html) SCSS 가이드

value.html에 적용되는 스타일을 **어디서 고치면 되는지** 빠르게 찾을 수 있도록 정리했습니다.

---

## value.html 구조와 수정할 파일

| 화면에서 보이는 영역 | HTML 클래스 예시 | 수정할 SCSS 파일 |
|---------------------|------------------|------------------|
| **상단 비주얼** (배경 이미지, "KNGIL 소개" 제목) | `.visual`, `.sub-header` | `_base.scss` |
| **소개 문구** (설계 실무자 위한…, 슬로건 이미지) | `.sub-content`, `.sub-tit-box`, `.slogan-box` | `_base.scss` |
| **5단계 프로세스** (큰길서비스 + 2~5단계 카드) | `.service` > `.step-list`, `.step-flow-box`, `.step-flow-item`, `ol.step-flow` | `_service.scss` |
| **데이터 비교** (아날로그/전산화, 수동/자동 박스) | `.data-comparison`, `.comparison-item`, `.data-type-box`, `.work-method-box` | `_data-comparison.scss` |
| **"KNGIL 특징" 요약** (큰 제목 + 설명 + 세로 라인) | `.summary`, `.big-tit`, `.line`, `.dot` | `_base.scss` |
| **주요 기능 카드 4개** (GIS, 데이터, 지도, 커스터마이징) | `.value-features`, `.feature-card`, `.feature-gis` 등 | `_value-features.scss` |
| **색·간격·폰트 크기** (페이지 전반) | — | `_variables.scss` |
| **애니메이션** (데이터 비교 화살표, 기능 카드 라인) | — | `_keyframes.scss` |

---

## 파일별 역할 (한 줄 요약)

| 파일 | 역할 |
|------|------|
| `_variables.scss` | value 페이지 색상·간격·폰트 크기 변수. 여기만 바꿔도 여러 곳에 반영됨. |
| `_mixins.scss` | value 전용 스타일 묶음(그라디언트 박스, 화살표, 텍스트 그림자 등). 보통 수정할 일 적음. |
| `_base.scss` | 상단 비주얼, 소개 문구, 슬로건, 특징 배경, "KNGIL 특징" 요약(.summary). |
| `_service.scss` | 5단계 프로세스 블록(.step-list, .step-flow-box, .step-item). |
| `_data-comparison.scss` | 데이터 비교(.data-comparison, 아날로그/전산화, 수동/자동 박스). |
| `_value-features.scss` | 기능 카드 4개(.feature-gis, .feature-data, .feature-map, .feature-custom) + 장식 라인. |
| `_keyframes.scss` | value 페이지 전용 애니메이션(화살표 이동, 점 이동 등). |
| `_responsive.scss` | 반응형 추가 스타일(대부분은 각 파일 안에 이미 포함됨). |

---

## 자주 하는 수정

- **전체 글자/배경 색 바꾸기**  
  → `_variables.scss` 의 `$value-colors` 수정.

- **간격·모서리 둥글기**  
  → `_variables.scss` 의 `$value-sizes` 수정.

- **상단 비주얼 배경 이미지**  
  → `_base.scss` 안 `.visual` 의 `value-bg-cover("../img/value/…")` 경로 수정.

- **5단계 카드 색·그림자**  
  → `_service.scss` 안 `.step-flow-item.active`, `.step-box` 등 수정.

- **데이터 비교 박스 색**  
  → `_data-comparison.scss` 안 `.data-type-box`, `.work-method-box` 또는 `_variables.scss` 색상.

- **기능 카드 배경/아이콘 이미지**  
  → `_value-features.scss` 안 `.feature-gis`, `.feature-data`, `.feature-map`, `.feature-custom` 의 `url(../img/…)` 수정.

---

## 로드 순서 (참고)

`pages/value/_index.scss` 에서 아래 순서로 불러옵니다.

1. `variables` → 2. `mixins` → 3. `keyframes` → 4. `base` → 5. `sections`(service, data-comparison, value-features) → 6. `responsive`

스타일을 추가할 때는 **해당 영역을 담당하는 파일**에 넣으면 됩니다.
