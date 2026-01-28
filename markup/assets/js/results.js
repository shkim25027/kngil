/**
 * Results Page Controller
 * 탭 전환 및 리포트 페이지 순차 애니메이션
 */
(function() {
  'use strict';

  // ============================================
  // Configuration
  // ============================================
  const CONFIG = {
    SELECTORS: {
      resultsWrap: '.results-wrap',
      tabList: '.tab-list',
      tabLinks: '.tab-list li a',
      tabContents: '.tab-content',
      reportPages: '.report-page',
      sectionHero: '.section-hero'
    },
    TAB_IDS: ['key-natural', 'key-social', 'key-cost'],
    ANIMATION: {
      reportPageDelay: 100, // 각 report-page 간 지연 시간 (ms)
      reportPageDuration: 600 // 애니메이션 지속 시간 (ms)
    },
    // 스크롤 구간별 탭 전환: results-wrap이 pin 되는 동안 스크롤 진행도로 탭 인덱스 결정
    SCROLL_TAB: {
      enabled: true,
      pinDistance: '120%' // 뷰포트 기준 핀 유지 거리 (3탭 × 구간)
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
  // Tab Controller
  // ============================================
  const TabController = {
    wrap: null,
    tabList: null,
    tabLinks: null,
    tabContents: null,

    init() {
      this.wrap = Utils.$(CONFIG.SELECTORS.resultsWrap);
      if (!this.wrap) return;

      this.tabList = this.wrap.querySelector(CONFIG.SELECTORS.tabList);
      this.tabLinks = this.tabList?.querySelectorAll(CONFIG.SELECTORS.tabLinks);
      this.tabContents = this.wrap.querySelectorAll(CONFIG.SELECTORS.tabContents);

      if (!this.tabList || !this.tabLinks?.length || !this.tabContents?.length) return;

      this.setupClickHandlers();
    },

    setupClickHandlers() {
      this.tabLinks.forEach((link, index) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.switchTab(index);
          if (typeof ScrollTabController !== 'undefined') {
            ScrollTabController.currentIndex = index;
          }
        });

        // 키보드 접근성
        link.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.switchTab(index);
            if (typeof ScrollTabController !== 'undefined') {
              ScrollTabController.currentIndex = index;
            }
          }
        });
      });
    },

    switchTab(activeIndex) {
      const targetId = CONFIG.TAB_IDS[activeIndex];
      if (!targetId) return;

      // 탭 컨텐츠 전환
      this.tabContents.forEach((content) => {
        // 이전 탭의 report-page를 초기 상태로 리셋
        if (content.classList.contains('on') && typeof ReportPageAnimation !== 'undefined') {
          ReportPageAnimation.resetPagesInTab(content);
        }
        content.classList.remove('on');
      });
      
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('on');
        // 탭 전환 시 report-page 애니메이션 실행
        if (typeof ReportPageAnimation !== 'undefined') {
          // 탭 전환 시에는 항상 애니메이션 실행
          setTimeout(() => {
            ReportPageAnimation.animateOnTabSwitch(targetContent);
          }, 50);
        }
      }

      // 탭 링크 상태 업데이트
      this.tabList.querySelectorAll('li').forEach((li, index) => {
        li.classList.toggle('on', index === activeIndex);
      });

      // aria-selected 업데이트
      this.tabLinks.forEach((link, index) => {
        const isActive = index === activeIndex;
        link.setAttribute('aria-selected', isActive ? 'true' : 'false');
        link.setAttribute('tabindex', isActive ? '0' : '-1');
      });
    }
  };

  // ============================================
  // Report Page Animation Controller
  // ============================================
  const ReportPageAnimation = {
    animatedTabs: new Set(), // 애니메이션이 실행된 탭 추적
    resultsWrap: null,
    observers: new Map(), // 각 탭별 Observer 저장

    init() {
      this.resultsWrap = Utils.$(CONFIG.SELECTORS.resultsWrap);
      if (!this.resultsWrap) return;

      // GSAP 및 ScrollTrigger 확인
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('[ReportPageAnimation] GSAP or ScrollTrigger not loaded');
        // GSAP이 없어도 IntersectionObserver로 대체 가능
        this.initWithObserver();
        return;
      }

      gsap.registerPlugin(ScrollTrigger);
      this.initWithScrollTrigger();
      
      // ScrollTrigger 초기화 후 초기 상태 확인
      ScrollTrigger.addEventListener('refresh', () => {
        this.checkInitialState();
      });
    },

    /**
     * ScrollTrigger를 사용한 애니메이션 초기화
     */
    initWithScrollTrigger() {
      // 각 탭의 .section-hero를 개별적으로 관찰
      const tabContents = this.resultsWrap.querySelectorAll(CONFIG.SELECTORS.tabContents);
      
      tabContents.forEach((tab) => {
        const sectionHero = tab.querySelector(CONFIG.SELECTORS.sectionHero);
        if (!sectionHero) return;

        const tabId = tab.id;
        
        ScrollTrigger.create({
          trigger: sectionHero,
          start: 'top center', // .section-hero의 top이 화면 중앙에 도달할 때
          onEnter: () => {
            // 활성화된 탭일 때만 실행
            if (tab.classList.contains('on')) {
              this.animatePagesInTab(tab);
              if (!this.animatedTabs.has(tabId)) {
                this.animatedTabs.add(tabId);
              }
            }
          },
          onEnterBack: () => {
            // 위로 스크롤해서 다시 중앙에 올 때도 실행 (활성화된 탭일 때만)
            if (tab.classList.contains('on')) {
              this.animatePagesInTab(tab);
              if (!this.animatedTabs.has(tabId)) {
                this.animatedTabs.add(tabId);
              }
            }
          },
          once: false // 탭 전환 시 다시 실행될 수 있도록
        });
      });

      // 초기 로드 시 활성화된 탭이 이미 화면 중앙에 있는지 확인
      this.checkInitialState();
    },

    /**
     * 초기 로드 시 활성화된 탭의 .section-hero의 top이 화면 중앙보다 위에 있는지 확인
     */
    checkInitialState() {
      const activeTab = this.resultsWrap.querySelector('.tab-content.on');
      if (!activeTab) return;

      const sectionHero = activeTab.querySelector(CONFIG.SELECTORS.sectionHero);
      if (!sectionHero) return;

      const rect = sectionHero.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      
      // .section-hero의 top이 화면 중앙보다 위에 있으면 애니메이션 실행
      if (rect.top <= viewportCenter) {
        const tabId = activeTab.id;
        if (!this.animatedTabs.has(tabId)) {
          this.animatePagesInTab(activeTab);
          this.animatedTabs.add(tabId);
        }
      }
    },

    /**
     * IntersectionObserver를 사용한 애니메이션 초기화 (GSAP 없을 때)
     */
    initWithObserver() {
      // 각 탭의 .section-hero를 개별적으로 관찰
      const tabContents = this.resultsWrap.querySelectorAll(CONFIG.SELECTORS.tabContents);
      
      tabContents.forEach((tab) => {
        const sectionHero = tab.querySelector(CONFIG.SELECTORS.sectionHero);
        if (!sectionHero) return;

        const tabId = tab.id;
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && !this.animatedTabs.has(tabId)) {
                const rect = entry.boundingClientRect;
                const viewportCenter = window.innerHeight / 2;
                
                // .section-hero의 top이 화면 중앙보다 위에 있으면 애니메이션 실행
                if (rect.top <= viewportCenter) {
                  this.animatePagesInTab(tab);
                  this.animatedTabs.add(tabId);
                  observer.unobserve(entry.target);
                }
              }
            });
          },
          {
            root: null,
            rootMargin: '0px',
            threshold: 0.3
          }
        );

        observer.observe(sectionHero);
        this.observers.set(tabId, observer);
      });

      // 초기 로드 시 활성화된 탭이 이미 화면 중앙에 있는지 확인
      this.checkInitialState();
    },


    /**
     * 특정 탭 내의 report-page 애니메이션
     */
    animatePagesInTab(tab) {
      const reportPages = tab.querySelectorAll(CONFIG.SELECTORS.reportPages);
      if (reportPages.length === 0) return;

      // GSAP이 있으면 GSAP 사용, 없으면 CSS transition 사용
      if (typeof gsap !== 'undefined') {
        // 초기 상태 설정 (강제로 리셋)
        gsap.set(reportPages, {
          opacity: 0,
          y: 120,
          clearProps: 'all' // 이전 애니메이션 속성 제거
        });

        // 순차적으로 애니메이션
        gsap.to(reportPages, {
          opacity: 1,
          y: 0,
          duration: CONFIG.ANIMATION.reportPageDuration / 1000,
          stagger: CONFIG.ANIMATION.reportPageDelay / 1000,
          ease: 'power2.out'
        });
      } else {
        // CSS transition 사용
        reportPages.forEach((page, index) => {
          // 초기 상태로 리셋 (transition 없이)
          page.style.transition = 'none';
          page.style.opacity = '0';
          page.style.transform = 'translateY(120px)';

          // 다음 프레임에서 transition 설정 후 애니메이션 시작
          requestAnimationFrame(() => {
            // CSS의 transition이 적용되도록 클래스 확인
            if (tab.classList.contains('on')) {
              setTimeout(() => {
                page.style.opacity = '1';
                page.style.transform = 'translateY(0)';
              }, index * CONFIG.ANIMATION.reportPageDelay);
            }
          });
        });
      }
    },

    /**
     * 탭의 report-page를 초기 상태로 리셋
     */
    resetPagesInTab(tab) {
      const reportPages = tab.querySelectorAll(CONFIG.SELECTORS.reportPages);
      if (reportPages.length === 0) return;

      if (typeof gsap !== 'undefined') {
        // GSAP으로 즉시 초기 상태로 리셋
        gsap.set(reportPages, {
          opacity: 0,
          y: 120,
          clearProps: 'all'
        });
      } else {
        // CSS로 초기 상태로 리셋 (transition 없이 즉시)
        reportPages.forEach((page) => {
          page.style.transition = 'none'; // 먼저 transition 제거
          page.style.opacity = '0';
          page.style.transform = 'translateY(120px)';
          
          // 다음 프레임에서 transition 복원 (애니메이션을 위해)
          requestAnimationFrame(() => {
            page.style.transition = '';
          });
        });
      }
    },

    /**
     * 탭 전환 후 해당 탭의 .section-hero의 top이 화면 중앙보다 위에 있는지 확인
     */
    checkTabAfterSwitch(tab) {
      const sectionHero = tab.querySelector(CONFIG.SELECTORS.sectionHero);
      if (!sectionHero) return;

      const tabId = tab.id;
      
      // 약간의 지연 후 위치 확인 (DOM 업데이트 대기)
      setTimeout(() => {
        const rect = sectionHero.getBoundingClientRect();
        const viewportCenter = window.innerHeight / 2;
        
        // .section-hero의 top이 화면 중앙보다 위에 있으면 애니메이션 실행
        // 탭 전환 시에는 항상 실행 (animatedTabs 체크 제거)
        if (rect.top <= viewportCenter) {
          this.animatePagesInTab(tab);
          // 스크롤 트리거용 추적은 유지 (중복 방지)
          if (!this.animatedTabs.has(tabId)) {
            this.animatedTabs.add(tabId);
          }
        }
      }, 100);
    },

    /**
     * 탭 전환 시 즉시 애니메이션 실행 (화면 중앙 체크 없이)
     */
    animateOnTabSwitch(tab) {
      // 탭 전환 시에는 항상 애니메이션 실행
      this.animatePagesInTab(tab);
      const tabId = tab.id;
      if (!this.animatedTabs.has(tabId)) {
        this.animatedTabs.add(tabId);
      }
    }
  };

  // ============================================
  // Scroll-driven Tab Controller (GSAP ScrollTrigger)
  // 스크롤 진행도에 따라 탭 전환
  // ============================================
  const ScrollTabController = {
    wrap: null,
    currentIndex: -1,
    scrollTrigger: null,

    init() {
      if (!CONFIG.SCROLL_TAB.enabled) return;

      this.wrap = Utils.$(CONFIG.SELECTORS.resultsWrap);
      if (!this.wrap) return;

      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      const tabCount = CONFIG.TAB_IDS.length;
      const pinDistance = CONFIG.SCROLL_TAB.pinDistance || '200%';

      this.scrollTrigger = ScrollTrigger.create({
        trigger: this.wrap,
        start: 'top top',
        end: `+=${pinDistance}`,
        pin: true,
        pinSpacing: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const index = Math.min(
            Math.floor(progress * tabCount),
            tabCount - 1
          );
          if (index !== this.currentIndex && index >= 0) {
            this.currentIndex = index;
            TabController.switchTab(index);
          }
        },
        onLeave: () => {
          this.currentIndex = tabCount - 1;
        },
        onEnterBack: () => {
          // 위로 스크롤 시 진행도에 맞춰 탭 갱신
          this.currentIndex = -1;
        }
      });

      // 초기 진입 시 0번 탭으로 맞춤
      this.currentIndex = -1;
    }
  };

  // ============================================
  // Initialization
  // ============================================
  const init = () => {
    const run = () => {
      TabController.init();
      ReportPageAnimation.init();
      ScrollTabController.init();
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run);
    } else {
      run();
    }
  };

  init();
})();
