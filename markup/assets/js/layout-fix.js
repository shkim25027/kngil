/**
 * Layout Fix Left Controller
 * 스크롤 기반 타이틀 전환 및 섹션 네비게이션 공통 모듈
 * analysis, primary 페이지에서 공통 사용
 */
(function() {
  'use strict';

  // ============================================
  // Configuration
  // ============================================
  const DEFAULT_CONFIG = {
    SELECTORS: {
      titles: '.js-fixLeft-tit > li',
      sections: '.js-fixLeft-secs > article, .js-fixLeft-secs > div'
    },
    SCROLL: {
      triggerLine: 'center center',
      offsetY: 100,
      bottomThreshold: 30
    },
    ANIMATION: {
      duration: 0.6
    }
  };

  // ============================================
  // Utility Functions
  // ============================================
  const Utils = {
    $(selector) {
      return document.querySelector(selector);
    },

    $$(selector) {
      return document.querySelectorAll(selector);
    }
  };

  // ============================================
  // Layout Fix Controller Class
  // ============================================
  class LayoutFixController {
    constructor(config = {}) {
      this.config = { ...DEFAULT_CONFIG, ...config };
      this.keySections = [];
      this.keyData = [];
      this.lastIndex = 0;
    }

    /**
     * 초기화
     * @param {string|Array} keySelector - key 섹션 선택자 (문자열 또는 배열)
     */
    init(keySelector) {
      // GSAP 및 ScrollTrigger 확인
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('[LayoutFixController] GSAP or ScrollTrigger not loaded');
        return;
      }

      gsap.registerPlugin(ScrollTrigger);
      if (typeof ScrollToPlugin !== 'undefined') {
        gsap.registerPlugin(ScrollToPlugin);
      }

      // key 섹션 찾기
      if (Array.isArray(keySelector)) {
        this.keySections = keySelector.map(sel => Utils.$(sel)).filter(Boolean);
      } else {
        const section = Utils.$(keySelector);
        if (section) {
          this.keySections = [section];
        }
      }

      if (this.keySections.length === 0) return;

      this.setupKeyData();
      this.initScrollTriggers();
      this.initClickHandlers();
      this.setInitialState();
    }

    /**
     * key 섹션 데이터 설정
     */
    setupKeyData() {
      this.keyData = this.keySections.map((keyEl) => {
        const titles = keyEl.querySelectorAll(this.config.SELECTORS.titles);
        const sections = keyEl.querySelectorAll(this.config.SELECTORS.sections);
        return { keyEl, titles, sections };
      });

      // 유효성 검사
      const isValid = this.keyData.every(
        (data) => data.titles.length > 0 && data.sections.length > 0
      );
      if (!isValid) {
        console.warn('[LayoutFixController] Invalid key data structure');
        return;
      }

      // 마지막 인덱스 계산
      if (this.keyData.length > 0) {
        const lastKeyData = this.keyData[this.keyData.length - 1];
        this.lastIndex = lastKeyData.sections.length - 1;
      }
    }

    /**
     * 스크롤 트리거 초기화
     */
    initScrollTriggers() {
      this.keyData.forEach(({ titles, sections }, keyIndex) => {
        if (!titles || !sections) return;

        // 각 섹션: 화면 중앙에 올 때(center center) 해당 li.on
        sections.forEach((section, sectionIndex) => {
          if (!section) return;

          ScrollTrigger.create({
            trigger: section,
            start: this.config.SCROLL.triggerLine, // 'center center' = 섹션 중앙이 뷰포트 중앙에 올 때
            onEnter: () => this.updateTitle(titles, sectionIndex),
            onEnterBack: () => this.updateTitle(titles, sectionIndex),
            onLeaveBack: () => {
              const prevIndex = sectionIndex > 0 ? sectionIndex - 1 : 0;
              this.updateTitle(titles, prevIndex);
            }
          });
        });

        // 마지막 섹션: 페이지 하단 도달 시 활성화 (마지막 key 섹션만)
        const isLastKey = keyIndex === this.keyData.length - 1;
        if (isLastKey && sections.length > 0) {
          ScrollTrigger.create({
            trigger: sections[sections.length - 1],
            start: 'bottom bottom',
            onEnter: () => this.updateTitle(titles, titles.length - 1)
          });
        }
      });

      // 스크롤 리프레시 시 초기 상태 설정
      ScrollTrigger.addEventListener('refresh', () => {
        setTimeout(() => this.setInitialState(), 100);
      });
      ScrollTrigger.refresh();

      // 스크롤 시: right(.js-fixLeft-secs) 내 섹션이 화면 중앙에 가장 가까울 때 해당 li.on
      const updateActiveByCenter = () => {
        const viewportCenter = window.innerHeight / 2;
        const atBottom = this.isAtBottom();
        this.keyData.forEach(({ titles, sections }, keyIndex) => {
          if (!titles || !sections.length) return;
          let activeIndex = 0;
          const isLastKey = keyIndex === this.keyData.length - 1;
          if (atBottom && isLastKey) {
            activeIndex = titles.length - 1;
          } else {
            let closestDistance = Infinity;
            sections.forEach((section, index) => {
              if (!section) return;
              const rect = section.getBoundingClientRect();
              const sectionCenter = rect.top + rect.height / 2;
              const distance = Math.abs(sectionCenter - viewportCenter);
              if (distance < closestDistance) {
                closestDistance = distance;
                activeIndex = index;
              }
            });
          }
          this.updateTitle(titles, activeIndex);
        });
      };

      window.addEventListener('scroll', () => {
        updateActiveByCenter();
      }, { passive: true });
    }

    /**
     * 클릭 핸들러 초기화
     */
    initClickHandlers() {
      this.keyData.forEach(({ titles, sections }) => {
        if (!titles || !sections) return;

        titles.forEach((title, index) => {
          title.addEventListener('click', () => {
            this.scrollToSection(sections, titles, index);
          });

          // 키보드 접근성
          title.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              this.scrollToSection(sections, titles, index);
            }
          });
        });
      });
    }

    /**
     * 타이틀 업데이트
     */
    updateTitle(titles, activeIndex) {
      if (!titles || !titles.length) return;
      titles.forEach((title, index) => {
        const isActive = index === activeIndex;
        title.classList.toggle('on', isActive);
        title.setAttribute('aria-selected', isActive ? 'true' : 'false');
        title.setAttribute('tabindex', isActive ? '0' : '-1');
      });
    }

    /**
     * 섹션으로 스크롤
     */
    scrollToSection(sections, titles, index) {
      const section = sections[index];
      if (!section) return;

      // 섹션 클래스명 찾기 (analysis: spatial01, statistics01 등 / primary: sec-area-input 등)
      const sectionClass = Array.from(section.classList).find((c) =>
        /^(spatial|statistics|attribute)\d+$/.test(c) || c.startsWith('sec-')
      );

      if (typeof ScrollToPlugin !== 'undefined' && sectionClass) {
        gsap.to(window, {
          duration: this.config.ANIMATION.duration,
          scrollTo: {
            y: '.' + sectionClass,
            offsetY: this.config.SCROLL.offsetY
          }
        });
      } else {
        section.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }

      this.updateTitle(titles, index);
    }

    /**
     * 초기 상태 설정
     */
    setInitialState() {
      const atBottom = this.isAtBottom();

      this.keyData.forEach(({ titles, sections }, keyIndex) => {
        if (!titles || !sections) return;

        let activeIndex = 0;

        // 마지막 key 섹션이고 페이지 하단이면 마지막 타이틀 활성화
        const isLastKey = keyIndex === this.keyData.length - 1;
        if (atBottom && isLastKey) {
          activeIndex = titles.length - 1;
        } else {
          const viewportCenter = window.innerHeight / 2;
          let closestIndex = 0;
          let closestDistance = Infinity;

          // 각 섹션의 중앙점과 뷰포트 중앙의 거리를 계산
          sections.forEach((section, index) => {
            if (!section) return;
            const rect = section.getBoundingClientRect();
            const sectionCenter = rect.top + (rect.height / 2);
            const distance = Math.abs(sectionCenter - viewportCenter);

            // 섹션이 화면에 보이는 경우에만 고려
            if (rect.top < window.innerHeight && rect.bottom > 0) {
              if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
              }
            }

            // 섹션의 상단이 뷰포트 중앙을 지나갔으면 해당 인덱스로 설정
            if (rect.top <= viewportCenter && rect.bottom > viewportCenter) {
              activeIndex = index;
            }
          });

          // 가장 가까운 섹션이 있으면 그것을 사용
          if (closestDistance < Infinity) {
            activeIndex = closestIndex;
          }
        }

        this.updateTitle(titles, activeIndex);
      });
    }

    /**
     * 페이지 하단 여부 확인
     */
    isAtBottom() {
      return (
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - this.config.SCROLL.bottomThreshold
      );
    }
  }

  // ============================================
  // Export
  // ============================================
  window.LayoutFixController = LayoutFixController;

})();
