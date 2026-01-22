/**
 * Analysis Page Controller
 * 스크롤 기반 타이틀 전환 및 섹션 네비게이션 (3개 key 섹션)
 */
(function() {
  'use strict';

  // ============================================
  // Configuration
  // ============================================
  const CONFIG = {
    SELECTORS: {
      key1: '.key.spatial',
      key2: '.key.statistics',
      key3: '.key.attribute',
      titles: '.js-fixLeft-tit > li',
      sections: '.js-fixLeft-secs > article, .js-fixLeft-secs > div'
    },
    SCROLL: {
      triggerLine: 'center center', // 섹션의 중앙이 뷰포트 중앙에 도달했을 때
      offsetY: 100,
      bottomThreshold: 30
    },
    ANIMATION: {
      duration: 0.6
    },
    SVG_LOAD: {
      threshold: 0.3,
      rootMargin: '0px'
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
  // Key Section Controller
  // ============================================
  const KeySectionController = {
    keys: [],
    keyData: [],

    init() {
      const key1 = Utils.$(CONFIG.SELECTORS.key1);
      const key2 = Utils.$(CONFIG.SELECTORS.key2);
      const key3 = Utils.$(CONFIG.SELECTORS.key3);

      if (!key1 || !key2 || !key3) return;

      this.keys = [key1, key2, key3];
      this.setupKeyData();
      this.initScrollTriggers();
      this.initClickHandlers();
      this.initSVGLoader();
    },

    setupKeyData() {
      this.keyData = this.keys.map((keyEl) => {
        const titles = keyEl.querySelectorAll(CONFIG.SELECTORS.titles);
        const sections = keyEl.querySelectorAll(CONFIG.SELECTORS.sections);
        return { keyEl, titles, sections };
      });

      // 유효성 검사
      const isValid = this.keyData.every(
        (data) => data.titles.length > 0 && data.sections.length > 0
      );
      if (!isValid) return;

      // GSAP 및 ScrollTrigger 확인
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('[KeySectionController] GSAP or ScrollTrigger not loaded');
        return;
      }

      gsap.registerPlugin(ScrollTrigger);
      if (typeof ScrollToPlugin !== 'undefined') {
        gsap.registerPlugin(ScrollToPlugin);
      }
    },

    initScrollTriggers() {
      this.keyData.forEach(({ titles, sections }, keyIndex) => {
        if (!titles || !sections) return;

        // 각 섹션에 대한 스크롤 트리거 설정
        sections.forEach((section, sectionIndex) => {
          if (!section) return;

          ScrollTrigger.create({
            trigger: section,
            start: CONFIG.SCROLL.triggerLine,
            onEnter: () => this.updateTitle(titles, sectionIndex),
            onEnterBack: () => this.updateTitle(titles, sectionIndex),
            onLeaveBack: () => {
              const prevIndex = sectionIndex > 0 ? sectionIndex - 1 : 0;
              this.updateTitle(titles, prevIndex);
            }
          });
        });

        // 마지막 섹션: 페이지 하단 도달 시 활성화 (key3만)
        if (keyIndex === 2 && sections.length > 0) {
          ScrollTrigger.create({
            trigger: sections[sections.length - 1],
            start: 'bottom bottom',
            onEnter: () => this.updateTitle(titles, titles.length - 1)
          });
        }
      });

      // 초기 상태 설정
      ScrollTrigger.addEventListener('refresh', () => {
        setTimeout(() => this.setInitialState(), 100);
      });
      ScrollTrigger.refresh();
      this.setInitialState();

      // 스크롤 이벤트로 하단 감지
      window.addEventListener('scroll', () => {
        if (this.isAtBottom() && this.keyData[2]) {
          this.updateTitle(this.keyData[2].titles, this.keyData[2].titles.length - 1);
        }
      }, { passive: true });
    },

    initClickHandlers() {
      this.keyData.forEach(({ keyEl, titles, sections }) => {
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
    },

    updateTitle(titles, activeIndex) {
      if (!titles || !titles.length) return;
      titles.forEach((title, index) => {
        const isActive = index === activeIndex;
        title.classList.toggle('on', isActive);
        title.setAttribute('aria-selected', isActive ? 'true' : 'false');
        title.setAttribute('tabindex', isActive ? '0' : '-1');
      });
    },

    scrollToSection(sections, titles, index) {
      const section = sections[index];
      if (!section) return;

      // 클래스명에서 섹션 식별자 찾기
      const sectionClass = Array.from(section.classList).find((c) =>
        /^(spatial|statistics|attribute)\d+$/.test(c)
      );

      if (typeof ScrollToPlugin !== 'undefined' && sectionClass) {
        gsap.to(window, {
          duration: CONFIG.ANIMATION.duration,
          scrollTo: {
            y: '.' + sectionClass,
            offsetY: CONFIG.SCROLL.offsetY
          }
        });
      } else {
        section.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }

      this.updateTitle(titles, index);
    },

    setInitialState() {
      const atBottom = this.isAtBottom();

      this.keyData.forEach(({ titles, sections }, keyIndex) => {
        if (!titles || !sections) return;

        let activeIndex = 0;

        if (atBottom && keyIndex === 2) {
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
    },

    isAtBottom() {
      return (
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - CONFIG.SCROLL.bottomThreshold
      );
    },

    // ============================================
    // SVG Lazy Loader
    // ============================================
    initSVGLoader() {
      const subFigsElements = Utils.$$('.sub-figs');
      if (subFigsElements.length === 0) return;

      const loadedElements = new Set();

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !loadedElements.has(entry.target)) {
              const svgImg = entry.target.querySelector('.apx img[data-src]');
              if (svgImg && svgImg.dataset.src) {
                // data-src를 src로 변경하여 SVG 로드 (한 번만)
                svgImg.src = svgImg.dataset.src;
                svgImg.removeAttribute('data-src');
                loadedElements.add(entry.target);
                observer.unobserve(entry.target);
              }
            }
          });
        },
        {
          threshold: CONFIG.SVG_LOAD.threshold,
          rootMargin: CONFIG.SVG_LOAD.rootMargin
        }
      );

      subFigsElements.forEach((el) => observer.observe(el));
    }
  };

  // ============================================
  // Initialization
  // ============================================
  const init = () => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        KeySectionController.init();
      });
    } else {
      KeySectionController.init();
    }
  };

  init();
})();
