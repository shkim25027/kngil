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
      fixLeftBg: '.js-fixLeft-bg',
      fixLeftSecs: '.js-fixLeft-secs',
      route: '.route'
    },
    ANIMATION: {
      bgScale: 1.05,
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

      this.titElements = Utils.$$(CONFIG.SELECTORS.fixLeftTit);
      this.bgElements = Utils.$$(CONFIG.SELECTORS.fixLeftBg);
      this.sections = Utils.$$(`${CONFIG.SELECTORS.fixLeftSecs} > div, ${CONFIG.SELECTORS.fixLeftSecs} > section`);

      this.setupScrollTriggers();
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

      // 타이틀 애니메이션
      this.titElements.forEach((tit, index) => {
        const isActive = index === activeIndex;
        tit.classList.toggle('on', isActive);
        this.setTitActive(tit, isActive);
      });
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
