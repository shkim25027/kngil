# SVG 온라인 최적화 도구 사용 가이드

## 추천 온라인 도구

### 1. SVGOMG (가장 추천) ⭐
**URL:** https://jakearchibald.github.io/svgomg/

**사용 방법:**
1. 웹사이트 접속
2. "Open SVG" 버튼 클릭 또는 SVG 파일을 드래그 앤 드롭
3. 좌측에서 최적화 옵션 조정:
   - **Prefer viewBox to width/height**: 체크 해제 (viewBox 유지)
   - **Prettify**: 체크 해제 (압축 모드)
   - **Multipass**: 체크 (더 강력한 최적화)
4. 우측에서 최적화 결과 확인
5. "Download" 버튼으로 다운로드

**장점:**
- 실시간 미리보기
- 옵션 조정 가능
- 무료
- 오픈소스 (SVGO 기반)

---

### 2. SVG Minify
**URL:** https://www.svgminify.com/

**사용 방법:**
1. 웹사이트 접속
2. 파일 업로드 또는 붙여넣기
3. 자동 최적화 실행
4. 다운로드

**장점:**
- 간단한 인터페이스
- 빠른 처리

---

### 3. Squoosh (이미지 최적화)
**URL:** https://squoosh.app/

**참고:** 이 도구는 주로 래스터 이미지용이지만, SVG 내부의 base64 이미지를 최적화하는 데 도움이 될 수 있습니다.

---

## ⚠️ 중요 사항

### Base64 이미지 문제
현재 SVG 파일에는 **5개의 base64 인코딩된 PNG 이미지**가 포함되어 있습니다. 이것이 파일 크기를 크게 만드는 주요 원인입니다.

**온라인 도구로는 base64 이미지를 외부 파일로 분리할 수 없습니다.**

### 권장 해결 방법

**옵션 A: 스크립트 사용 (가장 효과적)**
```bash
npm run optimize-svg
```
이 명령어는 base64 이미지를 별도 PNG 파일로 추출하고 SVG를 최적화합니다.

**옵션 B: 수동 작업**
1. 온라인 도구로 기본 최적화 수행
2. SVG 파일을 텍스트 에디터로 열기
3. `<image>` 태그의 `xlink:href="data:image/png;base64,..."` 부분을 찾기
4. base64 데이터를 디코딩하여 PNG 파일로 저장
5. SVG에서 외부 파일 경로로 변경

---

## 예상 결과

- **현재 크기:** 약 6.5MB
- **온라인 도구 최적화 후:** 약 5-6MB (base64 이미지가 그대로 남아있음)
- **Base64 분리 후:** 약 500KB 이하 (대폭 감소)

---

## 추가 팁

1. **Gulp 빌드 사용:** 프로젝트에 이미 SVGO가 설정되어 있으므로 `npm run build` 실행 시 자동 최적화됩니다.

2. **이미지 압축:** 추출된 PNG 이미지는 추가로 압축할 수 있습니다:
   - TinyPNG: https://tinypng.com/
   - ImageOptim: https://imageoptim.com/

3. **SVG 구조 최적화:**
   - 불필요한 그룹 제거
   - 중복 스타일 통합
   - 경로 데이터 최적화
