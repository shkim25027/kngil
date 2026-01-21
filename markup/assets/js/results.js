document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------------------------
  // results-wrap 탭: tab-list 클릭 시 tab-content 전환
  // ---------------------------------------------
  const wrap = document.querySelector(".results-wrap");
  const tabList = wrap?.querySelector(".tab-list");
  const tabContents = wrap?.querySelectorAll(".tab-content");
  if (tabList && tabContents?.length) {
    const links = tabList.querySelectorAll("li a");
    const ids = ["key-natural", "key-social", "key-cost"];
    links.forEach((a, i) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const id = ids[i];
        if (!id) return;
        tabContents.forEach((el) => el.classList.remove("on"));
        const target = document.getElementById(id);
        if (target) target.classList.add("on");
        tabList.querySelectorAll("li").forEach((li, j) => li.classList.toggle("on", j === i));
        links.forEach((link, j) => link.setAttribute("aria-selected", j === i ? "true" : "false"));
      });
    });
  }

  // ---------------------------------------------
  // js-fixLeft: 오른쪽 스크롤에 따라 왼쪽 타이틀 전환 (results 페이지, key 3블록: natural, social, cost)
  // 사용 클래스: js-fixLeft-tit, js-fixLeft-secs
  // ---------------------------------------------
  const key1 = document.querySelector(".key.natural");
  const key2 = document.querySelector(".key.social");
  const key3 = document.querySelector(".key.cost");
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
    if (!tits) return;
    tits.forEach((tit, i) => tit.classList.toggle("on", i === index));
  }

  // key1 (natural)
  key1Sections.forEach((section, i) => {
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: triggerLine,
      onEnter: () => updateTit(key1Tits, i),
      onLeaveBack: () => updateTit(key1Tits, i > 0 ? i - 1 : 0),
    });
  });

  // key2 (social)
  key2Sections.forEach((section, i) => {
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: triggerLine,
      onEnter: () => updateTit(key2Tits, i),
      onLeaveBack: () => updateTit(key2Tits, i > 0 ? i - 1 : 0),
    });
  });

  // key3 (cost)
  key3Sections.forEach((section, i) => {
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: triggerLine,
      onEnter: () => updateTit(key3Tits, i),
      onLeaveBack: () => updateTit(key3Tits, i > 0 ? i - 1 : 0),
    });
  });

  ScrollTrigger.create({
    trigger: key3Sections[key3Sections.length - 1],
    start: "bottom bottom",
    onEnter: () => updateTit(key3Tits, key3Tits.length - 1),
  });

  function setInitialTit() {
    const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 30;

    [key1Sections, key2Sections, key3Sections].forEach((sections, ki) => {
      const tits = [key1Tits, key2Tits, key3Tits][ki];
      let active = 0;
      sections.forEach((sec, i) => {
        if (sec && sec.getBoundingClientRect().top <= scrollOffsetY) active = i;
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
  setInitialTit();
  ScrollTrigger.addEventListener("refresh", setInitialTit);

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
        const cls = section.className.split(" ").find((c) => /^(natural|social|cost)\d+$/.test(c));
        if (typeof ScrollToPlugin !== "undefined" && cls) {
          gsap.to(window, {
            duration: 0.6,
            scrollTo: { y: "." + cls, offsetY: scrollOffsetY },
          });
        } else {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        updateTit(tits, index);
      });
    });
  }
  bindClicks(key1, key1Tits, key1Sections);
  bindClicks(key2, key2Tits, key2Sections);
  bindClicks(key3, key3Tits, key3Sections);

  // ---------------------------------------------
  // 상단 탭: 클릭 시 해당 key 섹션으로 스크롤, 스크롤에 따라 .on 갱신
  // ---------------------------------------------
  const tabs = document.querySelectorAll(".results-tabs ul li");
  const keySections = [key1, key2, key3];

  if (tabs.length >= 3) {
    tabs.forEach((li, index) => {
      const a = li.querySelector("a");
      if (!a) return;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const target = keySections[index];
        if (!target) return;
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        tabs.forEach((t, i) => t.classList.toggle("on", i === index));
      });
    });

    function updateTabs() {
      const vy = window.scrollY + window.innerHeight * 0.3;
      let active = 0;
      keySections.forEach((sec, i) => {
        if (sec) {
          const rect = sec.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          if (vy >= top) active = i;
        }
      });
      tabs.forEach((t, i) => t.classList.toggle("on", i === active));
    }
    window.addEventListener("scroll", () => updateTabs(), { passive: true });
    updateTabs();
  }
});
