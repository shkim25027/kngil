/**
 * Popup Controller Module
 * 팝업 관련 기능을 관리하는 모듈
 */
(function() {
  'use strict';

  // ============================================
  // Configuration
  // ============================================
  const CONFIG = {
    SELECTORS: {
      btnClose: '.btn-close',
      btnMapClose: '.btn-map-close',
      popupWrap: '.popup-wrap',
      popupSitemap: '.popup-sitemap',
      domainList: '#domain-list',
      customDomain: '#custom-domain',
      certNumber: '.cert-number',
      code: '.code',
      check: '.check',
      checkComplete: '.check.complete',
      timer: '.timer',
      findEmail: '.find-email',
      findPh: '.find-ph',
      btnId: '.btn-id',
      btnPw: '.btn-pw',
      contentId: '.content.id',
      contentPw: '.content.pw',
      termsWrap: '.terms-wrap',
      checkboxWrap: '.checkbox-wrap.all',
      joinBtnWrap: '.join-btn-wrap',
      popInputWrap: '.pop-input-wrap',
      joinProgress: '.join-progress',
      joinStep: '.join-step',
      tabPrivacy: '.tab-privacy',
      tabAgreement: '.tab-agreement',
      tabContentPri: '.tab-content.pri',
      tabContentAgr: '.tab-content.agr',
      tabWrap: '.tab-menu',
      contentsWrap: '.contents_wrap',
      messages: '.messages'
    },
    TIMER: {
      DURATION: 60 * 3, // 3분
      INTERVAL: 1000 // 1초
    },
    CLASSES: {
      on: 'on',
      none: 'none',
      show: 'show',
      hide: 'hide',
      complete: 'complete'
    }
  };

  // ============================================
  // Utility Functions
  // ============================================
  const Utils = {
    /**
     * Lenis 스크롤 시작
     */
    startLenis() {
      if (typeof lenis !== 'undefined' && lenis) {
        lenis.start();
      }
    },

    /**
     * 스크롤 복원 (사이트맵과 동일한 스크롤 잠금 해제 적용)
     */
    restoreScroll() {
      if (window.sitemapManager && typeof window.sitemapManager.unlockScroll === 'function') {
        window.sitemapManager.unlockScroll();
      } else {
        $('body').css('overflow', '');
        this.startLenis();
      }
    }
  };

  // ============================================
  // Popup Close Controller
  // ============================================
  const PopupCloseController = {
    init() {
      // 팝업 닫기 버튼
      $(document).on('click', CONFIG.SELECTORS.btnClose, () => {
        $(CONFIG.SELECTORS.popupWrap).hide();
        Utils.restoreScroll();
      });

      // 사이트맵 닫기 버튼
      $(document).on('click', CONFIG.SELECTORS.btnMapClose, () => {
        $(CONFIG.SELECTORS.popupSitemap).hide();
        Utils.restoreScroll();
      });
    }
  };

  // ============================================
  // Email Domain Controller
  // ============================================
  const EmailDomainController = {
    init() {
      // ID 기반 선택자 (기존 호환성)
      $(document).on('change', CONFIG.SELECTORS.domainList, function() {
        const $select = $(this);
        const $selectBox = $select.closest('.select-box');
        const $customDomain = $selectBox.find(CONFIG.SELECTORS.customDomain);
        
        if ($select.val() === 'type') {
          // 직접입력 선택 시 d-none 클래스 제거
          $customDomain.removeClass('d-none').focus();
        } else {
          // 다른 선택지 선택 시 d-none 클래스 추가 및 값 초기화
          $customDomain.addClass('d-none').val('');
        }
      });
      
      // 클래스 기반 선택자 (.domain-list)
      $(document).on('change', '.domain-list', function() {
        const $select = $(this);
        const $inputBox = $select.closest('.input-box');
        const $customDomain = $inputBox.find('.domain-domain');
        
        if ($select.val() === 'type') {
          // 직접입력 선택 시 d-none 클래스 제거
          $customDomain.removeClass('d-none').focus();
        } else {
          // 다른 선택지 선택 시 d-none 클래스 추가 및 값 초기화
          $customDomain.addClass('d-none').val('');
        }
      });
    }
  };

  // ============================================
  // Timer Controller
  // ============================================
  const TimerController = {
    interval: null,
    display: null,

    init() {
      this.display = $(CONFIG.SELECTORS.timer);
      
      // 인증번호 버튼 클릭 시
      $(document).on('click', CONFIG.SELECTORS.certNumber, () => {
        $(CONFIG.SELECTORS.code).show();
        this.start();
      });

      // 확인 버튼 클릭 시
      $(document).on('click', CONFIG.SELECTORS.check, function() {
        $(this).hide();
        $(CONFIG.SELECTORS.checkComplete).show();
        TimerController.stop();
        $(CONFIG.SELECTORS.timer).remove();
      });

      // 로그인 페이지 휴대폰 인증 폼의 인증 링크 요청 버튼 클릭 시
      $(document).on('submit', '#pop_login .tab-content.phone form', (e) => {
        e.preventDefault();
        const $form = $(e.target);
        const $timer = $form.find('.timer');
        const $infoBox = $form.find('.info-box');
        
        // 타이머와 info-box 표시
        $timer.removeClass('hide');
        $infoBox.removeClass('d-none');
        
        // 타이머 시작 (해당 폼 내의 타이머만)
        if ($timer.length) {
          this.stop();
          this.display = $timer;
          this.start();
        }
      });

      // 초기 타이머 시작 (다른 페이지에서 사용하는 경우를 위해)
      // 숨겨지지 않은 타이머만 자동 시작
      const $visibleTimers = $(CONFIG.SELECTORS.timer).not('.hide').not('.d-none');
      if ($visibleTimers.length > 0) {
        this.display = $visibleTimers.first();
        this.start();
      }
    },

    start() {
      this.stop();
      this.startTimer(CONFIG.TIMER.DURATION, this.display);
    },

    stop() {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    },

    startTimer(duration, display) {
      let timer = duration;

      const updateTimer = () => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

        if (display && display.length) {
          display.text(`${formattedMinutes}:${formattedSeconds}`);
        }

        if (--timer < 0) {
          this.stop();
          if (display && display.length) {
            display.text('00:00');
          }
        }
      };

      updateTimer();
      this.interval = setInterval(updateTimer, CONFIG.TIMER.INTERVAL);
    }
  };

  // ============================================
  // Find Account Controller
  // ============================================
  const FindAccountController = {
    /**
     * 라디오 버튼 전환 처리
     * @param {jQuery} $radio - 클릭된 라디오 버튼
     * @param {string} type - 'ph' 또는 'email'
     */
    switchRadio($radio, type) {
      const $radioWrap = $radio.closest('.radio-wrap');
      const $tabContent = $radioWrap.closest('.tab-content');
      
      // 같은 라디오 그룹의 다른 라디오 버튼들
      const $otherRadio = type === 'ph' 
        ? $radioWrap.find(CONFIG.SELECTORS.findEmail)
        : $radioWrap.find(CONFIG.SELECTORS.findPh);
      
      // 라디오 버튼 상태 변경
      $otherRadio.removeClass(CONFIG.CLASSES.on).prop('checked', false);
      $radio.addClass(CONFIG.CLASSES.on).prop('checked', true);
      
      // 테이블 표시/숨김 (해당 탭 콘텐츠 내에서만)
      if (type === 'ph') {
        $tabContent.find('table.email').hide();
        $tabContent.find('table.ph').show();
      } else {
        $tabContent.find('table.ph').hide();
        $tabContent.find('table.email').show();
      }
    },

    /**
     * 초기 상태 설정
     */
    initRadioState() {
      // 각 탭 콘텐츠별로 초기 상태 설정
      $('.tab-content').each(function() {
        const $tabContent = $(this);
        const $checkedRadio = $tabContent.find('.radio-wrap input[type="radio"]:checked');
        
        if ($checkedRadio.length) {
          if ($checkedRadio.hasClass('find-ph')) {
            $tabContent.find('table.ph').show();
            $tabContent.find('table.email').hide();
          } else if ($checkedRadio.hasClass('find-email')) {
            $tabContent.find('table.email').show();
            $tabContent.find('table.ph').hide();
          }
        }
      });
    },

    init() {
      // 이메일 찾기 라디오 버튼 클릭
      $(document).on('click', CONFIG.SELECTORS.findEmail, function(e) {
        e.preventDefault();
        FindAccountController.switchRadio($(this), 'email');
      });

      // 전화번호 찾기 라디오 버튼 클릭
      $(document).on('click', CONFIG.SELECTORS.findPh, function(e) {
        e.preventDefault();
        FindAccountController.switchRadio($(this), 'ph');
      });

      // 라디오 버튼 변경 이벤트 (체크 상태 동기화)
      $(document).on('change', '.radio-wrap input[type="radio"]', function() {
        const $radio = $(this);
        if ($radio.hasClass('find-ph')) {
          FindAccountController.switchRadio($radio, 'ph');
        } else if ($radio.hasClass('find-email')) {
          FindAccountController.switchRadio($radio, 'email');
        }
      });

      // 초기 상태 설정
      this.initRadioState();
    }
  };

  // ============================================
  // Login Tab Controller
  // ============================================
  const LoginTabController = {
    init() {
      // ID 찾기 탭
      $(document).on('click', CONFIG.SELECTORS.btnId, () => {
        $(CONFIG.SELECTORS.btnId).addClass(CONFIG.CLASSES.on);
        $(CONFIG.SELECTORS.btnPw).removeClass(CONFIG.CLASSES.on);
        $(CONFIG.SELECTORS.contentId).show();
        $(CONFIG.SELECTORS.contentPw).hide();
      });

      // 비밀번호 찾기 탭
      $(document).on('click', CONFIG.SELECTORS.btnPw, () => {
        $(CONFIG.SELECTORS.btnPw).addClass(CONFIG.CLASSES.on);
        $(CONFIG.SELECTORS.btnId).removeClass(CONFIG.CLASSES.on);
        $(CONFIG.SELECTORS.contentPw).show();
        $(CONFIG.SELECTORS.contentId).hide();
      });

      // 도메인 선택 (중복 제거)
      $(CONFIG.SELECTORS.domainList).on('change', function() {
        const $customDomain = $(CONFIG.SELECTORS.customDomain);
        
        if ($(this).val() === 'type') {
          $customDomain.show();
        } else {
          $customDomain.hide();
        }
      });
    }
  };

  // ============================================
  // Terms Agreement Controller
  // ============================================
  const TermsAgreementController = {
    init() {
      // 약관 동의 상태 업데이트
      this.updateJoinButton();

      // 전체 동의 체크박스 (기존 호환성)
      $(CONFIG.SELECTORS.checkboxWrap).find('input[type="checkbox"]').on('change', (e) => {
        const isChecked = $(e.target).is(':checked');
        $(CONFIG.SELECTORS.termsWrap).find('input[type="checkbox"]').prop('checked', isChecked);
        this.updateJoinButton();
      });

      // .chk-all 클래스를 가진 체크박스 (전체 동의)
      $(document).on('change click', '.chk-all', function(e) {
        e.stopPropagation(); // 이벤트 전파 중지
        const $chkAll = $(this);
        const isChecked = $chkAll.is(':checked');
        const $termsWrap = $chkAll.closest('.terms-wrap');
        
        // .chk-all을 제외한 모든 체크박스 선택/해제
        $termsWrap.find('input[type="checkbox"]:not(.chk-all)').prop('checked', isChecked);
        
        // updateJoinButton 호출 시 무한 루프 방지를 위해 플래그 설정
        TermsAgreementController._updatingFromChkAll = true;
        TermsAgreementController.updateJoinButton();
        TermsAgreementController._updatingFromChkAll = false;
      });

      // 개별 체크박스
      $(CONFIG.SELECTORS.termsWrap).find('input[type="checkbox"]').on('change', () => {
        this.updateJoinButton();
      });

      // .terms-wrap 내의 개별 체크박스 (chk-all 제외)
      $(document).on('change', '.terms-wrap input[type="checkbox"]:not(.chk-all)', () => {
        this.updateJoinButton();
      });
    },

    updateJoinButton() {
      // .terms-wrap 내의 모든 체크박스 확인 (chk-all 제외)
      const $allTermsWraps = $('.terms-wrap');
      let allChecked = true;

      $allTermsWraps.each(function() {
        const $checkboxes = $(this).find('input[type="checkbox"]:not(.chk-all)');
        const $checked = $checkboxes.filter(':checked');
        if ($checkboxes.length > 0 && $checkboxes.length !== $checked.length) {
          allChecked = false;
          return false; // break
        }
      });

      // .chk-all 체크박스 상태 업데이트 (무한 루프 방지)
      if (!TermsAgreementController._updatingFromChkAll) {
        $('.chk-all').prop('checked', allChecked);
      }

      // 전체 동의 체크박스 상태 업데이트 (기존 호환성)
      $(CONFIG.SELECTORS.checkboxWrap).find('input[type="checkbox"]').prop('checked', allChecked);

      // 버튼 상태 업데이트
      const $joinBtnWrap = $(CONFIG.SELECTORS.joinBtnWrap);
      if (allChecked) {
        $joinBtnWrap.removeClass(CONFIG.CLASSES.none);
        $joinBtnWrap.find('button').prop('disabled', false);
      } else {
        $joinBtnWrap.addClass(CONFIG.CLASSES.none);
        $joinBtnWrap.find('button').prop('disabled', true);
      }
    }
  };

  // ============================================
  // Join Completion Controller
  // ============================================
  const JoinCompletionController = {
    init() {
      // 전송완료
      $(document).on('click', '.pw ' + CONFIG.SELECTORS.joinBtnWrap + ' button', () => {
        $(CONFIG.SELECTORS.contentsWrap).children().not(CONFIG.SELECTORS.messages).hide();
        $(CONFIG.SELECTORS.messages).show();
      });

      // 가입완료
      $(document).on('click', '.join.completion ' + CONFIG.SELECTORS.joinBtnWrap + ' button', () => {
        $(CONFIG.SELECTORS.popInputWrap).find('form').children().not(CONFIG.SELECTORS.messages).hide();
        $(CONFIG.SELECTORS.messages).show();

        // 진행 단계 업데이트
        $(CONFIG.SELECTORS.joinProgress).find(CONFIG.SELECTORS.joinStep).removeClass(CONFIG.CLASSES.on);
        $(CONFIG.SELECTORS.joinProgress).find(CONFIG.SELECTORS.joinStep).eq(2).addClass(CONFIG.CLASSES.on);
      });
    }
  };

  // ============================================
  // Universal Tab Controller
  // ============================================
  const TabController = {
    /**
     * 탭 클래스명에서 콘텐츠 클래스명 추출
     * @param {jQuery} $tab - 탭 요소
     * @returns {string} 콘텐츠 클래스명
     */
    getContentClass($tab) {
      // 탭 클래스명에서 tab- 접두사 제거
      const tabClasses = $tab.attr('class').split(' ');
      let contentClass = '';
      
      for (let i = 0; i < tabClasses.length; i++) {
        const className = tabClasses[i];
        if (className.startsWith('tab-')) {
          const tabName = className.replace('tab-', '');
          
          // 특수 케이스 매핑
          const specialCases = {
            'privacy': 'pri',
            'agreement': 'agr'
          };
          
          contentClass = specialCases[tabName] || tabName;
          break;
        }
      }
      
      return contentClass;
    },

    /**
     * 슬라이딩 인디케이터 위치 업데이트 (round 타입 탭 메뉴용)
     * @param {jQuery} $tabMenu - 탭 메뉴 요소
     * @param {jQuery} $activeTab - 활성화된 탭 요소
     */
    updateSliderPosition($tabMenu, $activeTab) {
      // round 클래스가 있는 경우에만 처리
      if (!$tabMenu.hasClass('round')) {
        return;
      }
      
      const $tabs = $tabMenu.find('li');
      const activeIndex = $tabs.index($activeTab);
      const tabCount = $tabs.length;
      
      if (tabCount === 0) return;
      
      // 탭 메뉴의 실제 너비와 패딩 확인
      const tabMenuWidth = $tabMenu.width();
      const padding = 0; // padding: 4px
      const gap = 4; // gap: 4px
      
      // 사용 가능한 너비 (패딩 제외)
      const availableWidth = tabMenuWidth - (padding * 2);
      
      // 각 탭의 너비 계산 (gap 포함)
      // gap은 탭 사이에만 있으므로, 탭 개수 - 1개의 gap이 있음
      const totalGapWidth = gap * (tabCount - 1);
      const tabWidth = (availableWidth - totalGapWidth) / tabCount;
      
      // 인디케이터 위치 계산 (패딩 + 탭 너비 * 인덱스 + gap * 인덱스)
      const indicatorPosition = padding + (tabWidth + gap) * activeIndex;
      
      // CSS 변수로 위치 설정 (픽셀 단위)
      $tabMenu[0].style.setProperty('--tab-indicator-position', `${indicatorPosition}px`);
      
      // 인디케이터 너비도 동적으로 설정
      $tabMenu[0].style.setProperty('--tab-indicator-width', `${tabWidth}px`);
    },

    /**
     * 탭 전환 처리
     * @param {jQuery} $clickedTab - 클릭된 탭 요소
     */
    switchTab($clickedTab) {
      const $tabMenu = $clickedTab.closest(CONFIG.SELECTORS.tabWrap);
      const $allTabs = $tabMenu.find('li');
      
      // 콘텐츠 컨테이너 찾기 (pop-contents 또는 contents-wrap)
      const $contentContainer = $clickedTab.closest('.pop-contents, .contents-wrap');
      const $allContents = $contentContainer.find('.tab-content');
      
      // 모든 탭에서 on 클래스 제거
      $allTabs.removeClass(CONFIG.CLASSES.on);
      
      // 클릭된 탭에 on 클래스 추가
      $clickedTab.addClass(CONFIG.CLASSES.on);
      
      // 슬라이딩 인디케이터 위치 업데이트 (round 타입인 경우)
      this.updateSliderPosition($tabMenu, $clickedTab);
      
      // 모든 콘텐츠 숨기기
      $allContents.removeClass(CONFIG.CLASSES.show);
      
      // 해당하는 콘텐츠만 표시
      const contentClass = this.getContentClass($clickedTab);
      if (contentClass) {
        const $targetContent = $contentContainer.find('.tab-content.' + contentClass);
        if ($targetContent.length) {
          $targetContent.addClass(CONFIG.CLASSES.show);
        }
      }
    },

    /**
     * 탭 초기 상태 설정
     */
    initTabState() {
      // 모든 tab-menu 찾기
      $(CONFIG.SELECTORS.tabWrap).each(function() {
        const $tabMenu = $(this);
        const $tabs = $tabMenu.find('li');
        const $contentContainer = $tabMenu.closest('.pop-contents, .contents-wrap');
        
        if ($tabs.length === 0 || !$contentContainer.length) return;
        
        // 활성화된 탭 찾기
        const $activeTab = $tabs.filter('.' + CONFIG.CLASSES.on);
        
        if ($activeTab.length > 0) {
          // 활성화된 탭이 있으면 해당 콘텐츠 표시
          TabController.switchTab($activeTab);
        } else {
          // 활성화된 탭이 없으면 첫 번째 탭 활성화
          const $firstTab = $tabs.first();
          $firstTab.addClass(CONFIG.CLASSES.on);
          TabController.switchTab($firstTab);
        }
        
        // 리사이즈 시 인디케이터 위치 재계산
        if ($tabMenu.hasClass('round')) {
          $(window).on('resize.tabSlider', function() {
            const $active = $tabMenu.find('li.' + CONFIG.CLASSES.on);
            if ($active.length) {
              TabController.updateSliderPosition($tabMenu, $active);
            }
          });
        }
      });
    },

    init() {
      // 모든 tab-menu의 탭 클릭 이벤트
      $(document).on('click', CONFIG.SELECTORS.tabWrap + ' li', function(e) {
        e.preventDefault();
        TabController.switchTab($(this));
      });

      // 키보드 접근성 지원 (탭 + 엔터/스페이스)
      $(document).on('keydown', CONFIG.SELECTORS.tabWrap + ' li', function(e) {
        // Enter 또는 Space 키
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          TabController.switchTab($(this));
        }
        
        // 화살표 키로 탭 전환
        const $tabMenu = $(this).closest(CONFIG.SELECTORS.tabWrap);
        const $tabs = $tabMenu.find('li');
        const currentIndex = $tabs.index(this);
        
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          let targetIndex;
          
          if (e.key === 'ArrowLeft') {
            targetIndex = currentIndex > 0 ? currentIndex - 1 : $tabs.length - 1;
          } else {
            targetIndex = currentIndex < $tabs.length - 1 ? currentIndex + 1 : 0;
          }
          
          const $targetTab = $tabs.eq(targetIndex);
          $targetTab.focus();
          TabController.switchTab($targetTab);
        }
      });

      // 초기 상태 설정
      this.initTabState();
    }
  };

  // ============================================
  // Privacy Tab Controller (하위 호환성 유지)
  // ============================================
  const PrivacyTabController = {
    switchTab: function($clickedTab) {
      return TabController.switchTab.call(TabController, $clickedTab);
    },
    init: function() {
      return TabController.init.call(TabController);
    },
    initTabState: function() {
      return TabController.initTabState.call(TabController);
    }
  };

  // ============================================
  // Main Initialization
  // ============================================
  const PopupController = {
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
      PopupCloseController.init();
      EmailDomainController.init();
      TimerController.init();
      FindAccountController.init();
      LoginTabController.init();
      TermsAgreementController.init();
      JoinCompletionController.init();
      TabController.init();
    }
  };

  // ============================================
  // Start Application
  // ============================================
  PopupController.init();

  // ============================================
  // Global Functions
  // ============================================
  // 전역에서 접근 가능하도록 함수 노출
  window.PopupController = PopupController;
  window.TabController = TabController;
  window.PrivacyTabController = PrivacyTabController; // 하위 호환성 유지

})();
