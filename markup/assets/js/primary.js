document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------------------------
  // js-fixLeft: 오른쪽 스크롤에 따라 왼쪽 타이틀 전환 (primary 페이지)
  // 사용 클래스: js-fixLeft-tit, js-fixLeft-secs
  // ---------------------------------------------
  const keySection = document.querySelector(".primary .key");
  if (!keySection) return;

  const tits = keySection.querySelectorAll(".js-fixLeft-tit > li");
  const sections = keySection.querySelectorAll(".js-fixLeft-secs > div");
  if (!tits.length || !sections.length) return;

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.warn("GSAP or ScrollTrigger not loaded");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (typeof ScrollToPlugin !== "undefined") {
    gsap.registerPlugin(ScrollToPlugin);
  }

  function updateTit(index) {
    tits.forEach((tit, i) => {
      tit.classList.toggle("on", i === index);
    });
  }

  // 헤더 높이에 맞춘 기준선 (헤더 100px + 여유)
  const triggerLine = "top 100px";
  const scrollOffsetY = 100;

  // 스크롤 구간별 왼쪽 타이틀 on 전환
  // - onEnter: 아래로 스크롤 시 섹션 top이 기준선을 지나면 해당 항목 on
  // - onLeaveBack: 위로 스크롤 시 기준선을 벗어나면 이전 항목(i-1) on
  sections.forEach((section, i) => { 
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: triggerLine,
      onEnter: () => updateTit(i),
      onLeaveBack: () => updateTit(i > 0 ? i - 1 : 0),
    });
  });

  // 마지막 섹션: 상단이 100px까지 올라오지 않아도, 페이지 맨 아래에 닿으면 on
  const lastIdx = sections.length - 1;
  if (lastIdx > 0) {
    ScrollTrigger.create({
      trigger: sections[lastIdx],
      start: "bottom bottom",
      onEnter: () => updateTit(lastIdx),
    });
  }

  // 초기·리프레시: 현재 스크롤에 맞는 항목 (마지막 sec은 화면에 보이면 선택)
  function setInitialTit() {
    const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 30;
    if (atBottom) {
      updateTit(lastIdx);
      return;
    }
    let active = 0;
    const last = sections[lastIdx];
    const lastRect = last.getBoundingClientRect();
    const prevRect = lastIdx > 0 ? sections[lastIdx - 1].getBoundingClientRect() : null;

    sections.forEach((sec, i) => {
      if (sec.getBoundingClientRect().top <= scrollOffsetY) active = i;
    });
    if (lastRect.top < window.innerHeight && lastRect.bottom > 0 && prevRect && prevRect.top < 0) {
      active = lastIdx;
    }
    updateTit(active);
  }
  setInitialTit();
  ScrollTrigger.addEventListener("refresh", setInitialTit);

  // 화면 끝까지 스크롤했을 때 마지막 항목 on
  window.addEventListener("scroll", () => {
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 30) {
      updateTit(lastIdx);
    }
  }, { passive: true });

  // 왼쪽 메뉴 클릭 시 해당 섹션으로 스크롤 (기준선=offsetY로 맞춤)
  tits.forEach((li, index) => {
    li.addEventListener("click", () => {
      const section = sections[index];
      if (!section) return;
      const cls = Array.from(section.classList).find((c) => c.startsWith("sec-"));
      if (typeof ScrollToPlugin !== "undefined" && cls) {
        gsap.to(window, {
          duration: 0.6,
          scrollTo: { y: "." + cls, offsetY: scrollOffsetY },
        });
      } else {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      updateTit(index);
    });
  });
});
