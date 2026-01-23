/**
 * Primary Page Controller
 * 스크롤 기반 타이틀 전환 및 섹션 네비게이션
 * LayoutFixController 공통 모듈 사용
 */
(function() {
  'use strict';

  // ============================================
  // Configuration
  // ============================================
  const CONFIG = {
    SELECTORS: {
      keySection: '.primary .key'
    }
  };

  // ============================================
  // Layout Fix Controller Instance
  // ============================================
  let layoutFixController = null;

  // ============================================
  // Initialization
  // ============================================
  const init = () => {
    // LayoutFixController가 로드되었는지 확인
    if (typeof LayoutFixController === 'undefined') {
      console.warn('[Primary] LayoutFixController not loaded');
      return;
    }

    // 공통 모듈 초기화 (1개 key 섹션)
    layoutFixController = new LayoutFixController();
    layoutFixController.init(CONFIG.SELECTORS.keySection);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
