/**
 * FAQ Accordion Module
 * FAQ 아코디언 기능을 관리하는 모듈
 */
(function() {
  'use strict';

  class FAQAccordion {
    constructor(containerSelector = '.faq-list') {
      this.container = document.querySelector(containerSelector);
      this.items = [];
      this.activeItem = null;
      
      if (!this.container) {
        console.warn('[FAQAccordion] Container not found:', containerSelector);
        return;
      }
      
      this.init();
    }

    /**
     * 초기화
     */
    init() {
      this.items = Array.from(this.container.querySelectorAll('.faq-item'));
      
      if (this.items.length === 0) {
        return;
      }

      this.items.forEach((item, index) => {
        this.setupItem(item, index);
      });

      // 키보드 네비게이션 지원
      this.setupKeyboardNavigation();
    }

    /**
     * 각 FAQ 항목 설정
     */
    setupItem(item, index) {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      const icon = item.querySelector('.faq-icon .fa');
      const link = item.querySelector('.faq-link');

      if (!question || !answer) {
        return;
      }

      // 접근성 속성 추가
      const itemId = `faq-item-${index}`;
      const answerId = `faq-answer-${index}`;
      
      question.setAttribute('id', itemId);
      question.setAttribute('role', 'button');
      question.setAttribute('aria-expanded', 'false');
      question.setAttribute('aria-controls', answerId);
      question.setAttribute('tabindex', '0');
      
      answer.setAttribute('id', answerId);
      answer.setAttribute('role', 'region');
      answer.setAttribute('aria-labelledby', itemId);
      answer.setAttribute('aria-hidden', 'true');

      // 클릭 이벤트
      question.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleItem(item);
      });

      // 키보드 이벤트
      question.addEventListener('keydown', (e) => {
        this.handleKeydown(e, item, index);
      });

      // 링크 클릭 시에도 토글
      if (link) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleItem(item);
        });
      }
    }

    /**
     * 항목 토글
     */
    toggleItem(item) {
      const isOpen = item.classList.contains('active');
      
      if (isOpen) {
        this.closeItem(item);
      } else {
        // 다른 항목들 닫기 (하나만 열리도록)
        if (this.activeItem && this.activeItem !== item) {
          this.closeItem(this.activeItem);
        }
        this.openItem(item);
      }
    }

    /**
     * 항목 열기
     */
    openItem(item) {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      const icon = item.querySelector('.faq-icon .fa');

      item.classList.add('active');
      question.setAttribute('aria-expanded', 'true');
      answer.setAttribute('aria-hidden', 'false');
      
      if (answer) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
      
      if (icon) {
        icon.classList.remove('fa-plus');
        icon.classList.add('fa-minus');
      }

      this.activeItem = item;
    }

    /**
     * 항목 닫기
     */
    closeItem(item) {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      const icon = item.querySelector('.faq-icon .fa');

      item.classList.remove('active');
      question.setAttribute('aria-expanded', 'false');
      answer.setAttribute('aria-hidden', 'true');
      
      if (answer) {
        answer.style.maxHeight = null;
      }
      
      if (icon) {
        icon.classList.remove('fa-minus');
        icon.classList.add('fa-plus');
      }

      if (this.activeItem === item) {
        this.activeItem = null;
      }
    }

    /**
     * 키보드 네비게이션 처리
     */
    handleKeydown(e, currentItem, currentIndex) {
      const { key } = e;
      let targetItem = null;
      let targetIndex = currentIndex;

      switch (key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          this.toggleItem(currentItem);
          break;
        
        case 'ArrowDown':
          e.preventDefault();
          targetIndex = Math.min(currentIndex + 1, this.items.length - 1);
          targetItem = this.items[targetIndex];
          if (targetItem) {
            targetItem.querySelector('.faq-question').focus();
          }
          break;
        
        case 'ArrowUp':
          e.preventDefault();
          targetIndex = Math.max(currentIndex - 1, 0);
          targetItem = this.items[targetIndex];
          if (targetItem) {
            targetItem.querySelector('.faq-question').focus();
          }
          break;
        
        case 'Home':
          e.preventDefault();
          targetItem = this.items[0];
          if (targetItem) {
            targetItem.querySelector('.faq-question').focus();
          }
          break;
        
        case 'End':
          e.preventDefault();
          targetItem = this.items[this.items.length - 1];
          if (targetItem) {
            targetItem.querySelector('.faq-question').focus();
          }
          break;
        
        case 'Escape':
          if (this.activeItem) {
            this.closeItem(this.activeItem);
            this.activeItem.querySelector('.faq-question').focus();
          }
          break;
      }
    }

    /**
     * 컨테이너 레벨 키보드 네비게이션 설정
     */
    setupKeyboardNavigation() {
      this.container.setAttribute('role', 'list');
      this.items.forEach(item => {
        item.setAttribute('role', 'listitem');
      });
    }

    /**
     * 모든 항목 닫기
     */
    closeAll() {
      if (this.activeItem) {
        this.closeItem(this.activeItem);
      }
    }

    /**
     * 특정 항목 열기
     */
    openItemByIndex(index) {
      if (index >= 0 && index < this.items.length) {
        this.toggleItem(this.items[index]);
      }
    }
  }

  // ============================================
  // 초기화
  // ============================================
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        window.faqAccordion = new FAQAccordion();
      });
    } else {
      window.faqAccordion = new FAQAccordion();
    }
  }

  // 전역에서 접근 가능하도록 노출
  window.FAQAccordion = FAQAccordion;
  
  // 자동 초기화
  init();

})();
