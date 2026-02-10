/**
 * Results Page Controller
 * 탭 전환 및 리포트 페이지 애니메이션
 * 
 * @version 2.1.0 (Simplified)
 */
(function() {
  'use strict';

  // ============================================
  // 설정
  // ============================================
  const config = {
    // 선택자
    selectors: {
      wrap: '.results-wrap',
      tabs: '.tab-list li a',
      panels: '.tab-content',
      pages: '.report-page'
    },
    
    // 탭 ID
    tabIds: ['key-natural', 'key-social', 'key-cost'],
    
    // 애니메이션 설정
    animation: {
      delay: 100,        // 각 페이지 간격 (ms)
      duration: 600,     // 애니메이션 지속 (ms)
      distance: 120      // 시작 위치 (px)
    },
    
    // 스크롤 탭 전환
    scrollTab: {
      enabled: true,
      distance: '300%'   // 핀 유지 거리
    }
  };

  // ============================================
  // 유틸리티
  // ============================================
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);
  const hasGSAP = () => typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

  // Debounce
  const debounce = (fn, ms) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  };

  // Throttle
  const throttle = (fn, ms) => {
    let waiting = false;
    return (...args) => {
      if (!waiting) {
        fn(...args);
        waiting = true;
        setTimeout(() => waiting = false, ms);
      }
    };
  };

  // ============================================
  // 탭 컨트롤러
  // ============================================
  const TabController = {
    wrap: null,
    tabs: null,
    panels: null,
    
    init() {
      this.wrap = $(config.selectors.wrap);
      if (!this.wrap) return;
      
      this.tabs = $$(config.selectors.tabs);
      this.panels = $$(config.selectors.panels);
      
      this.setupEvents();
    },
    
    setupEvents() {
      this.tabs.forEach((tab, i) => {
        // 클릭
        tab.addEventListener('click', (e) => {
          e.preventDefault();
          this.switch(i);
        });
        
        // 키보드
        tab.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.switch(i);
          }
        });
      });
    },
    
    switch(index) {
      const targetId = config.tabIds[index];
      const target = document.getElementById(targetId);
      if (!target) return;
      
      // 모든 패널 숨김
      this.panels.forEach(panel => {
        if (panel !== target) {
          panel.classList.remove('on');
          Animation.reset(panel);
        }
      });
      
      // 선택된 패널 표시
      target.classList.add('on');
      
      // 탭 상태 업데이트
      this.tabs.forEach((tab, i) => {
        const li = tab.closest('li');
        li.classList.toggle('on', i === index);
        tab.setAttribute('aria-selected', i === index);
      });
      
      // 애니메이션 실행
      setTimeout(() => Animation.run(target), 50);
      
      // 스크롤 탭 인덱스 동기화
      if (ScrollTab.enabled) {
        ScrollTab.currentIndex = index;
      }
    }
  };

  // ============================================
  // 애니메이션
  // ============================================
  const Animation = {
    animated: new Set(),
    
    init() {
      if (!hasGSAP()) return;
      
      const panels = $$(config.selectors.panels);
      
      // 각 패널에 스크롤 트리거 설정
      panels.forEach(panel => {
        ScrollTrigger.create({
          trigger: panel,
          start: 'top center',
          onEnter: () => this.onEnter(panel),
          onEnterBack: () => this.onEnter(panel)
        });
      });
      
      // 초기 상태 확인
      this.checkInitial();
    },
    
    onEnter(panel) {
      if (!panel.classList.contains('on')) return;
      this.run(panel);
    },
    
    checkInitial() {
      const active = $('.tab-content.on');
      if (!active) return;
      
      const rect = active.getBoundingClientRect();
      if (rect.top <= window.innerHeight / 2) {
        this.run(active);
      }
    },
    
    run(panel) {
      const pages = $$(config.selectors.pages, panel);
      if (!pages.length) return;
      
      const { delay, duration, distance } = config.animation;
      
      if (hasGSAP()) {
        // GSAP 애니메이션
        gsap.set(pages, { opacity: 0, y: distance });
        gsap.to(pages, {
          opacity: 1,
          y: 0,
          duration: duration / 1000,
          stagger: delay / 1000,
          ease: 'power2.out'
        });
      } else {
        // CSS 애니메이션
        pages.forEach((page, i) => {
          page.style.cssText = `
            opacity: 0;
            transform: translateY(${distance}px);
            transition: none;
          `;
          
          requestAnimationFrame(() => {
            setTimeout(() => {
              page.style.cssText = `
                opacity: 1;
                transform: translateY(0);
                transition: opacity ${duration}ms ease-out, 
                            transform ${duration}ms ease-out;
              `;
            }, i * delay);
          });
        });
      }
      
      this.animated.add(panel.id);
    },
    
    reset(panel) {
      const pages = $$(config.selectors.pages, panel);
      if (!pages.length) return;
      
      const { distance } = config.animation;
      
      if (hasGSAP()) {
        gsap.set(pages, { opacity: 0, y: distance });
      } else {
        pages.forEach(page => {
          page.style.cssText = `
            opacity: 0;
            transform: translateY(${distance}px);
            transition: none;
          `;
        });
      }
    }
  };

  // ============================================
  // 스크롤 탭
  // ============================================
  const ScrollTab = {
    enabled: false,
    currentIndex: -1,
    trigger: null,
    
    init() {
      if (!config.scrollTab.enabled || !hasGSAP()) return;
      
      const wrap = $(config.selectors.wrap);
      if (!wrap) return;
      
      const tabCount = config.tabIds.length;
      
      this.trigger = ScrollTrigger.create({
        trigger: wrap,
        start: 'top top',
        end: `+=${config.scrollTab.distance}`,
        pin: true,
        invalidateOnRefresh: true,
        onUpdate: throttle((self) => {
          const index = Math.min(
            Math.floor(self.progress * tabCount),
            tabCount - 1
          );
          if (index !== this.currentIndex && index >= 0) {
            this.currentIndex = index;
            TabController.switch(index);
          }
        }, 50)
      });
      
      this.enabled = true;
    }
  };

  // ============================================
  // 리사이즈 핸들러
  // ============================================
  const ResizeHandler = {
    init() {
      window.addEventListener('resize', debounce(() => {
        if (hasGSAP()) {
          ScrollTrigger.refresh();
        }
      }, 250));
    }
  };

  // ============================================
  // 페이지 로드
  // ============================================
  const PageLoad = {
    init() {
      // 스크롤 복원 차단
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      
      // 최상단으로
      if (window.scrollY > 0) {
        window.scrollTo(0, 0);
      }
      
      // 로딩 완료
      window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        if (hasGSAP()) {
          ScrollTrigger.refresh();
        }
      });
    }
  };

  // ============================================
  // 초기화
  // ============================================
  const init = () => {
    // 즉시 실행
    PageLoad.init();
    
    // DOM 준비 후
    const start = () => {
      if (hasGSAP()) {
        gsap.registerPlugin(ScrollTrigger);
      }
      
      TabController.init();
      Animation.init();
      ScrollTab.init();
      ResizeHandler.init();
    };
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start);
    } else {
      start();
    }
  };

  // ============================================
  // 전역 API
  // ============================================
  window.ResultsPageController = {
    switchTab: (i) => TabController.switch(i),
    refresh: () => hasGSAP() && ScrollTrigger.refresh(),
    config: config
  };

  // 시작
  init();
})();