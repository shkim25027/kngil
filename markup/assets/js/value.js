/**
 * Value Page Animation Controller
 * Intersection Observer를 사용한 스크롤 애니메이션
 */
(function() {
  'use strict';

  // ============================================
  // Configuration
  // ============================================
  const CONFIG = {
    SELECTORS: {
      animationTarget: '.js-ani'
    },
    OBSERVER: {
      root: null,
      rootMargin: '0px',
      threshold: [0, 0.7]
    },
    ANIMATION: {
      cardClass: 'card-ani',
      lineClass: 'move-ani',
      duration: 1200
    }
  };

  // ============================================
  // Animation Controller
  // ============================================
  const AnimationController = {
    hasRun: false,
    targetElement: null,
    observer: null,

    init() {
      this.targetElement = document.querySelector(CONFIG.SELECTORS.animationTarget);
      
      if (!this.targetElement) {
        return;
      }

      this.setupObserver();
    },

    setupObserver() {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        CONFIG.OBSERVER
      );
      
      this.observer.observe(this.targetElement);
    },

    handleIntersection(entries) {
      entries.forEach(entry => {
        if (!this.hasRun && entry.intersectionRatio >= 0.7) {
          this.startAnimation();
          this.hasRun = true;
          this.observer.unobserve(this.targetElement);
        }
      });
    },

    startAnimation() {
      // 카드 애니메이션 클래스 추가
      this.targetElement.classList.add(CONFIG.ANIMATION.cardClass);
      
      // 라인 애니메이션 클래스 추가
      const linesElement = this.targetElement.querySelector('.lines');
      if (linesElement) {
        linesElement.classList.add(CONFIG.ANIMATION.lineClass);
      }

      // 애니메이션 종료 후 클래스 제거
      setTimeout(() => {
        this.targetElement.classList.remove(CONFIG.ANIMATION.cardClass);
      }, CONFIG.ANIMATION.duration);
    }
  };

  // ============================================
  // Initialization
  // ============================================
  const init = () => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        AnimationController.init();
      });
    } else {
      AnimationController.init();
    }
  };

  init();

})();
