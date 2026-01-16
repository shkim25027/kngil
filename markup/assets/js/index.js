/**
 * Main Page Video Player & Navigation Controller
 * 모듈화된 구조로 리팩토링
 */
(function() {
  'use strict';

  // ============================================
  // Configuration
  // ============================================
  const CONFIG = {
    TOTAL_PAGES: 5,
    INTRO_DELAY: 2800,
    VISITED_STORAGE_KEY: 'visited',
    VIDEO_BASE_PATH: './assets/video',
    PAGE_LINKS: {
      1: './value.html',
      2: './provided.html',
      3: './primary.html',
      4: './analysis.html',
      5: './results.html'
    },
    SELECTORS: {
      video: '#video_play',
      videoLink: '#main_video_link',
      pagination: '.main-pagination',
      paginationItem: '.main-pagination div',
      intro: '.intro-wrap',
      mainMask: '.main-mask',
      footer: 'footer',
      footerClose: '.footer-close',
      main: '.main'
    },
    CLASSES: {
      pageOn: 'page-on',
      footerOn: 'on',
      footerOff: ' ',
      skip: 'skip'
    }
  };

  // ============================================
  // Utility Functions
  // ============================================
  const Utils = {
    /**
     * DOM 요소 선택 (jQuery 대체)
     */
    $(selector) {
      return document.querySelector(selector);
    },

    /**
     * DOM 요소들 선택 (jQuery 대체)
     */
    $$(selector) {
      return document.querySelectorAll(selector);
    },

    /**
     * 숫자 유효성 검사
     */
    isValidPageNum(pageNum) {
      return Number.isInteger(pageNum) && 
             pageNum >= 1 && 
             pageNum <= CONFIG.TOTAL_PAGES;
    },

    /**
     * 안전한 이벤트 리스너 추가
     */
    safeAddEventListener(element, event, handler) {
      if (element && typeof handler === 'function') {
        element.addEventListener(event, handler);
        return true;
      }
      return false;
    },

    /**
     * 클래스 토글 헬퍼
     */
    toggleClass(element, className, force) {
      if (!element) return;
      if (force === undefined) {
        element.classList.toggle(className);
      } else {
        element.classList.toggle(className, force);
      }
    }
  };

  // ============================================
  // Video Player Module
  // ============================================
  const VideoPlayer = {
    currentPage: 1,
    videoElement: null,
    sourceElement: null,

    init() {
      this.videoElement = Utils.$(CONFIG.SELECTORS.video);
      
      if (!this.videoElement) {
        console.warn('[VideoPlayer] Video element not found');
        return false;
      }

      this.sourceElement = this.videoElement.querySelector('source');
      if (!this.sourceElement) {
        console.warn('[VideoPlayer] Source element not found');
        return false;
      }

      this.setupEventListeners();
      return true;
    },

    setupEventListeners() {
      // 영상 종료 후 다음 영상 실행
      Utils.safeAddEventListener(this.videoElement, 'ended', () => {
        this.playNext();
      });
    },

    loadVideo(pageNum) {
      if (!Utils.isValidPageNum(pageNum)) {
        console.warn(`[VideoPlayer] Invalid page number: ${pageNum}`);
        return false;
      }

      const videoSource = `${CONFIG.VIDEO_BASE_PATH}/main_${pageNum}.mp4`;
      
      try {
        this.sourceElement.src = videoSource;
        this.videoElement.load();
        return true;
      } catch (error) {
        console.error('[VideoPlayer] Failed to load video:', error);
        return false;
      }
    },

    play() {
      if (!this.videoElement) return false;

      return this.videoElement.play()
        .then(() => true)
        .catch(err => {
          console.warn('[VideoPlayer] Play failed:', err);
          return false;
        });
    },

    pause() {
      if (this.videoElement) {
        this.videoElement.pause();
      }
    },

    playNext() {
      this.currentPage = this.currentPage < CONFIG.TOTAL_PAGES 
        ? this.currentPage + 1 
        : 1;
      
      if (this.loadVideo(this.currentPage)) {
        Pagination.updateState(this.currentPage);
        this.play();
      }
    }
  };

  // ============================================
  // Pagination Module
  // ============================================
  const Pagination = {
    paginationElement: null,
    items: null,

    init() {
      this.paginationElement = Utils.$(CONFIG.SELECTORS.pagination);
      
      if (!this.paginationElement) {
        console.warn('[Pagination] Pagination element not found');
        return;
      }

      this.items = Utils.$$(CONFIG.SELECTORS.paginationItem);
      this.setupClickHandlers();
    },

    setupClickHandlers() {
      // 이벤트 위임 사용
      Utils.safeAddEventListener(
        this.paginationElement, 
        'click', 
        this.handleClick.bind(this)
      );
    },

    handleClick(e) {
      // 클릭된 요소 또는 그 부모 요소에서 data-page 속성을 찾음
      let target = e.target.closest('[data-page]');
      
      // 만약 li 요소를 직접 클릭한 경우, 그 안의 div를 찾음
      if (!target) {
        const liElement = e.target.closest('li');
        if (liElement) {
          target = liElement.querySelector('[data-page]');
        }
      }
      
      if (!target) return;

      e.preventDefault();
      e.stopPropagation();
      
      const pageNum = parseInt(target.getAttribute('data-page'), 10);
      if (Utils.isValidPageNum(pageNum)) {
        this.handlePageClick(pageNum);
      }
    },

    handlePageClick(pageNum) {
      VideoPlayer.currentPage = pageNum;
      
      if (VideoPlayer.loadVideo(pageNum)) {
        VideoPlayer.play();
        this.updateState(pageNum);
        this.updateLink(pageNum);
      }
    },

    updateState(pageNum) {
      if (!this.items || !Utils.isValidPageNum(pageNum)) return;

      // 모든 아이템에서 활성 클래스 제거
      this.items.forEach(item => {
        item.classList.remove(CONFIG.CLASSES.pageOn);
      });

      // 해당 페이지 아이템에 활성 클래스 추가
      const targetItem = Array.from(this.items).find(item => 
        item.classList.contains(`page-0${pageNum}`)
      );
      
      if (targetItem) {
        targetItem.classList.add(CONFIG.CLASSES.pageOn);
      }
    },

    updateLink(pageNum) {
      if (!Utils.isValidPageNum(pageNum)) return;

      const linkUrl = CONFIG.PAGE_LINKS[pageNum];
      const linkElement = Utils.$(CONFIG.SELECTORS.videoLink);
      
      if (linkElement && linkUrl) {
        linkElement.href = linkUrl;
      }
    },

    show() {
      if (this.paginationElement) {
        this.paginationElement.style.display = '';
      }
    },

    hide() {
      if (this.paginationElement) {
        this.paginationElement.style.display = 'none';
      }
    }
  };

  // ============================================
  // Intro Controller Module
  // ============================================
  const IntroController = {
    init() {
      const visited = sessionStorage.getItem(CONFIG.VISITED_STORAGE_KEY);
      const intro = Utils.$(CONFIG.SELECTORS.intro);
      const mainMask = Utils.$(CONFIG.SELECTORS.mainMask);

      if (visited) {
        this.hideIntro(intro, mainMask);
      } else {
        // 첫 방문 시 세션 스토리지에 저장
        setTimeout(() => {
          try {
            sessionStorage.setItem(CONFIG.VISITED_STORAGE_KEY, 'true');
          } catch (error) {
            console.warn('[IntroController] Failed to set sessionStorage:', error);
          }
        }, 1000);
      }
    },

    hideIntro(intro, mainMask) {
      if (intro) {
        intro.style.display = 'none';
      }
      if (mainMask) {
        mainMask.classList.add(CONFIG.CLASSES.skip);
      }
    }
  };

  // ============================================
  // Cursor Text Controller Module
  // ============================================
  const CursorTextController = {
    cursorTextElement: null,

    init() {
      // 메인 페이지인지 확인 (.wrap.main 클래스 존재 여부)
      const mainElement = Utils.$(CONFIG.SELECTORS.main);
      if (!mainElement) {
        return;
      }

      // 커서 따라다니는 텍스트 요소 생성
      this.cursorTextElement = document.createElement('div');
      this.cursorTextElement.textContent = 'Click!';
      this.cursorTextElement.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        font-size: 20px;
        color: #fff;
        font-weight: 500;
        white-space: nowrap;
        transform: translate(-0%, -50%);
        transition: opacity 0.3s;
        opacity: 0;
      `;
      document.body.appendChild(this.cursorTextElement);

      this.setupEventListeners();
    },

    setupEventListeners() {
      // 마우스 움직임 추적
      document.addEventListener('mousemove', (e) => {
        this.handleMouseMove(e);
      });

      // 마우스가 페이지를 벗어나면 숨김
      document.addEventListener('mouseleave', () => {
        if (this.cursorTextElement) {
          this.cursorTextElement.style.opacity = '0';
        }
      });

      document.addEventListener('mouseenter', () => {
        if (this.cursorTextElement) {
          this.cursorTextElement.style.opacity = '1';
        }
      });
    },

    handleMouseMove(e) {
      if (!this.cursorTextElement) return;

      // 마우스 위치의 요소 확인
      const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY);
      
      // 특정 영역인지 확인
      const isInFooter = elementUnderMouse?.closest('footer');
      const isInPopup = elementUnderMouse?.closest('.popup_wrap') || elementUnderMouse?.closest('.popup-wrap');
      const isInFloating = elementUnderMouse?.closest('.floating_menu');
      const isInPagination = elementUnderMouse?.closest('.main-pagination');
      const isInHeader = elementUnderMouse?.closest('.header');
      const isInSitemap = elementUnderMouse?.closest('.popup_sitemap') || elementUnderMouse?.closest('.sitemap');

      // 특정 영역이면 숨김
      if (isInFooter || isInPopup || isInFloating || isInPagination || isInHeader || isInSitemap) {
        this.cursorTextElement.style.opacity = '0';
      } else {
        this.cursorTextElement.style.opacity = '1';
        // 커서 오른쪽 아래에 위치
        this.cursorTextElement.style.left = (e.clientX + 15) + 'px';
        this.cursorTextElement.style.top = (e.clientY + 15) + 'px';
      }
    }
  };

  // ============================================
  // Footer Controller Module
  // ============================================
  const FooterController = {
    footerElement: null,
    mainElement: null,
    footerCloseElement: null,

    init() {
      this.footerElement = Utils.$(CONFIG.SELECTORS.footer);
      this.mainElement = Utils.$(CONFIG.SELECTORS.main);
      this.footerCloseElement = Utils.$(CONFIG.SELECTORS.footerClose);

      if (!this.footerElement || !this.mainElement) {
        console.warn('[FooterController] Required elements not found');
        return;
      }

      this.setupMousewheelHandler();
      this.setupCloseHandler();
    },

    setupMousewheelHandler() {
      // jQuery mousewheel 이벤트 대신 wheel 이벤트 사용
      Utils.safeAddEventListener(
        this.mainElement,
        'wheel',
        this.handleWheel.bind(this),
        { passive: true }
      );
    },

    handleWheel(e) {
      // deltaY가 양수면 아래로 스크롤 (footer 표시 - on 클래스 추가)
      // deltaY가 음수면 위로 스크롤 (footer 숨김 - on 클래스 제거)
      if (e.deltaY > 0) {
        this.show();
      } else if (e.deltaY < 0) {
        this.hide();
      }
    },

    setupCloseHandler() {
      if (this.footerCloseElement) {
        Utils.safeAddEventListener(
          this.footerCloseElement,
          'click',
          () => this.hide()
        );
      }
    },

    show() {
      if (!this.footerElement) return;
      
      this.footerElement.classList.add(CONFIG.CLASSES.footerOn);
      
      // footerOff가 유효한 클래스 이름인 경우에만 제거
      const footerOff = CONFIG.CLASSES.footerOff.trim();
      if (footerOff) {
        this.footerElement.classList.remove(footerOff);
      }
    },

    hide() {
      if (!this.footerElement) return;
      
      // footerOff가 유효한 클래스 이름인 경우에만 추가
      const footerOff = CONFIG.CLASSES.footerOff.trim();
      if (footerOff) {
        this.footerElement.classList.add(footerOff);
      }
      
      this.footerElement.classList.remove(CONFIG.CLASSES.footerOn);
    }
  };

  // ============================================
  // Main Initialization
  // ============================================
  const MainController = {
    init() {
      // DOM이 준비되면 초기화
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.start();
        });
      } else {
        this.start();
      }
    },

    start() {
      // Video Player 초기화
      if (!VideoPlayer.init()) {
        console.warn('[MainController] Video player initialization failed');
        return;
      }

      // 초기 비디오 일시정지 및 페이지네이션 숨김
      VideoPlayer.pause();
      Pagination.hide();

      // 방문 여부 확인 및 비디오 재생
      const visited = sessionStorage.getItem(CONFIG.VISITED_STORAGE_KEY);
      
      if (visited) {
        this.startVideoPlayback();
      } else {
        setTimeout(() => {
          this.startVideoPlayback();
        }, CONFIG.INTRO_DELAY);
      }

      // 모듈 초기화
      Pagination.init();
      IntroController.init();
      FooterController.init();
      CursorTextController.init();

      // 초기 링크 설정
      Pagination.updateLink(VideoPlayer.currentPage);
    },

    startVideoPlayback() {
      VideoPlayer.play();
      Pagination.show();
    }
  };

  // ============================================
  // Start Application
  // ============================================
  MainController.init();

})();
