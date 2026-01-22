document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------------------------
  // js-fixLeft: 오른쪽 스크롤에 따라 왼쪽 타이틀 전환 (analysis 페이지, key 3블록)
  // 사용 클래스: js-fixLeft-tit, js-fixLeft-secs
  // ---------------------------------------------
  const key1 = document.querySelector(".key.spatial");
  const key2 = document.querySelector(".key.statistics");
  const key3 = document.querySelector(".key.attribute");
  if (!key1 || !key2 || !key3) return;

  const key1Tits = key1.querySelectorAll(".js-fixLeft-tit > li");
  const key1Sections = key1.querySelectorAll(".js-fixLeft-secs > div");
  const key2Tits = key2.querySelectorAll(".js-fixLeft-tit > li");
  const key2Sections = key2.querySelectorAll(".js-fixLeft-secs > div");
  const key3Tits = key3.querySelectorAll(".js-fixLeft-tit > li");
  const key3Sections = key3.querySelectorAll(".js-fixLeft-secs > div");

  if (
    !key1Tits.length || !key1Sections.length ||
    !key2Tits.length || !key2Sections.length ||
    !key3Tits.length || !key3Sections.length
  ) return;

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.warn("GSAP or ScrollTrigger not loaded");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (typeof ScrollToPlugin !== "undefined") {
    gsap.registerPlugin(ScrollToPlugin);
  }

  const triggerLine = "top 100px";
  const scrollOffsetY = 100;

  function updateTit(tits, index) {
    if (!tits || !tits.length) return;
    tits.forEach((tit, i) => {
      if (i === index) {
        tit.classList.add("on");
      } else {
        tit.classList.remove("on");
      }
    });
  }

  // key1 (spatial): 3섹션
  key1Sections.forEach((section, i) => {
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: triggerLine,
      onEnter: () => {
        updateTit(key1Tits, i);
      },
      onEnterBack: () => {
        updateTit(key1Tits, i);
      },
      onLeaveBack: () => {
        if (i > 0) {
          updateTit(key1Tits, i - 1);
        } else {
          updateTit(key1Tits, 0);
        }
      },
    });
  });

  // key2 (statistics): 3섹션
  key2Sections.forEach((section, i) => {
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: triggerLine,
      onEnter: () => {
        updateTit(key2Tits, i);
      },
      onEnterBack: () => {
        updateTit(key2Tits, i);
      },
      onLeaveBack: () => {
        if (i > 0) {
          updateTit(key2Tits, i - 1);
        } else {
          updateTit(key2Tits, 0);
        }
      },
    });
  });

  // key3 (attribute): 3섹션
  key3Sections.forEach((section, i) => {
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: triggerLine,
      onEnter: () => {
        updateTit(key3Tits, i);
      },
      onEnterBack: () => {
        updateTit(key3Tits, i);
      },
      onLeaveBack: () => {
        if (i > 0) {
          updateTit(key3Tits, i - 1);
        } else {
          updateTit(key3Tits, 0);
        }
      },
    });
  });

  // key3 마지막: 페이지 맨 아래에 닿으면 on
  ScrollTrigger.create({
    trigger: key3Sections[key3Sections.length - 1],
    start: "bottom bottom",
    onEnter: () => updateTit(key3Tits, key3Tits.length - 1),
  });

  // 초기·리프레시: 각 key별로 현재 스크롤에 맞는 항목
  function setInitialTit() {
    const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 30;

    [key1Sections, key2Sections, key3Sections].forEach((sections, ki) => {
      const tits = [key1Tits, key2Tits, key3Tits][ki];
      if (!tits || !sections) return;
      
      let active = 0;
      sections.forEach((sec, i) => {
        if (sec) {
          const rect = sec.getBoundingClientRect();
          if (rect.top <= scrollOffsetY + 50) {
            active = i;
          }
        }
      });
      
      const last = sections[sections.length - 1];
      if (last) {
        const lastRect = last.getBoundingClientRect();
        const prev = sections.length > 1 ? sections[sections.length - 2] : null;
        const prevRect = prev ? prev.getBoundingClientRect() : null;
        if (lastRect.top < window.innerHeight && lastRect.bottom > 0 && prevRect && prevRect.top < 0) {
          active = sections.length - 1;
        }
      }
      updateTit(tits, active);
    });

    if (atBottom) {
      updateTit(key3Tits, key3Tits.length - 1);
    }
  }
  
  // 초기화 및 리프레시
  ScrollTrigger.addEventListener("refresh", () => {
    setTimeout(setInitialTit, 100);
  });
  ScrollTrigger.refresh();
  setInitialTit();

  window.addEventListener("scroll", () => {
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 30) {
      updateTit(key3Tits, key3Tits.length - 1);
    }
  }, { passive: true });

  // 클릭: 해당 key의 해당 섹션으로 스크롤
  function bindClicks(keyEl, tits, sections) {
    if (!tits || !sections) return;
    tits.forEach((li, index) => {
      li.addEventListener("click", () => {
        const section = sections[index];
        if (!section) return;
        updateTit(tits, index);
        const cls = section.className.split(" ").find((c) => /^(spatial|statistics|attribute)\d+$/.test(c));
        if (typeof ScrollToPlugin !== "undefined" && cls) {
          gsap.to(window, {
            duration: 0.6,
            scrollTo: { y: "." + cls, offsetY: scrollOffsetY },
          });
        } else {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }
  bindClicks(key1, key1Tits, key1Sections);
  bindClicks(key2, key2Tits, key2Sections);
  bindClicks(key3, key3Tits, key3Sections);

  // ---------------------------------------------
  // SVG 애니메이션: 각 sub-figs가 화면에 보일 때만 SVG 로드 (1번만)
  // ---------------------------------------------
  const subFigsElements = document.querySelectorAll(".sub-figs");
  if (subFigsElements.length > 0) {
    const loadedElements = new Set();

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !loadedElements.has(entry.target)) {
          const svgImg = entry.target.querySelector(".apx img[data-src]");
          if (svgImg && svgImg.dataset.src) {
            // data-src를 src로 변경하여 SVG 로드 (한 번만)
            svgImg.src = svgImg.dataset.src;
            svgImg.removeAttribute("data-src");
            loadedElements.add(entry.target);
            // SVG가 로드되면 애니메이션이 자동으로 시작됨
            observer.unobserve(entry.target);
          }
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: "0px"
    });

    subFigsElements.forEach((el) => observer.observe(el));
  }
});
