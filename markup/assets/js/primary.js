/**
 * Primary Page Controller
 * 스크롤 기반 타이틀 전환 및 섹션 네비게이션
 */
(function() {
  'use strict';

  // ============================================
  // Configuration
  // ============================================
  const CONFIG = {
    SELECTORS: {
      keySection: '.primary .key',
      titles: '.js-fixLeft-tit > li', // keySection 내에서 검색
      sections: '.js-fixLeft-secs > article, .js-fixLeft-secs > div' // keySection 내에서 검색
    },
    SCROLL: {
      triggerLine: 'center center', // 섹션의 중앙이 뷰포트 중앙에 도달했을 때
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
  // Title Controller
  // ============================================
  const TitleController = {
    keySection: null,
    titles: null,
    sections: null,
    lastIndex: 0,

    init() {
      this.keySection = Utils.$(CONFIG.SELECTORS.keySection);
      if (!this.keySection) return;

      // keySection 내에서만 요소 찾기
      this.titles = this.keySection.querySelectorAll(CONFIG.SELECTORS.titles);
      this.sections = this.keySection.querySelectorAll(CONFIG.SELECTORS.sections);

      if (!this.titles.length || !this.sections.length) return;

      // GSAP 및 ScrollTrigger 확인
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('[TitleController] GSAP or ScrollTrigger not loaded');
        return;
      }

      gsap.registerPlugin(ScrollTrigger);
      if (typeof ScrollToPlugin !== 'undefined') {
        gsap.registerPlugin(ScrollToPlugin);
      }

      this.lastIndex = this.sections.length - 1;
      this.setupScrollTriggers();
      this.setupClickHandlers();
      this.setInitialState();
    },

    setupScrollTriggers() {
      // 각 섹션에 대한 스크롤 트리거 설정
      this.sections.forEach((section, index) => {
        if (!section) return;

        ScrollTrigger.create({
          trigger: section,
          start: CONFIG.SCROLL.triggerLine,
          onEnter: () => this.updateTitle(index),
          onLeaveBack: () => this.updateTitle(index > 0 ? index - 1 : 0)
        });
      });

      // 마지막 섹션: 페이지 하단 도달 시 활성화
      if (this.lastIndex > 0) {
        ScrollTrigger.create({
          trigger: this.sections[this.lastIndex],
          start: 'bottom bottom',
          onEnter: () => this.updateTitle(this.lastIndex)
        });
      }

      // 스크롤 리프레시 시 초기 상태 설정
      ScrollTrigger.addEventListener('refresh', () => {
        this.setInitialState();
      });

      // 스크롤 이벤트로 하단 감지
      window.addEventListener('scroll', () => {
        if (this.isAtBottom()) {
          this.updateTitle(this.lastIndex);
        }
      }, { passive: true });
    },

    setupClickHandlers() {
      this.titles.forEach((title, index) => {
        // 클릭 이벤트
        title.addEventListener('click', () => {
          this.scrollToSection(index);
        });

        // 키보드 접근성 (Enter, Space)
        title.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.scrollToSection(index);
          }
        });
      });
    },

    updateTitle(activeIndex) {
      this.titles.forEach((title, index) => {
        const isActive = index === activeIndex;
        title.classList.toggle('on', isActive);
        title.setAttribute('aria-selected', isActive ? 'true' : 'false');
        title.setAttribute('tabindex', isActive ? '0' : '-1');
      });
    },

    scrollToSection(index) {
      const section = this.sections[index];
      if (!section) return;

      const sectionClass = Array.from(section.classList).find(c => c.startsWith('sec-'));
      
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

      this.updateTitle(index);
    },

    setInitialState() {
      if (this.isAtBottom()) {
        this.updateTitle(this.lastIndex);
        return;
      }

      let activeIndex = 0;
      const viewportCenter = window.innerHeight / 2;
      let closestIndex = 0;
      let closestDistance = Infinity;

      // 각 섹션의 중앙점과 뷰포트 중앙의 거리를 계산
      this.sections.forEach((section, index) => {
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

      this.updateTitle(activeIndex);
    },

    isAtBottom() {
      return window.scrollY + window.innerHeight >= 
             document.documentElement.scrollHeight - CONFIG.SCROLL.bottomThreshold;
    }
  };

  // ============================================
  // Initialization
  // ============================================
  const init = () => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        TitleController.init();
      });
    } else {
      TitleController.init();
    }
  };

  init();

})();
