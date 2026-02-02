/**
 * Provided Page Controller
 * 스크롤 기반 애니메이션 및 네비게이션 제어
 */
(function() {
  'use strict';

  // ============================================
  // Configuration
  // ============================================
  const CONFIG = {
    SELECTORS: {
      fixLeftTit: '.js-fixLeft-tit',
      fixLeftTitItems: '.js-fixLeft-tit > li',
      fixLeftBg: '.js-fixLeft-bg',
      fixLeftSecs: '.js-fixLeft-secs',
      route: '.route'
    },
    ANIMATION: {
      bgScale: 1,
      titScale: 0.7,
      titTranslate: '-47%',
      duration: 0.5
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
  // Smooth Scroll Function
  // ============================================
  window.goto = function(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ============================================
  // FixLeft Controller (Scroll-based Animation)
  // ============================================
  const FixLeftController = {
    titElements: null,
    bgElements: null,
    sections: null,

    init() {
      const titRoot = Utils.$(CONFIG.SELECTORS.fixLeftTit);
      if (!titRoot) {
        RouteController.init();
        return;
      }

      // GSAP 및 ScrollTrigger 확인
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('[FixLeftController] GSAP or ScrollTrigger not loaded');
        RouteController.init();
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      this.titElements = Utils.$$(CONFIG.SELECTORS.fixLeftTitItems);
      this.bgElements = Utils.$$(CONFIG.SELECTORS.fixLeftBg);
      this.sections = Utils.$$(`${CONFIG.SELECTORS.fixLeftSecs} > div, ${CONFIG.SELECTORS.fixLeftSecs} > section`);

      this.setupScrollTriggers();
      this.setupClickHandlers();
    },

    setupScrollTriggers() {
      this.sections.forEach((section, index) => {
        if (!section) return;

        ScrollTrigger.create({
          trigger: section,
          start: 'top center',
          onEnter: () => this.updateElements(index),
          onLeaveBack: () => this.updateElements(index)
        });
      });
    },

    updateElements(activeIndex) {
      // 배경 애니메이션
      this.bgElements.forEach((bg, index) => {
        const isActive = index === activeIndex;
        bg.classList.toggle('on', isActive);
        this.setBgActive(bg, isActive);
      });

      // 타이틀 애니메이션 및 접근성
      this.titElements.forEach((tit, index) => {
        const isActive = index === activeIndex;
        tit.classList.toggle('on', isActive);
        tit.setAttribute('aria-selected', isActive ? 'true' : 'false');
        tit.setAttribute('tabindex', isActive ? '0' : '-1');
        this.setTitActive(tit, isActive);
      });
    },

    setupClickHandlers() {
      if (!this.titElements.length || !this.sections.length) return;

      this.titElements.forEach((title, index) => {
        title.addEventListener('click', () => {
          this.scrollToSection(index);
        });
        title.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.scrollToSection(index);
          }
        });
      });
    },

    scrollToSection(index) {
      const section = this.sections[index];
      if (!section) return;
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      this.updateElements(index);
    },

    setBgActive(element, active) {
      gsap.to(element, {
        transform: active ? `scale(${CONFIG.ANIMATION.bgScale})` : 'scale(1)',
        duration: CONFIG.ANIMATION.duration
      });
    },

    setTitActive(element, active) {
      gsap.to(element, {
        opacity: active ? 1 : 0.5,
        transform: active 
          ? 'scale(1) translate(0%, 0%)' 
          : `scale(${CONFIG.ANIMATION.titScale}) translate(${CONFIG.ANIMATION.titTranslate}, 0%)`,
        duration: CONFIG.ANIMATION.duration
      });
    }
  };

  // ============================================
  // Route Controller (Intersection Observer)
  // ============================================
  const RouteController = {
    routeElement: null,
    sections: null,
    tabs: null,
    subs: null,
    imgs: null,
    observer: null,

    init() {
      this.routeElement = Utils.$(CONFIG.SELECTORS.route);
      if (!this.routeElement) return;

      this.sections = this.routeElement.querySelectorAll('#sec1, #sec2, #sec3');
      this.tabs = this.routeElement.querySelectorAll('.tabs .tabs-li');
      this.subs = this.routeElement.querySelectorAll('.subs li');
      this.imgs = this.routeElement.querySelectorAll('.imgs li');

      if (this.sections.length === 0) return;

      this.setupObserver();
    },

    setupObserver() {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          root: null,
          rootMargin: '0px',
          threshold: 0.5
        }
      );

      this.sections.forEach(section => {
        this.observer.observe(section);
      });
    },

    handleIntersection(entries) {
      entries
        .filter(entry => entry.isIntersecting)
        .forEach(entry => {
          const id = entry.target.id;
          const index = id ? parseInt(id.replace('sec', ''), 10) - 1 : -1;
          
          if (index < 0) return;

          // 모든 그룹에 동일한 인덱스 적용
          [this.tabs, this.subs, this.imgs].forEach(group => {
            group.forEach((el, i) => {
              el.classList.toggle('on', i === index);
            });
          });
        });
    }
  };

  // ============================================
  // Initialization
  // ============================================
  const init = () => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        FixLeftController.init();
      });
    } else {
      FixLeftController.init();
    }
  };

  init();

})();

/**
 * Data Provision - Responsive Offset Path
 * .data-bullet 요소의 offset-path를 화면 크기에 맞춰 동적으로 업데이트
 */

(function() {
  'use strict';

  // 반응형 offset-path 업데이트 함수
  function updateOffsetPath() {
    const container = document.querySelector('.provided .data-provision');
    const bullets = document.querySelectorAll('.data-bullet');
    
    if (!container || bullets.length === 0) return;

    // 컨테이너의 실제 너비와 높이 가져오기
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    
    // 원본 비율 (720 x 270)
    const originalWidth = 720;
    const originalHeight = 270;
    const originalRadius = 135;
    
    // 실제 크기에 맞춰 계산
    const radius = (containerWidth / originalWidth) * originalRadius;
    const width = containerWidth;
    const height = containerHeight;
    
    // SVG path 생성 (둥근 사각형 형태)
    const pathData = `M ${radius},0 L ${width - radius},0 A ${radius} ${radius} 0 0 1 ${width} ${radius} A ${radius} ${radius} 0 0 1 ${width - radius} ${height} L ${radius},${height} A ${radius} ${radius} 0 0 1 0 ${radius} A ${radius} ${radius} 0 0 1 ${radius} 0 Z`;
    
    // 모든 bullet 요소에 적용
    bullets.forEach(bullet => {
      bullet.style.offsetPath = `path("${pathData}")`;
    });
  }

  // ResizeObserver를 사용한 반응형 처리
  function initResponsiveOffsetPath() {
    const container = document.querySelector('.provided .data-provision');
    
    if (!container) {
      console.warn('Data provision container not found');
      return;
    }

    // ResizeObserver 생성 (성능 최적화)
    const resizeObserver = new ResizeObserver(entries => {
      // requestAnimationFrame으로 성능 최적화
      requestAnimationFrame(() => {
        updateOffsetPath();
      });
    });

    // 컨테이너 관찰 시작
    resizeObserver.observe(container);

    // 초기 실행
    updateOffsetPath();
  }

  // DOM 로드 완료 후 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initResponsiveOffsetPath);
  } else {
    initResponsiveOffsetPath();
  }

  // 폰트 로드 완료 후 재계산 (레이아웃 변경 가능성)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      setTimeout(updateOffsetPath, 100);
    });
  }

})();