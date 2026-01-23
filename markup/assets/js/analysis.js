/**
 * Analysis Page Controller
 * 스크롤 기반 타이틀 전환 및 섹션 네비게이션 (3개 key 섹션)
 * LayoutFixController 공통 모듈 사용
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
      key3: '.key.attribute'
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
  // Layout Fix Controller Instance
  // ============================================
  let layoutFixController = null;

  // ============================================
  // SVG Lazy Loader
  // ============================================
  const initSVGLoader = () => {
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
  };

  // ============================================
  // Initialization
  // ============================================
  const init = () => {
    // LayoutFixController가 로드되었는지 확인
    if (typeof LayoutFixController === 'undefined') {
      console.warn('[Analysis] LayoutFixController not loaded');
      return;
    }

    const key1 = Utils.$(CONFIG.SELECTORS.key1);
    const key2 = Utils.$(CONFIG.SELECTORS.key2);
    const key3 = Utils.$(CONFIG.SELECTORS.key3);

    if (!key1 || !key2 || !key3) return;

    // 공통 모듈 초기화 (3개 key 섹션)
    layoutFixController = new LayoutFixController();
    layoutFixController.init([
      CONFIG.SELECTORS.key1,
      CONFIG.SELECTORS.key2,
      CONFIG.SELECTORS.key3
    ]);

    // SVG 로더 초기화 (analysis 전용)
    initSVGLoader();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
