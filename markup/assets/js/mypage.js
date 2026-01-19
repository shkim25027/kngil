/**
 * MyPage Module
 * 마이페이지 관련 공통 기능을 관리하는 모듈
 * - 타이머 관리
 * - 인증번호 발송 (AJAX 연동 준비)
 * - 팝업 상태 초기화
 */
(function() {
  'use strict';

  // ============================================
  // Configuration
  // ============================================
  const CONFIG = {
    SELECTORS: {
      timer: '.timer',
      btnCode: '.btn-code',
      btnClose: '.btn-close',
      popupWrap: '.popup-wrap',
      completeMsg: '.complete-msg',
      codeRow: 'tr.code, tr.d-none',
      infoBox: '.info-box'
    },
    TIMER: {
      DURATION: 60 * 3, // 3분 (180초)
      INTERVAL: 1000 // 1초
    },
    AJAX: {
      // AJAX 엔드포인트 설정 (나중에 실제 API로 변경)
      SEND_CODE: '/api/auth/send-code',
      VERIFY_CODE: '/api/auth/verify-code'
    }
  };

  // ============================================
  // Timer Manager
  // ============================================
  const TimerManager = {
    intervals: {}, // 팝업별 타이머 관리

    /**
     * 타이머 시작
     * @param {jQuery} $timer - 타이머 요소
     * @param {string} popupId - 팝업 ID (옵션)
     */
    start($timer, popupId) {
      if (!$timer || !$timer.length) return;

      const timerId = popupId || $timer.closest('.popup-wrap').attr('id') || 'default';
      
      // 기존 타이머 중지
      this.stop(timerId);

      let timer = CONFIG.TIMER.DURATION;
      const $display = $timer;

      const updateTimer = () => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

        if ($display && $display.length) {
          $display.text(`${formattedMinutes}:${formattedSeconds}`);
        }

        if (--timer < 0) {
          this.stop(timerId);
          if ($display && $display.length) {
            $display.text('00:00');
          }
          // 타이머 종료 콜백 호출
          if (this.onTimerEnd) {
            this.onTimerEnd(timerId, $display);
          }
        }
      };

      updateTimer();
      this.intervals[timerId] = setInterval(updateTimer, CONFIG.TIMER.INTERVAL);
    },

    /**
     * 타이머 중지
     * @param {string} timerId - 타이머 ID
     */
    stop(timerId) {
      if (timerId && this.intervals[timerId]) {
        clearInterval(this.intervals[timerId]);
        delete this.intervals[timerId];
      } else if (!timerId) {
        // 모든 타이머 중지
        Object.keys(this.intervals).forEach(id => {
          clearInterval(this.intervals[id]);
        });
        this.intervals = {};
      }
    },

    /**
     * 타이머 초기화
     * @param {jQuery} $timer - 타이머 요소
     */
    reset($timer) {
      if ($timer && $timer.length) {
        $timer.addClass('d-none');
        $timer.text('03:00');
      }
    }
  };

  // ============================================
  // Auth Code Manager (AJAX 연동 준비)
  // ============================================
  const AuthCodeManager = {
    /**
     * 인증번호 발송
     * @param {Object} options - 옵션 객체
     * @param {string} options.phone - 휴대폰 번호
     * @param {string} options.type - 인증 타입 ('join', 'login', 'mypage' 등)
     * @param {Function} options.onSuccess - 성공 콜백
     * @param {Function} options.onError - 실패 콜백
     */
    sendCode(options) {
      const {
        phone,
        type = 'default',
        onSuccess,
        onError
      } = options;

      // TODO: 실제 AJAX 요청으로 변경
      // 현재는 시뮬레이션
      const mockRequest = () => {
        // 실제 구현 시:
        /*
        $.ajax({
          url: CONFIG.AJAX.SEND_CODE,
          method: 'POST',
          data: {
            phone: phone,
            type: type
          },
          success: function(response) {
            if (response.success) {
              if (onSuccess) onSuccess(response);
            } else {
              if (onError) onError(response.message || '인증번호 발송에 실패했습니다.');
            }
          },
          error: function(xhr, status, error) {
            if (onError) onError('서버 오류가 발생했습니다.');
          }
        });
        */

        // 시뮬레이션: 성공으로 가정
        setTimeout(() => {
          if (onSuccess) {
            onSuccess({
              success: true,
              message: '인증번호가 발송되었습니다.'
            });
          }
        }, 500);
      };

      mockRequest();
    },

    /**
     * 인증번호 확인
     * @param {Object} options - 옵션 객체
     * @param {string} options.phone - 휴대폰 번호
     * @param {string} options.code - 인증번호
     * @param {Function} options.onSuccess - 성공 콜백
     * @param {Function} options.onError - 실패 콜백
     */
    verifyCode(options) {
      const {
        phone,
        code,
        onSuccess,
        onError
      } = options;

      // TODO: 실제 AJAX 요청으로 변경
      const mockRequest = () => {
        // 실제 구현 시:
        /*
        $.ajax({
          url: CONFIG.AJAX.VERIFY_CODE,
          method: 'POST',
          data: {
            phone: phone,
            code: code
          },
          success: function(response) {
            if (response.success) {
              if (onSuccess) onSuccess(response);
            } else {
              if (onError) onError(response.message || '인증번호가 일치하지 않습니다.');
            }
          },
          error: function(xhr, status, error) {
            if (onError) onError('서버 오류가 발생했습니다.');
          }
        });
        */

        // 시뮬레이션: 성공으로 가정
        setTimeout(() => {
          if (onSuccess) {
            onSuccess({
              success: true,
              message: '인증이 완료되었습니다.'
            });
          }
        }, 500);
      };

      mockRequest();
    }
  };

  // ============================================
  // Popup State Manager
  // ============================================
  const PopupStateManager = {
    /**
     * 팝업 상태 초기화
     * @param {string|jQuery} popupSelector - 팝업 선택자 또는 jQuery 객체
     */
    reset(popupSelector) {
      const $popup = typeof popupSelector === 'string' 
        ? $(popupSelector) 
        : popupSelector;

      if (!$popup || !$popup.length) return;

      const popupId = $popup.attr('id') || 'default';

      // 타이머 중지 및 초기화
      TimerManager.stop(popupId);
      $popup.find(CONFIG.SELECTORS.timer).each(function() {
        TimerManager.reset($(this));
      });

      // 버튼 초기화
      $popup.find(CONFIG.SELECTORS.btnCode).each(function() {
        const $btn = $(this);
        $btn.text('인증번호');
        $btn.removeClass('light');
      });

      // 인증번호 입력 행 숨기기
      $popup.find(CONFIG.SELECTORS.codeRow).each(function() {
        const $row = $(this);
        if ($row.hasClass('d-none')) {
          $row.hide();
        } else {
          $row.hide();
        }
      });

      // 완료 메시지 숨기기
      $popup.find(CONFIG.SELECTORS.completeMsg).closest('tr').hide();
    }
  };

  // ============================================
  // Auth Button Handler
  // ============================================
  const AuthButtonHandler = {
    /**
     * 인증번호 버튼 클릭 처리
     * @param {jQuery} $btn - 클릭된 버튼
     * @param {Object} options - 옵션 객체
     */
    handleClick($btn, options = {}) {
      const {
        onBeforeSend,
        onSuccess,
        onError
      } = options;

      const $inputBox = $btn.closest('.input-box');
      const $timer = $inputBox.find(CONFIG.SELECTORS.timer);
      const $popup = $btn.closest(CONFIG.SELECTORS.popupWrap);
      const popupId = $popup.attr('id');
      
      // 인증번호 입력 행 찾기 (다양한 케이스 대응)
      const $currentRow = $btn.closest('tr');
      // tr.code 또는 tr.d-none 중 하나를 찾음
      let $codeRow = $currentRow.next('tr.code');
      if (!$codeRow.length) {
        $codeRow = $currentRow.next('tr.d-none');
      }

      // 전화번호 가져오기
      const $phoneInput = $inputBox.find('input[type="tel"]');
      const phone = $phoneInput.val();

      // 전화번호 유효성 검사
      if (!phone || !phone.match(/[0-9]{3}-[0-9]{4}-[0-9]{4}/)) {
        alert('올바른 휴대폰 번호를 입력해주세요.');
        return;
      }

      // 발송 전 콜백
      if (onBeforeSend) {
        onBeforeSend(phone);
      }

      // 인증번호 발송
      AuthCodeManager.sendCode({
        phone: phone,
        type: popupId || 'default',
        onSuccess: (response) => {
          // 타이머 표시 및 시작
          if ($timer.length) {
            $timer.removeClass('d-none');
            TimerManager.start($timer, popupId);
          }

          // 인증번호 입력 행 표시
          if ($codeRow.length) {
            $codeRow.removeClass('d-none').show();
          }

          // 버튼 텍스트 변경 및 클래스 추가
          $btn.text('재요청').addClass('light');

          // 성공 콜백
          if (onSuccess) {
            onSuccess(response);
          }
        },
        onError: (error) => {
          alert(error || '인증번호 발송에 실패했습니다.');
          if (onError) {
            onError(error);
          }
        }
      });
    }
  };

  // ============================================
  // MyPage Controller
  // ============================================
  const MyPageController = {
    /**
     * 초기화
     */
    init() {
      this.initAuthButtons();
      this.initPopupClose();
      this.initFormSubmit();
      this.initMemberTypeToggle();
    },

    /**
     * 인증번호 버튼 이벤트 초기화
     */
    initAuthButtons() {
      // 회원가입 팝업
      $(document).on('click', '#pop_join .btn-code', (e) => {
        e.preventDefault();
        AuthButtonHandler.handleClick($(e.currentTarget), {
          onSuccess: (response) => {
            console.log('인증번호 발송 성공:', response);
          }
        });
      });

      // 내 정보 수정 팝업
      $(document).on('click', '#pop_mypage03 .btn-code', (e) => {
        e.preventDefault();
        AuthButtonHandler.handleClick($(e.currentTarget), {
          onSuccess: (response) => {
            console.log('인증번호 발송 성공:', response);
          }
        });
      });
    },

    /**
     * 팝업 닫기 이벤트 초기화
     */
    initPopupClose() {
      // 팝업 닫기 버튼 클릭
      $(document).on('click', '.popup-wrap .btn-close', function() {
        const $popup = $(this).closest(CONFIG.SELECTORS.popupWrap);
        PopupStateManager.reset($popup);
      });

      // 팝업이 숨겨질 때 초기화 (MutationObserver)
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            const $popup = $(mutation.target);
            if ($popup.hasClass('popup-wrap') && $popup.css('display') === 'none') {
              PopupStateManager.reset($popup);
            }
          }
        });
      });

      // 모든 팝업 관찰 시작
      $(document).ready(() => {
        $(CONFIG.SELECTORS.popupWrap).each(function() {
          observer.observe(this, {
            attributes: true,
            attributeFilter: ['style']
          });
        });
      });
    },

    /**
     * 폼 제출 이벤트 초기화
     */
    initFormSubmit() {
      // 로그인 팝업 - 휴대폰 인증 폼 제출
      $(document).on('submit', '#pop_login .tab-content.phone form', (e) => {
        e.preventDefault();
        
        const $form = $(e.currentTarget);
        const $timer = $form.find(CONFIG.SELECTORS.timer);
        const $infoBox = $form.find(CONFIG.SELECTORS.infoBox);
        const $phoneInput = $form.find('#login_phone, input[name="userPhone"], input[type="tel"]').first();
        const phone = ($phoneInput.val() || '').replace(/\D/g, '');

        // 전화번호 유효성 검사 (숫자 10~11자리)
        if (phone.length < 10 || phone.length > 11) {
          alert('올바른 휴대폰 번호를 입력해주세요.');
          return;
        }

        // 인증번호 발송
        AuthCodeManager.sendCode({
          phone: phone,
          type: 'login',
          onSuccess: (response) => {
            // 타이머와 info-box 표시
            $timer.removeClass('d-none');
            $infoBox.removeClass('d-none');
            
            // 타이머 시작
            if ($timer.length) {
              TimerManager.start($timer, 'pop_login');
            }
          },
          onError: (error) => {
            alert(error || '인증번호 발송에 실패했습니다.');
          }
        });
      });
    },

    /**
     * 회원유형 라디오 버튼 변경 이벤트 초기화
     */
    initMemberTypeToggle() {
      // 회원가입 팝업 및 내 정보 수정 팝업에서 회원유형 라디오 버튼 변경 시
      $(document).on('change', '#pop_join input[name="memberType"], #pop_mypage03 input[name="memberType"]', function() {
        const memberType = $(this).val();
        const $table = $(this).closest('table');
        // 회사정보 행 찾기 (company-group 클래스를 가진 행)
        const $companyRow = $table.find('tr.company-group');
        const $companyInputs = $companyRow.find('input[id="company_name"], input[id="department_name"]');

        // member_type2 (개인회원, value="2") 선택 시 회사 정보 필드 비활성화
        if (memberType === '2') {
          $companyInputs.prop('disabled', true).val('');
          $companyRow.addClass('disabled');
        } else {
          // member_type1 (기업회원, value="1") 선택 시 회사 정보 필드 활성화
          $companyInputs.prop('disabled', false);
          $companyRow.removeClass('disabled');
        }
      });

      // 초기 로드 시에도 상태 확인
      $(document).ready(() => {
        const $memberTypeJoin = $('#pop_join input[name="memberType"]:checked');
        const $memberTypeEdit = $('#pop_mypage03 input[name="memberType"]:checked');
        
        if ($memberTypeJoin.length) {
          $memberTypeJoin.trigger('change');
        }
        if ($memberTypeEdit.length) {
          $memberTypeEdit.trigger('change');
        }
      });
    }
  };

  // ============================================
  // Public API
  // ============================================
  window.MyPageController = MyPageController;
  window.TimerManager = TimerManager;
  window.AuthCodeManager = AuthCodeManager;
  window.PopupStateManager = PopupStateManager;

  // ============================================
  // Auto Initialize
  // ============================================
  $(document).ready(() => {
    MyPageController.init();
  });

})();
