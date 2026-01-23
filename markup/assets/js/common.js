/**
 * Common JavaScript
 * 공통 기능 모음
 */
(function() {
  'use strict';

  // ============================================
  // Scroll Manager
  // ============================================
  class ScrollManager {
    constructor() {
      this.scrollY = 0;
      this.wrap = null;
      this.isLocked = false;
    }

    /**
     * 스크린 높이 계산 및 CSS 변수 설정
     */
    syncHeight() {
      try {
        document.documentElement.style.setProperty(
          '--window-inner-height',
          `${window.innerHeight}px`
        );
      } catch (error) {
        console.error('[ScrollManager] syncHeight error:', error);
      }
    }

    /**
     * 초기화
     */
    init() {
      this.syncHeight();
      
      // 윈도우 리사이즈 시 높이 재설정
      window.addEventListener('resize', () => {
        this.syncHeight();
      });
    }
  }

  // ScrollManager 인스턴스 생성 및 초기화
  const scrollManager = new ScrollManager();
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      scrollManager.init();
      const layoutFix = document.querySelectorAll('.layout-fix-left');
      if (layoutFix.length === 1) layoutFix[0].classList.add('is-single');
    });
  } else {
    scrollManager.init();
    const layoutFix = document.querySelectorAll('.layout-fix-left');
    if (layoutFix.length === 1) layoutFix[0].classList.add('is-single');
  }

  // 전역 노출
  window.ScrollManager = ScrollManager;
  window.scrollManager = scrollManager;

  // ============================================
  // Include Handler
  // ============================================
  class IncludeHandler {
    /**
     * 초기화
     */
    init() {
      window.addEventListener('load', () => {
        this.loadIncludes();
      });
    }

    /**
     * data-include-path 속성을 가진 요소들의 HTML 포함 처리
     */
    loadIncludes() {
      if (!document.querySelector('[data-include-path]')) return;
      const allElements = document.getElementsByTagName('*');
      Array.prototype.forEach.call(allElements, (el) => {
        const includePath = el.dataset.includePath;
        if (includePath) {
          this.loadInclude(el, includePath);
        }
      });
    }

    /**
     * 개별 include 로드
     */
    loadInclude(element, path) {
      const xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = () => {
        if (xhttp.readyState === 4) {
          if (xhttp.status === 200) {
            element.outerHTML = xhttp.responseText;
          } else {
            console.error(`[IncludeHandler] Failed to load: ${path}`, xhttp.status);
          }
        }
      };
      xhttp.open('GET', path, true);
      xhttp.send();
    }
  }

  const includeHandler = new IncludeHandler();
  includeHandler.init();

  // ============================================
  // Popup Manager
  // ============================================
  class PopupManager {
    constructor() {
      this.popupScriptLoaded = false;
      this.currentPopupId = null;
      this.popupMap = {
        agreement: '#pop_agreement',
        join: '#pop_join',
        login: '#pop_login',
        mypage01: '#pop_mypage01',
        mypage02: '#pop_mypage02',
        mypage03: '#pop_mypage03',
        search: '#pop_search',
        password: '#pop_password',
        privacy: '#pop_privacy'
      };
    }

    /**
     * 팝업 스크롤 처리 (Lenis 중지)
     */
    handlePopupScroll() {
      $('body').css('overflow', 'hidden');
      $('body').on('wheel', function(e) {
        e.stopPropagation();
      });
      
      if (typeof window.lenis !== 'undefined' && window.lenis) {
        window.lenis.stop();
      } else if (typeof lenis !== 'undefined' && lenis) {
        lenis.stop();
      }
    }

    /**
     * 팝업 스크립트 로드
     */
    loadPopupScript(callback) {
      if (this.popupScriptLoaded || typeof PopupController !== 'undefined') {
        if (callback) callback();
        return;
      }

      $.getScript('./js/popup.js')
        .done(() => {
          this.popupScriptLoaded = true;
          if (callback) callback();
        })
        .fail((jqxhr, settings, exception) => {
          console.error('[PopupManager] Failed to load popup.js:', exception);
          if (callback) callback();
        });
    }

    /**
     * 팝업 열기
     */
    open(popupId) {
      if (!popupId) {
        console.warn('[PopupManager] Popup ID is required');
        return;
      }

      if (this.currentPopupId && this.currentPopupId !== popupId) {
        $(this.currentPopupId).hide();
      }
      this.currentPopupId = popupId;

      const $popup = $(popupId);
      if ($popup.length === 0) {
        console.warn(`[PopupManager] Popup not found: ${popupId}`);
        return;
      }

      $popup.show(0, () => {
        this.loadPopupScript(() => {
          this.handlePopupScroll();
        });
      });
    }

    /**
     * 개인정보 보호정책 팝업 열기
     */
    openPrivacy(type = 'privacy') {
      var id = '#pop_privacy';
      if (this.currentPopupId && this.currentPopupId !== id) {
        $(this.currentPopupId).hide();
      }
      this.currentPopupId = id;

      const $popup = $(id);
      if ($popup.length === 0) {
        console.warn('[PopupManager] Privacy popup not found');
        return;
      }

      $popup.show(0, () => {
        this.loadPopupScript(() => {
          this.handlePopupScroll();
          this.setPrivacyTab(type);
        });
      });
    }

    /**
     * 개인정보 보호정책 탭 설정
     */
    setPrivacyTab(type) {
      const $privacyTab = $('#pop_privacy li.tab-privacy');
      const $agreementTab = $('#pop_privacy li.tab-agreement');
      const $priContent = $('.tab-content.pri');
      const $agrContent = $('.tab-content.agr');

      if (type === 'privacy') {
        $privacyTab.addClass('on');
        $agreementTab.removeClass('on');
        $priContent.addClass('show');
        $agrContent.removeClass('show');
      } else if (type === 'agreement') {
        $agreementTab.addClass('on');
        $privacyTab.removeClass('on');
        $agrContent.addClass('show');
        $priContent.removeClass('show');
      }

      // 탭 콘텐츠 스크롤 처리
      $('#pop_privacy .tab-content').css('overflow', 'auto');
      $('#pop_privacy .tab-content').on('wheel', function(e) {
        e.stopPropagation();
      });
      
      // PrivacyTabController가 있으면 사용
      if (typeof PrivacyTabController !== 'undefined' && PrivacyTabController.switchTab) {
        const $targetTab = type === 'privacy' ? $privacyTab : $agreementTab;
        PrivacyTabController.switchTab($targetTab);
      }
    }

    /**
     * 전역 함수 생성
     */
    createGlobalFunctions() {
      // 일반 팝업 열기 함수들
      Object.keys(this.popupMap).forEach(key => {
        if (key === 'privacy') return; // privacy는 별도 처리
        
        window[key] = () => {
          this.open(this.popupMap[key]);
        };
      });

      // 개인정보 보호정책 팝업
      window.privacy = (type) => {
        this.openPrivacy(type);
      };
    }
  }

  const popupManager = new PopupManager();
  popupManager.createGlobalFunctions();
  
  // 전역 노출
  window.PopupManager = PopupManager;
  window.popupManager = popupManager;

  // ============================================
  // Lenis Manager
  // ============================================
  class LenisManager {
    constructor() {
      this.lenisInstance = null;
      this.isSitemapOpen = false;
    }

    /**
     * Lenis 초기화
     */
    init() {
      if (this.isSitemapOpen) {
        return;
      }
      
      if (typeof Lenis === 'undefined') {
        return;
      }
      
      // 기존 lenis가 있으면 destroy
      this.destroy();
      
      // 새 lenis 인스턴스 생성
      this.lenisInstance = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        smoothTouch: false,
      });
      
      // 전역 변수로 설정
      window.lenis = this.lenisInstance;
      
      // 이벤트 리스너 추가
      this.lenisInstance.on('scroll', () => {
        // 스크롤 이벤트 처리
      });
      
      if (typeof ScrollTrigger !== 'undefined') {
        this.lenisInstance.on('scroll', ScrollTrigger.update);
      }
      
      if (typeof gsap !== 'undefined' && gsap.ticker) {
        gsap.ticker.add((time) => {
          if (this.lenisInstance && !this.isSitemapOpen) {
            this.lenisInstance.raf(time * 1000);
          }
        });
        gsap.ticker.lagSmoothing(0);
      }
    }

    /**
     * Lenis 제거
     */
    destroy() {
      if (typeof window.lenis !== 'undefined' && window.lenis && window.lenis.destroy) {
        try {
          window.lenis.destroy();
        } catch (e) {
          console.warn('[LenisManager] Destroy error:', e);
        }
        window.lenis = null;
      }
      
      if (typeof lenis !== 'undefined' && lenis !== window.lenis && lenis && lenis.destroy) {
        try {
          lenis.destroy();
        } catch (e) {
          console.warn('[LenisManager] Destroy error:', e);
        }
      }
      
      this.lenisInstance = null;
    }

    /**
     * Lenis 시작
     */
    start() {
      if (this.lenisInstance && this.lenisInstance.start) {
        this.lenisInstance.start();
      }
    }

    /**
     * Lenis 중지
     */
    stop() {
      if (this.lenisInstance && this.lenisInstance.stop) {
        this.lenisInstance.stop();
      }
    }

    /**
     * 사이트맵 열림 상태 설정
     */
    setSitemapOpen(isOpen) {
      this.isSitemapOpen = isOpen;
    }
  }

  const lenisManager = new LenisManager();
  
  // 전역 함수로 노출 (하위 호환성)
  window.handleStartLenis = () => {
    lenisManager.init();
  };
  
  // 전역 노출
  window.LenisManager = LenisManager;
  window.lenisManager = lenisManager;

  // ============================================
  // Sitemap Manager
  // ============================================
  class SitemapManager {
    constructor() {
      this.isOpen = false;
      this.preventScrollHandler = null;
      this.scrollLockInterval = null;
      this.savedScrollY = 0;
    }

    /**
     * 사이트맵 스크롤 처리
     */
    handleScroll(isOpen) {
      this.isOpen = isOpen;
      lenisManager.setSitemapOpen(isOpen);
      
      if (isOpen) {
        this.lockScroll();
      } else {
        this.unlockScroll();
      }
    }

    /**
     * 스크롤 잠금
     */
    lockScroll() {
      // 현재 스크롤 위치 저장
      this.savedScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      document.body.setAttribute('data-scroll-y', this.savedScrollY);
      document.body.style.position = 'fixed';
      document.body.style.top = `-${this.savedScrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      
      // Lenis 제거
      lenisManager.destroy();
      
      // Lenis.prototype.raf 오버라이드
      this.overrideLenisRaf();
      
      // Lenis 클래스 제거
      document.documentElement.classList.remove('lenis-scrolling', 'lenis', 'lenis-smooth');
      document.body.classList.remove('lenis-scrolling', 'lenis', 'lenis-smooth');
      document.documentElement.classList.add('lenis-stopped');
      document.body.classList.add('lenis-stopped');
      
      // 스크롤 이벤트 차단
      this.preventScrollHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      };
      
      const events = ['wheel', 'touchmove', 'scroll'];
      events.forEach(eventType => {
        document.addEventListener(eventType, this.preventScrollHandler, { passive: false, capture: true });
        window.addEventListener(eventType, this.preventScrollHandler, { passive: false, capture: true });
      });
      
      // 스크롤 위치 강제 고정
      this.scrollLockInterval = setInterval(() => {
        const savedScrollY = document.body.getAttribute('data-scroll-y');
        if (savedScrollY) {
          const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
          if (Math.abs(currentScrollY - parseInt(savedScrollY)) > 1) {
            window.scrollTo(0, parseInt(savedScrollY));
          }
        }
      }, 16);
      
      document.body.setAttribute('data-scroll-lock-interval', this.scrollLockInterval);
    }

    /**
     * Lenis raf 오버라이드
     */
    overrideLenisRaf() {
      if (typeof Lenis !== 'undefined' && Lenis.prototype) {
        if (!Lenis.prototype._originalRaf) {
          Lenis.prototype._originalRaf = Lenis.prototype.raf;
        }
        Lenis.prototype.raf = (time) => {
          if (this.isOpen) {
            return false;
          }
          if (Lenis.prototype._originalRaf) {
            return Lenis.prototype._originalRaf.call(this, time);
          }
          return false;
        };
      }
      
      // 기존 lenis 인스턴스의 raf 메서드도 오버라이드
      const lenisInstances = [];
      if (window.lenis) lenisInstances.push(window.lenis);
      if (typeof lenis !== 'undefined' && lenis) lenisInstances.push(lenis);
      
      lenisInstances.forEach(instance => {
        if (instance && !instance._rafOverridden) {
          instance._originalRaf = instance.raf;
          instance.raf = (time) => {
            if (this.isOpen) {
              return false;
            }
            if (instance._originalRaf) {
              return instance._originalRaf.call(instance, time);
            }
            return false;
          };
          instance._rafOverridden = true;
        }
      });
    }

    /**
     * 스크롤 잠금 해제
     */
    unlockScroll() {
      // 스크롤 위치 고정 인터벌 제거
      if (this.scrollLockInterval) {
        clearInterval(this.scrollLockInterval);
        this.scrollLockInterval = null;
        document.body.removeAttribute('data-scroll-lock-interval');
      }
      
      // 이벤트 리스너 제거
      if (this.preventScrollHandler) {
        const events = ['wheel', 'touchmove', 'scroll'];
        events.forEach(eventType => {
          document.removeEventListener(eventType, this.preventScrollHandler, { capture: true });
          window.removeEventListener(eventType, this.preventScrollHandler, { capture: true });
        });
        this.preventScrollHandler = null;
      }
      
      // Lenis raf 오버라이드 복원
      this.restoreLenisRaf();
      
      // Lenis 클래스 제거
      document.documentElement.classList.remove('lenis-stopped');
      document.body.classList.remove('lenis-stopped');
      
      // 스타일 제거
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      
      // 스크롤 위치 복원
      const scrollY = document.body.getAttribute('data-scroll-y');
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY));
      }
      
      document.body.removeAttribute('data-scroll-y');
      
      // Lenis 재생성
      lenisManager.init();
    }

    /**
     * Lenis raf 복원
     */
    restoreLenisRaf() {
      if (typeof Lenis !== 'undefined' && Lenis.prototype && Lenis.prototype._originalRaf) {
        Lenis.prototype.raf = Lenis.prototype._originalRaf;
        delete Lenis.prototype._originalRaf;
      }
      
      const lenisInstances = [];
      if (window.lenis) lenisInstances.push(window.lenis);
      if (typeof lenis !== 'undefined' && lenis) lenisInstances.push(lenis);
      
      lenisInstances.forEach(instance => {
        if (instance && instance._rafOverridden && instance._originalRaf) {
          instance.raf = instance._originalRaf;
          delete instance._originalRaf;
          delete instance._rafOverridden;
        }
      });
    }

    /**
     * 사이트맵 토글
     */
    toggle() {
      const $sitemap = $('.sitemap');
      const $menuAll = $('.menu-all');
      const isOpen = $sitemap.hasClass('open');
      
      $menuAll.toggleClass('open');
      $sitemap.toggleClass('open');
      
      this.handleScroll(!isOpen);
    }
  }

  const sitemapManager = new SitemapManager();
  
  // 전역 함수로 노출 (하위 호환성)
  window.sitemap = () => {
    sitemapManager.toggle();
  };
  
  // 전역 노출
  window.SitemapManager = SitemapManager;
  window.sitemapManager = sitemapManager;

  // ============================================
  // Top Button Controller
  // ============================================
  class TopButtonController {
    constructor() {
      this.topButton = null;
      this.bottomSpace = 120;
      this.defaultBottom = '60px';
      this.showThreshold = 300; // 버튼을 표시할 스크롤 위치 (px)
    }

    /**
     * 초기화
     */
    init() {
      // 메인 페이지가 아닐 때만 동작
      const isMainPage = document.querySelector('.wrap.main') || document.querySelector('.main');
      if (isMainPage) {
        return;
      }

      this.topButton = document.querySelector('.btn-top');
      if (!this.topButton) {
        return;
      }

      // 인라인 onclick 제거
      this.topButton.removeAttribute('onclick');
      
      this.setupEventListeners();
      this.setupClickHandler();
      this.setupHeaderAnimation();
      this.updateButtonVisibility(); // 초기 상태 설정
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
      // 스크롤 이벤트 (throttle 적용)
      let ticking = false;
      const handleScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            this.adjustButtonPosition();
            this.updateButtonVisibility();
            ticking = false;
          });
          ticking = true;
        }
      };
      
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('load', () => {
        this.adjustButtonPosition();
        this.updateButtonVisibility();
      });
      
      // Lenis 스크롤 이벤트도 감지
      if (typeof window.lenis !== 'undefined' && window.lenis) {
        window.lenis.on('scroll', () => {
          this.adjustButtonPosition();
          this.updateButtonVisibility();
        });
      }
    }

    /**
     * 클릭 핸들러 설정
     */
    setupClickHandler() {
      if (!this.topButton) return;
      
      this.topButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.scrollToTop();
      });
    }

    /**
     * 상단으로 스크롤
     */
    scrollToTop() {
      // Lenis를 사용하는 경우
      if (typeof window.lenis !== 'undefined' && window.lenis) {
        window.lenis.scrollTo(0, {
          duration: 1.0,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
        return;
      }
      
      // GSAP ScrollToPlugin을 사용하는 경우
      if (typeof gsap !== 'undefined' && typeof ScrollToPlugin !== 'undefined') {
        gsap.to(window, {
          duration: 0.8,
          scrollTo: { y: 0 },
          ease: 'power2.out'
        });
        return;
      }
      
      // 기본 스무스 스크롤
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

    /**
     * 버튼 표시/숨김 업데이트
     */
    updateButtonVisibility() {
      if (!this.topButton) return;
      
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollY > this.showThreshold) {
        this.topButton.classList.remove('topbtn-off');
        this.topButton.classList.add('topbtn-on');
      } else {
        this.topButton.classList.remove('topbtn-on');
        this.topButton.classList.add('topbtn-off');
      }
    }

    /**
     * 탑 버튼 위치 조정
     */
    adjustButtonPosition() {
      if (!this.topButton) return;

      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollY + windowHeight >= documentHeight - this.bottomSpace) {
        this.topButton.style.bottom = `${this.bottomSpace + (scrollY + windowHeight - documentHeight)}px`;
      } else {
        this.topButton.style.bottom = this.defaultBottom;
      }
    }

    /**
     * 헤더 애니메이션 설정
     */
    setupHeaderAnimation() {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        return;
      }

      const header = document.querySelector('.header');
      if (!header) {
        return;
      }

      const showNav = gsap.from('.header', {
        yPercent: -200,
        paused: true,
        duration: 0.2
      }).progress(1);

      ScrollTrigger.create({
        start: 'top top',
        end: 99999,
        onUpdate: (self) => {
          self.direction === -1 ? showNav.play() : showNav.reverse();
        }
      });
    }
  }

  const topButtonController = new TopButtonController();
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      topButtonController.init();
    });
  } else {
    topButtonController.init();
  }
  
  // 전역 노출
  window.TopButtonController = TopButtonController;
  window.topButtonController = topButtonController;

  // ============================================
  // Header Menu Controller
  // ============================================
  class HeaderMenuController {
    constructor() {
      this.$menuAll = null;
      this.$menuUser = null;
      this.$menuList = null;
      this.$menuBox = null;
    }

    /**
     * 초기화
     */
    init() {
      if (typeof $ === 'undefined') {
        console.warn('[HeaderMenuController] jQuery is required');
        return;
      }

      this.$menuAll = $('.menu-all');
      this.$menuUser = $('.menu-user');
      this.$menuList = $('.menu-list');
      this.$menuBox = $('.menu-box');

      if (this.$menuAll.length === 0 && this.$menuUser.length === 0) {
        return;
      }

      this.setupSitemapToggle();
      this.setupUserMenu();
    }

    /**
     * 사이트맵 토글 설정
     */
    setupSitemapToggle() {
      if (this.$menuAll.length === 0) return;

      this.$menuAll.on('click', (e) => {
        e.preventDefault();
        if (typeof window.sitemap === 'function') {
          window.sitemap();
        }
      });
    }

    /**
     * 사용자 메뉴 설정
     */
    setupUserMenu() {
      if (this.$menuUser.length === 0 || this.$menuList.length === 0) return;

      // Hover 처리
      this.$menuBox.add(this.$menuList).hover(
        () => {
          this.$menuList.addClass('show');
        },
        (e) => {
          const relatedTarget = e.relatedTarget;
          if (!relatedTarget ||
              (!this.$menuBox.is(relatedTarget) && !this.$menuBox.find(relatedTarget).length &&
               !this.$menuList.is(relatedTarget) && !this.$menuList.find(relatedTarget).length)) {
            this.$menuList.removeClass('show');
          }
        }
      );

      // 클릭 처리
      this.$menuUser.on('click', (e) => {
        e.stopPropagation();
        this.$menuList.toggleClass('show');
      });

      // 키보드 접근성 지원
      this.$menuUser.on('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          this.$menuList.toggleClass('show');
        } else if (e.key === 'Escape') {
          this.$menuList.removeClass('show');
          $(e.target).focus();
        }
      });

      // 외부 클릭 시 메뉴 닫기
      $(document).on('click', (e) => {
        if (!this.$menuUser.is(e.target) && !this.$menuUser.find(e.target).length &&
            !this.$menuList.is(e.target) && !this.$menuList.find(e.target).length) {
          this.$menuList.removeClass('show');
        }
      });
    }
  }

  const headerMenuController = new HeaderMenuController();
  
  if (typeof $ !== 'undefined') {
    $(() => {
      headerMenuController.init();
    });
  }
  
  // 전역 노출
  window.HeaderMenuController = HeaderMenuController;
  window.headerMenuController = headerMenuController;

  // ============================================
  // Footer Controller
  // ============================================
  class FooterController {
    constructor() {
      this.$btnFamily = null;
      this.$familyList = null;
    }

    /**
     * 초기화
     */
    init() {
      if (typeof $ === 'undefined') {
        console.warn('[FooterController] jQuery is required');
        return;
      }

      this.$btnFamily = $('.btn-family');
      this.$familyList = $('.family-list');

      if (this.$btnFamily.length === 0) {
        return;
      }

      this.setupFamilyToggle();
    }

    /**
     * 패밀리 사이트 토글 설정
     */
    setupFamilyToggle() {
      this.$btnFamily.on('click', (e) => {
        e.preventDefault();
        this.$familyList.toggleClass('open');
        this.$btnFamily.toggleClass('open');
      });
    }
  }

  const footerController = new FooterController();
  
  if (typeof $ !== 'undefined') {
    $(() => {
      footerController.init();
    });
  }
  
  // 전역 노출
  window.FooterController = FooterController;
  window.footerController = footerController;

  // ============================================
  // AOS & Lenis Initializer (index.html 제외)
  // ============================================
  class AOSLenisInitializer {
    /**
     * 초기화
     * index.html이 아닐 때만 실행
     */
    init() {
      // index.html 체크: .wrap.main 클래스가 있으면 index.html
      const isIndexPage = document.querySelector('.wrap.main');
      if (isIndexPage) {
        return;
      }

      // AOS 초기화
      if (typeof AOS !== 'undefined') {
        AOS.init();
      }

      // Lenis 초기화 (LenisManager가 있으면 사용, 없으면 직접 초기화)
      if (typeof window.handleStartLenis === 'function') {
        window.handleStartLenis();
      } else if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
          lerp: 0.1,
          smoothWheel: true,
          smoothTouch: false,
        });
        
        window.lenis = lenis;
        
        lenis.on('scroll', (e) => {
          // console.log(e)
        });
        
        if (typeof ScrollTrigger !== 'undefined') {
          lenis.on('scroll', ScrollTrigger.update);
        }
        
        if (typeof gsap !== 'undefined' && gsap.ticker) {
          gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
          });
          gsap.ticker.lagSmoothing(0);
        }
      }
    }
  }

  const aosLenisInitializer = new AOSLenisInitializer();
  
  // DOMContentLoaded 또는 load 이벤트에서 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      aosLenisInitializer.init();
    });
  } else {
    // 이미 로드된 경우 즉시 실행
    aosLenisInitializer.init();
  }
  
  // 전역 노출
  window.AOSLenisInitializer = AOSLenisInitializer;
  window.aosLenisInitializer = aosLenisInitializer;

})(); // IIFE 종료
