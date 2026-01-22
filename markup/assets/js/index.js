/**
 * Main Page Video Player & Navigation Controller
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
    VIDEO_BASE_PATH: './video',
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
      paginationItem: '.main-pagination button[data-page]',
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
    $(selector) {
      return document.querySelector(selector);
    },

    $$(selector) {
      return document.querySelectorAll(selector);
    },

    isValidPageNum(pageNum) {
      return Number.isInteger(pageNum) && 
             pageNum >= 1 && 
             pageNum <= CONFIG.TOTAL_PAGES;
    },

    safeAddEventListener(element, event, handler) {
      if (element && typeof handler === 'function') {
        element.addEventListener(event, handler);
        return true;
      }
      return false;
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
      if (!this.videoElement) return false;

      this.sourceElement = this.videoElement.querySelector('source');
      if (!this.sourceElement) return false;

      this.setupEventListeners();
      return true;
    },

    setupEventListeners() {
      Utils.safeAddEventListener(this.videoElement, 'ended', () => {
        this.playNext();
      });

      Utils.safeAddEventListener(this.videoElement, 'loadeddata', () => {
        if (this.videoElement.paused) {
          this.play().catch(() => {});
        }
      });

      Utils.safeAddEventListener(this.videoElement, 'error', () => {
        console.error('[VideoPlayer] Video load error');
      });
    },

    loadVideo(pageNum) {
      if (!Utils.isValidPageNum(pageNum)) return false;

      const videoSource = `${CONFIG.VIDEO_BASE_PATH}/main_${pageNum}.mp4`;
      
      // 현재 소스와 동일하면 다시 로드하지 않음
      if (this.sourceElement.src && this.sourceElement.src.includes(`main_${pageNum}.mp4`)) {
        return true;
      }

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
        .catch(() => false);
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
        Pagination.updateLink(this.currentPage);
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
      if (!this.paginationElement) return;

      this.items = Utils.$$(CONFIG.SELECTORS.paginationItem);
      this.setupClickHandlers();
      this.show();
    },

    setupClickHandlers() {
      Utils.safeAddEventListener(
        this.paginationElement, 
        'click', 
        this.handleClick.bind(this)
      );
    },

    handleClick(e) {
      let target = e.target.closest('button[data-page]');
      
      if (!target) {
        const liElement = e.target.closest('li');
        if (liElement) {
          target = liElement.querySelector('button[data-page]');
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

      this.items.forEach(item => {
        item.classList.remove(CONFIG.CLASSES.pageOn);
        item.removeAttribute('aria-current');
      });

      const targetItem = Array.from(this.items).find(item => 
        item.classList.contains(`page-0${pageNum}`)
      );
      
      if (targetItem) {
        targetItem.classList.add(CONFIG.CLASSES.pageOn);
        targetItem.setAttribute('aria-current', 'page');
      }
    },

    updateLink(pageNum) {
      if (!Utils.isValidPageNum(pageNum)) return;

      const linkUrl = CONFIG.PAGE_LINKS[pageNum];
      const linkElement = Utils.$(CONFIG.SELECTORS.videoLink);
      
      if (!linkElement || !linkUrl) return;

      linkElement.href = linkUrl;
      linkElement.setAttribute('href', linkUrl);
    },

    show() {
      if (this.paginationElement) {
        this.paginationElement.style.display = 'block';
        this.paginationElement.style.visibility = 'visible';
        this.paginationElement.style.opacity = '1';
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
      if (intro) intro.style.display = 'none';
      if (mainMask) mainMask.classList.add(CONFIG.CLASSES.skip);
    }
  };

  // ============================================
  // Cursor Text Controller Module
  // ============================================
  const CursorTextController = {
    cursorTextElement: null,

    init() {
      const mainElement = Utils.$(CONFIG.SELECTORS.main);
      if (!mainElement) return;

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
      document.addEventListener('mousemove', (e) => {
        this.handleMouseMove(e);
      });

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

      const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY);
      const hideAreas = [
        elementUnderMouse?.closest('footer'),
        elementUnderMouse?.closest('.popup_wrap'),
        elementUnderMouse?.closest('.popup-wrap'),
        elementUnderMouse?.closest('.floating_menu'),
        elementUnderMouse?.closest('.main-pagination'),
        elementUnderMouse?.closest('.header'),
        elementUnderMouse?.closest('.popup_sitemap'),
        elementUnderMouse?.closest('.sitemap')
      ];

      if (hideAreas.some(area => area)) {
        this.cursorTextElement.style.opacity = '0';
      } else {
        this.cursorTextElement.style.opacity = '1';
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

      if (!this.footerElement || !this.mainElement) return;

      this.setupMousewheelHandler();
      this.setupCloseHandler();
    },

    setupMousewheelHandler() {
      Utils.safeAddEventListener(
        this.mainElement,
        'wheel',
        this.handleWheel.bind(this),
        { passive: true }
      );
    },

    handleWheel(e) {
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
      
      const footerOff = CONFIG.CLASSES.footerOff.trim();
      if (footerOff) {
        this.footerElement.classList.remove(footerOff);
      }
    },

    hide() {
      if (!this.footerElement) return;
      
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
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.start();
        });
      } else {
        this.start();
      }
    },

    start() {
      if (!VideoPlayer.init()) return;

      // 모듈 초기화
      Pagination.init();
      Pagination.updateLink(VideoPlayer.currentPage);
      Pagination.updateState(VideoPlayer.currentPage);
      IntroController.init();
      FooterController.init();
      CursorTextController.init();

      // 비디오 재생 시작
      this.startVideoPlayback();
    },

    startVideoPlayback() {
      const introElement = Utils.$(CONFIG.SELECTORS.intro);
      const hasIntro = introElement && introElement.offsetParent !== null;
      const visited = sessionStorage.getItem(CONFIG.VISITED_STORAGE_KEY);

      const playVideo = () => {
        if (!VideoPlayer.videoElement.paused) return;

        const currentSrc = VideoPlayer.videoElement.currentSrc || VideoPlayer.videoElement.src;
        if (!currentSrc || currentSrc === '') {
          VideoPlayer.loadVideo(1);
        }

        VideoPlayer.play().catch(() => {
          // 재생 실패 시 재시도
          let retryCount = 0;
          const maxRetries = 10;
          const retry = () => {
            if (retryCount >= maxRetries || !VideoPlayer.videoElement.paused) return;
            retryCount++;
            VideoPlayer.play().catch(() => {
              setTimeout(retry, 500);
            });
          };
          setTimeout(retry, 500);
        });
      };

      const tryAutoPlay = () => {
        if (VideoPlayer.videoElement.readyState >= 1) {
          playVideo();
        } else {
          VideoPlayer.videoElement.addEventListener('loadedmetadata', playVideo, { once: true });
        }
      };

      // Intro가 없으면 즉시 재생, 있으면 방문 여부에 따라 처리
      if (!hasIntro) {
        tryAutoPlay();
      } else if (visited) {
        tryAutoPlay();
      } else {
        setTimeout(tryAutoPlay, CONFIG.INTRO_DELAY);
      }
    }
  };

  // ============================================
  // Start Application
  // ============================================
  MainController.init();

})();
