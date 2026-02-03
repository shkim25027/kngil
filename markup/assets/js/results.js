/**
 * Results Page Controller
 * 탭 전환 및 리포트 페이지 애니메이션
 * (sub1 참고: 스크롤 진행률 기반 탭 전환, 탭 클릭 시 스크롤 이동)
 *
 * @version 2.3.0 (탭 전환 문제 해결)
 */
(function() {
  'use strict';

  // ============================================
  // 설정
  // ============================================
  const config = {
    // 선택자
    selectors: {
      wrap: '.sub-category',
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
    
    // 스크롤 탭 전환 (sub1 참고)
    scrollTab: {
      enabled: true,
      totalScrollDistance: 1000,  // 핀 구간 총 스크롤 거리 (px)
      pinSpacing: true,            // 레이아웃 유지를 위해 true 권장
      clickScrollDuration: 0.5     // 탭 클릭 시 스크롤 애니메이션 시간
    }
  };

  // ============================================
  // 유틸리티
  // ============================================
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);
  const hasGSAP = () => typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  const hasScrollToPlugin = () => typeof ScrollToPlugin !== 'undefined';
  
  // Lenis 감지 개선
  const getLenis = () => {
    if (typeof window !== 'undefined') {
      return window.lenis || null;
    }
    return null;
  };

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
  // 탭 컨트롤러 (sub1 참고: isClicking, 스크롤 이동)
  // ============================================
  const TabController = {
    wrap: null,
    tabs: null,
    panels: null,
    activeIndex: 0,
    isClicking: false,
    
    init() {
      this.wrap = $(config.selectors.wrap);
      if (!this.wrap) {
        console.warn('ResultsPageController: wrap 요소를 찾을 수 없습니다.');
        return;
      }
      
      this.tabs = $$(config.selectors.tabs);
      this.panels = $$(config.selectors.panels);
      
      if (!this.tabs.length || !this.panels.length) {
        console.warn('ResultsPageController: 탭 또는 패널을 찾을 수 없습니다.');
        return;
      }
      
      console.log('ResultsPageController: 초기화 완료', {
        tabs: this.tabs.length,
        panels: this.panels.length
      });
      
      this.setupEvents();
      
      // 초기 탭 활성화 (중요!)
      this.switch(0, false);
    },
    
    setupEvents() {
      this.tabs.forEach((tab, i) => {
        // 클릭: 해당 탭 위치로 스크롤 이동 (sub1 참고)
        tab.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          console.log('탭 클릭:', i, '현재:', this.activeIndex);
          
          if (this.activeIndex === i) return;
          
          const lenis = getLenis();
          if (lenis && lenis.stop) {
            lenis.stop();
          }
          
          this.isClicking = true;
          this.scrollToTab(i);
        });
        
        // 키보드
        tab.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (this.activeIndex !== i) {
              const lenis = getLenis();
              if (lenis && lenis.stop) lenis.stop();
              this.isClicking = true;
              this.scrollToTab(i);
            }
          }
          // 화살표 키 네비게이션
          else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            const tabCount = config.tabIds.length;
            const newIndex = e.key === 'ArrowLeft' 
              ? Math.max(0, i - 1) 
              : Math.min(tabCount - 1, i + 1);
            
            if (this.activeIndex !== newIndex) {
              const lenis = getLenis();
              if (lenis && lenis.stop) lenis.stop();
              this.isClicking = true;
              this.scrollToTab(newIndex);
              this.tabs[newIndex].focus();
            }
          }
        });
      });
    },
    
    // 탭 클릭 시 해당 스크롤 위치로 이동 (sub1 참고)
    scrollToTab(index) {
      if (!ScrollTab.trigger) {
        console.log('ScrollTab.trigger 없음, 직접 전환');
        this.isClicking = false;
        this.switch(index, true);
        const lenis = getLenis();
        if (lenis && lenis.start) lenis.start();
        return;
      }
      
      if (!hasScrollToPlugin()) {
        console.log('ScrollToPlugin 없음, 직접 전환');
        this.isClicking = false;
        this.switch(index, true);
        const lenis = getLenis();
        if (lenis && lenis.start) lenis.start();
        return;
      }
      
      const tabCount = config.tabIds.length;
      const totalDistance = config.scrollTab.totalScrollDistance;
      
      // 목표 스크롤 위치 계산 (sub1 참고)
      const targetScroll = ScrollTab.trigger.start + Math.ceil((index / tabCount) * totalDistance);
      
      console.log('스크롤 이동:', {
        index,
        start: ScrollTab.trigger.start,
        targetScroll
      });
      
      gsap.to(window, {
        scrollTo: targetScroll,
        duration: config.scrollTab.clickScrollDuration,
        ease: 'power1.out',
        onComplete: () => {
          this.isClicking = false;
          const lenis = getLenis();
          if (lenis && lenis.start) lenis.start();
        }
      });
    },
    
    switch(index, animate = true) {
      const targetId = config.tabIds[index];
      const target = document.getElementById(targetId);
      
      if (!target) {
        console.warn('패널을 찾을 수 없습니다:', targetId);
        return;
      }
      
      console.log('탭 전환:', this.activeIndex, '→', index);
      
      this.activeIndex = index;
      
      // 모든 패널 처리
      this.panels.forEach(panel => {
        if (panel === target) {
          // 활성화
          if (!panel.classList.contains('on')) {
            panel.classList.add('on');
            console.log('패널 활성화:', panel.id);
          }
        } else {
          // 비활성화
          if (panel.classList.contains('on')) {
            panel.classList.remove('on');
            Animation.reset(panel);
          }
        }
      });
      
      // 탭 상태 업데이트
      this.tabs.forEach((tab, i) => {
        const li = tab.closest('li');
        const isActive = i === index;
        
        if (isActive) {
          li.classList.add('on');
        } else {
          li.classList.remove('on');
        }
        
        tab.setAttribute('aria-selected', isActive);
        tab.setAttribute('tabindex', isActive ? '0' : '-1');
      });
      
      // 애니메이션 실행
      if (animate) {
        setTimeout(() => Animation.run(target), 50);
      }
    }
  };

  // ============================================
  // 애니메이션
  // ============================================
  const Animation = {
    animated: new Set(),
    runningAnimations: new Map(),
    
    init() {
      if (!hasGSAP()) return;
      
      const panels = $$(config.selectors.panels);
      
      // 각 패널에 스크롤 트리거 설정
      panels.forEach(panel => {
        ScrollTrigger.create({
          trigger: panel,
          start: 'top center',
          onEnter: () => this.onEnter(panel),
          onEnterBack: () => this.onEnter(panel),
          invalidateOnRefresh: true
        });
      });
      
      // 초기 상태 확인
      this.checkInitial();
    },
    
    onEnter(panel) {
      if (!panel.classList.contains('on')) return;
      if (this.animated.has(panel.id)) return;
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
      
      // 이미 애니메이션된 경우 무시
      if (this.animated.has(panel.id)) return;
      
      // 실행 중인 애니메이션 취소
      if (this.runningAnimations.has(panel.id)) {
        this.runningAnimations.get(panel.id).kill();
      }
      
      const { delay, duration, distance } = config.animation;
      
      if (hasGSAP()) {
        // GSAP 애니메이션
        gsap.set(pages, { opacity: 0, y: distance });
        const tl = gsap.to(pages, {
          opacity: 1,
          y: 0,
          duration: duration / 1000,
          stagger: delay / 1000,
          ease: 'power2.out',
          onComplete: () => {
            this.runningAnimations.delete(panel.id);
          }
        });
        
        this.runningAnimations.set(panel.id, tl);
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
      
      // 실행 중인 애니메이션 취소
      if (this.runningAnimations.has(panel.id)) {
        this.runningAnimations.get(panel.id).kill();
        this.runningAnimations.delete(panel.id);
      }
      
      // 애니메이션 상태 초기화
      this.animated.delete(panel.id);
      
      const { distance } = config.animation;
      
      if (hasGSAP()) {
        gsap.set(pages, { opacity: 0, y: distance, clearProps: 'all' });
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
  // 스크롤 탭 (sub1 참고: pinSpacing, isClicking, 인덱스 점프 방지)
  // ============================================
  const ScrollTab = {
    enabled: false,
    trigger: null,
    
    init() {
      if (!config.scrollTab.enabled || !hasGSAP()) return;
      
      const wrap = $(config.selectors.wrap);
      if (!wrap) {
        console.warn('ResultsPageController: ScrollTab wrap 요소를 찾을 수 없습니다.');
        return;
      }
      
      const tabCount = config.tabIds.length;
      const totalDistance = config.scrollTab.totalScrollDistance;
      const pinSpacing = config.scrollTab.pinSpacing !== false;
      
      console.log('ScrollTab 초기화:', {
        tabCount,
        totalDistance,
        pinSpacing
      });
      
      this.trigger = ScrollTrigger.create({
        trigger: wrap,
        start: 'top top',
        end: `+=${totalDistance}`,
        pin: true,
        pinSpacing: pinSpacing,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        
        // 디버깅 (개발 시)
        // markers: true,
        // id: 'results-scroll',
        
        onEnter: () => {
          console.log('ScrollTrigger: onEnter');
          if (TabController.activeIndex === -1) {
            TabController.switch(0, true);
          }
        },
        
        onUpdate: throttle((self) => {
          // 클릭 중엔 스크롤 기반 탭 전환 안 함 (sub1 참고)
          if (TabController.isClicking) return;
          
          const progress = self.progress;
          
          // 진행률을 탭 인덱스로 변환 (수정: 마지막 탭 포함)
          let newIndex;
          if (progress >= 0.99) {
            // 거의 끝에 도달하면 마지막 탭
            newIndex = tabCount - 1;
          } else {
            // 진행률 기반 계산
            newIndex = Math.floor(progress * tabCount);
          }
          
          // 범위 제한
          newIndex = Math.max(0, Math.min(tabCount - 1, newIndex));
          
          // 너무 빠른 인덱스 점프 방지 (sub1 참고)
          if (Math.abs(newIndex - TabController.activeIndex) > 1) {
            console.log('점프 방지:', TabController.activeIndex, '→', newIndex);
            return;
          }
          
          if (newIndex !== TabController.activeIndex) {
            console.log('스크롤 기반 탭 전환:', {
              progress: progress.toFixed(3),
              oldIndex: TabController.activeIndex,
              newIndex
            });
            TabController.switch(newIndex, true);
          }
        }, 50),
        
        onLeave: () => {
          console.log('ScrollTrigger: onLeave');
          // 마지막 탭 유지
          const lastIndex = tabCount - 1;
          if (TabController.activeIndex !== lastIndex) {
            TabController.switch(lastIndex, true);
          }
        },
        
        onEnterBack: () => {
          console.log('ScrollTrigger: onEnterBack');
          // 마지막 탭 표시
          const lastIndex = tabCount - 1;
          if (TabController.activeIndex !== lastIndex) {
            TabController.switch(lastIndex, true);
          }
        }
      });
      
      console.log('ScrollTrigger 생성 완료:', {
        start: this.trigger.start,
        end: this.trigger.end
      });
      
      this.enabled = true;
    },
    
    destroy() {
      if (this.trigger) {
        this.trigger.kill();
        this.trigger = null;
      }
    }
  };

  // ============================================
  // 리사이즈 핸들러
  // ============================================
  const ResizeHandler = {
    init() {
      window.addEventListener('resize', debounce(() => {
        if (hasGSAP()) {
          console.log('리사이즈: ScrollTrigger 새로고침');
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
          console.log('페이지 로드 완료: ScrollTrigger 새로고침');
          
          // Lenis 통합 (있다면)
          const lenis = getLenis();
          if (lenis) {
            console.log('Lenis 감지됨');
          }
          
          ScrollTrigger.refresh();
        }
      });
    }
  };

  // ============================================
  // 초기화
  // ============================================
  const init = () => {
    console.log('ResultsPageController 초기화 시작');
    
    // 즉시 실행
    PageLoad.init();
    
    // DOM 준비 후
    const start = () => {
      console.log('DOM 준비 완료');
      
      if (hasGSAP()) {
        console.log('GSAP 감지됨');
        gsap.registerPlugin(ScrollTrigger);
        
        if (hasScrollToPlugin()) {
          console.log('ScrollToPlugin 감지됨');
          gsap.registerPlugin(ScrollToPlugin);
        } else {
          console.warn('ScrollToPlugin이 로드되지 않았습니다. 탭 클릭 시 즉시 전환됩니다.');
        }
      } else {
        console.warn('GSAP이 로드되지 않았습니다.');
      }
      
      TabController.init();
      Animation.init();
      ScrollTab.init();
      ResizeHandler.init();
      
      console.log('ResultsPageController 초기화 완료');
    };
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start);
    } else {
      start();
    }
  };

  // ============================================
  // 정리
  // ============================================
  const cleanup = () => {
    console.log('ResultsPageController 정리');
    
    ScrollTab.destroy();
    Animation.runningAnimations.forEach(anim => anim.kill());
    Animation.runningAnimations.clear();
    
    if (hasGSAP()) {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    }
  };

  window.addEventListener('beforeunload', cleanup);

  // ============================================
  // 전역 API
  // ============================================
  window.ResultsPageController = {
    switchTab: (i) => TabController.switch(i, true),
    refresh: () => {
      if (hasGSAP()) {
        ScrollTrigger.refresh();
      }
    },
    destroy: cleanup,
    config: config,
    
    // 디버깅용
    getState: () => ({
      activeIndex: TabController.activeIndex,
      isClicking: TabController.isClicking,
      animated: Array.from(Animation.animated),
      triggerInfo: ScrollTab.trigger ? {
        start: ScrollTab.trigger.start,
        end: ScrollTab.trigger.end,
        progress: ScrollTab.trigger.progress
      } : null
    })
  };

  // 시작
  init();
})();