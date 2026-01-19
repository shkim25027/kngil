/**
 * pop_temp.html - URL 파라미터로 팝업 오픈
 * CSP 대응: 인라인 스크립트 대신 외부 파일로 분리
 */
(function () {
  function getParam(name) {
    var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(location.search);
    return m ? decodeURIComponent(m[1]) : '';
  }

  var popMap = {
    login: '#pop_login',
    login2: '#pop_login2',
    join: '#pop_join',
    join2: '#pop_join2',
    join3: '#pop_join3',
    agreement: '#pop_agreement',
    mypage01: '#pop_mypage01',
    mypage02: '#pop_mypage02',
    mypage03: '#pop_mypage03',
    mypage04: '#pop_mypage04',
    mypage05: '#pop_mypage05',
    mypage06: '#pop_mypage06',
    cancel: '#pop_cancel',
    search: '#pop_search',
    password: '#pop_password',
    privacy: '#pop_privacy'
  };

  function init() {
    var pop = getParam('pop').toLowerCase();
    var tab = getParam('tab').toLowerCase();

    if (!pop) return;

    // popupManager 로드 대기 (common.js가 head에서 먼저 로드됨)
    if (typeof popupManager === 'undefined' || !popupManager.open) {
      setTimeout(init, 30);
      return;
    }

    if (pop === 'privacy') {
      if (popupManager.openPrivacy) {
        popupManager.openPrivacy(tab === 'agreement' ? 'agreement' : 'privacy');
      }
      return;
    }

    var sel = popMap[pop];
    if (sel) {
      // DOM·다른 스크립트 안정화 후 팝업 오픈
      setTimeout(function () {
        popupManager.open(sel);
      }, 0);
    }
  }

  if (typeof $ !== 'undefined' && $.fn && $.fn.jquery) {
    $(init);
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
