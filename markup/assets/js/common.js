/**
 * Common JavaScript
 * 공통 기능 모음
 */

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
      if (typeof ErrorHandler !== 'undefined') {
        ErrorHandler.handle(error, { context: 'ScrollManager.syncHeight' });
      } else {
        console.error('[ScrollManager] syncHeight error:', error);
      }
    }
  }
}

// ScrollManager 초기화
const scrollManager = new ScrollManager();

// 페이지 로드 시 초기 높이 설정
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    scrollManager.syncHeight();
  });
} else {
  scrollManager.syncHeight();
}

// 윈도우 리사이즈 시 높이 재설정
window.addEventListener('resize', () => {
  scrollManager.syncHeight();
});

// ============================================
// Include Handler
// ============================================
window.addEventListener('load', function() {
  const allElements = document.getElementsByTagName('*');
  Array.prototype.forEach.call(allElements, function(el) {
    const includePath = el.dataset.includePath;
    if (includePath) {
      const xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
          el.outerHTML = this.responseText;
        }
      };
      xhttp.open('GET', includePath, true);
      xhttp.send();
    }
  });
});

// ============================================
// Popup Functions
// ============================================

/**
 * 팝업 스크롤 처리 (Lenis 중지)
 */
function handlePopupScroll() {
  $('body').css('overflow', 'hidden');
  $('body').on('wheel', function(e) {
    e.stopPropagation();
  });
  if (typeof lenis !== 'undefined') {
    lenis.stop();
  }
}

/**
 * 팝업 열기 공통 함수
 */
function openPopup(popupId) {
  $('.popup-wrap').hide();
  $(popupId).show(0, function() {
    // popup.js가 아직 로드되지 않았으면 로드
    if (typeof PopupController === 'undefined') {
      $.getScript('./assets/js/popup.js', function() {
        handlePopupScroll();
      });
    } else {
      handlePopupScroll();
    }
  });
}

// 팝업 열기 함수들 - 전역에서 접근 가능하도록 window 객체에 명시적으로 할당
window.agreement = function agreement() {
  openPopup('#pop_agreement');
};

window.join = function join() {
  openPopup('#pop_join');
};

window.login = function login() {
  openPopup('#pop_login');
};

window.mypage01 = function mypage01() {
  openPopup('#pop_mypage01');
};

window.mypage02 = function mypage02() {
  openPopup('#pop_mypage02');
};

window.mypage03 = function mypage03() {
  openPopup('#pop_mypage03');
};

window.search = function search() {
  openPopup('#pop_search');
};

/**
 * 약관/개인정보 보호정책 팝업
 * 전역에서 접근 가능하도록 window 객체에 명시적으로 할당
 */
window.privacy = function privacy(type) {
  $('.popup-wrap').hide();
  $('#pop_privacy').show(0, function() {
    // popup.js가 아직 로드되지 않았으면 로드
    if (typeof PopupController === 'undefined') {
      $.getScript('./assets/js/popup.js', function() {
        handlePopupScroll();
        setPrivacyTab(type);
      });
    } else {
      handlePopupScroll();
      setPrivacyTab(type);
    }
  });
};

/**
 * 개인정보 보호정책 탭 설정
 */
function setPrivacyTab(type) {
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
 * 사이트맵 토글
 */
function sitemap() {
  $('.menu-all').toggleClass('open');
  $('.sitemap').toggleClass('open');
}

// ============================================
// Top Button Controller
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  // 메인 페이지가 아닐 때만 동작
  const isMainPage = document.querySelector('.wrap.main') || document.querySelector('.main');
  if (isMainPage) {
    return;
  }

  const topButton = document.querySelector('.btn-top');
  if (!topButton) {
    return;
  }

  /**
   * 탑 버튼 위치 조정
   */
  function adjustButtonPosition() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const bottomSpace = 230;

    if (scrollY + windowHeight >= documentHeight - bottomSpace) {
      topButton.style.bottom = `${bottomSpace + (scrollY + windowHeight - documentHeight)}px`;
    } else {
      topButton.style.bottom = '60px';
    }
  }

  window.addEventListener('scroll', adjustButtonPosition);
  window.addEventListener('load', adjustButtonPosition);

  // GSAP ScrollTrigger 헤더 애니메이션
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    const header = document.querySelector('.header');
    if (header) {
      const showNav = gsap.from('.header', {
        yPercent: -200,
        paused: true,
        duration: 0.2
      }).progress(1);

      ScrollTrigger.create({
        start: 'top top',
        end: 99999,
        onUpdate: function(self) {
          self.direction === -1 ? showNav.play() : showNav.reverse();
        }
      });
    }
  }
});

// ============================================
// Header Menu Controller
// ============================================
$(function() {
  // 사이트맵 열기
  $('.menu-all').on('click', function() {
    sitemap();
    return false;
  });

  // 사용자 메뉴 hover 처리
  $('.menu-box, .menu-list').hover(
    function() {
      $('.menu-list').addClass('show');
    },
    function(e) {
      const relatedTarget = e.relatedTarget;
      const $menuUser = $('.menu-box');
      const $menuList = $('.menu-list');

      // 메뉴 영역 밖으로 나갔는지 확인
      if (!relatedTarget ||
          (!$menuUser.is(relatedTarget) && !$menuUser.find(relatedTarget).length &&
           !$menuList.is(relatedTarget) && !$menuList.find(relatedTarget).length)) {
        $('.menu-list').removeClass('show');
      }
    }
  );

  // 사용자 메뉴 클릭 처리
  $('.menu-user').on('click', function(e) {
    e.stopPropagation();
    $('.menu-list').toggleClass('show');
  });

  // 키보드 접근성 지원 (탭 + 엔터/스페이스)
  $('.menu-user').on('keydown', function(e) {
    // Enter 또는 Space 키
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      $('.menu-list').toggleClass('show');
    }
    // Escape 키로 메뉴 닫기
    if (e.key === 'Escape') {
      $('.menu-list').removeClass('show');
      $(this).focus();
    }
  });

  // 외부 클릭 시 메뉴 닫기
  $(document).on('click', function(e) {
    const $menuUser = $('.menu-user');
    const $menuList = $('.menu-list');
    
    if (!$menuUser.is(e.target) && !$menuUser.find(e.target).length &&
        !$menuList.is(e.target) && !$menuList.find(e.target).length) {
      $menuList.removeClass('show');
    }
  });
});

// ============================================
// Footer Controller
// ============================================
$(function() {
  // 패밀리 사이트 토글
  $('.btn-family').on('click', function() {
    $('.family-list').toggleClass('open');
    $('.btn-family').toggleClass('open');
  });
});
