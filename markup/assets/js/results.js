/**
 * Results Page Controller
 * 탭 전환 및 스크롤 기반 타이틀 전환 (3개 key 섹션)
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
      key1: '.key.natural',
      key2: '.key.social',
      key3: '.key.cost',
      titles: '.js-fixLeft-tit > li',
      sections: '.js-fixLeft-secs > article, .js-fixLeft-secs > div',
      topTabs: '.results-tabs ul li'
    },
    TAB_IDS: ['key-natural', 'key-social', 'key-cost'],
    SCROLL: {
      triggerLine: 'top 100px',
      offsetY: 100,
      bottomThreshold: 30,
      tabUpdateThreshold: 0.3
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
        });

        // 키보드 접근성
        link.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.switchTab(index);
          }
        });
      });
    },

    switchTab(activeIndex) {
      const targetId = CONFIG.TAB_IDS[activeIndex];
      if (!targetId) return;

      // 탭 컨텐츠 전환
      this.tabContents.forEach((content) => {
        content.classList.remove('on');
      });
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('on');
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
      this.initTopTabSync();
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
        this.setInitialState();
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
        /^(natural|social|cost)\d+$/.test(c)
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

      this.keyData.forEach(({ titles, sections }) => {
        if (!titles || !sections) return;

        let activeIndex = 0;

        if (atBottom && this.keyData.indexOf({ titles, sections }) === 2) {
          activeIndex = titles.length - 1;
        } else {
          // 현재 보이는 섹션 찾기
          sections.forEach((section, index) => {
            if (section) {
              const rect = section.getBoundingClientRect();
              if (rect.top <= CONFIG.SCROLL.offsetY) {
                activeIndex = index;
              }
            }
          });

          // 마지막 섹션 체크
          const lastSection = sections[sections.length - 1];
          if (lastSection) {
            const lastRect = lastSection.getBoundingClientRect();
            const prevSection =
              sections.length > 1 ? sections[sections.length - 2] : null;
            const prevRect = prevSection ? prevSection.getBoundingClientRect() : null;

            if (
              lastRect.top < window.innerHeight &&
              lastRect.bottom > 0 &&
              prevRect &&
              prevRect.top < 0
            ) {
              activeIndex = sections.length - 1;
            }
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
    // Top Tab Sync (상단 탭과 스크롤 동기화)
    // ============================================
    initTopTabSync() {
      const topTabs = Utils.$$(CONFIG.SELECTORS.topTabs);
      if (topTabs.length < 3) return;

      // 상단 탭 클릭 시 해당 key 섹션으로 스크롤
      topTabs.forEach((tab, index) => {
        const link = tab.querySelector('a');
        if (!link) return;

        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetKey = this.keys[index];
          if (!targetKey) return;

          targetKey.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

          // 탭 상태 업데이트
          topTabs.forEach((t, i) => t.classList.toggle('on', i === index));
        });
      });

      // 스크롤에 따라 상단 탭 상태 업데이트
      const updateTopTabs = () => {
        const viewportY = window.scrollY + window.innerHeight * CONFIG.SCROLL.tabUpdateThreshold;
        let activeIndex = 0;

        this.keys.forEach((key, index) => {
          if (key) {
            const rect = key.getBoundingClientRect();
            const keyTop = rect.top + window.scrollY;
            if (viewportY >= keyTop) {
              activeIndex = index;
            }
          }
        });

        topTabs.forEach((tab, index) => {
          tab.classList.toggle('on', index === activeIndex);
        });
      };

      window.addEventListener('scroll', updateTopTabs, { passive: true });
      updateTopTabs();
    }
  };

  // ============================================
  // Initialization
  // ============================================
  const init = () => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        TabController.init();
        KeySectionController.init();
      });
    } else {
      TabController.init();
      KeySectionController.init();
    }
  };

  init();
})();
