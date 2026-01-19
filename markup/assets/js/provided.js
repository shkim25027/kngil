// anchor 스무스 스크롤 (CSP 대응: 인라인 스크립트 대신 외부에서 정의)
window.goto = function (id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------------------------
  // js-fixLeft: 오른쪽 스크롤에 따라 왼쪽 타이틀/배경 전환
  // 사용 클래스: js-fixLeft-tit, js-fixLeft-bg, js-fixLeft-secs
  // provided, results 등 js-fixLeft를 쓰는 페이지에서 실행
  // ---------------------------------------------
  const titRoot = document.querySelector(".js-fixLeft-tit");
  if (!titRoot) {
    initRoute();
    return;
  }

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.warn("GSAP or ScrollTrigger not loaded");
    initRoute();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const tits = document.querySelectorAll(".js-fixLeft-tit");
  const bgs = document.querySelectorAll(".js-fixLeft-bg");
  const sections = document.querySelectorAll(".js-fixLeft-secs > div");

  function setBgActive(el, active) {
    gsap.to(el, {
      transform: active ? "scale(1.05)" : "scale(1)",
      duration: 0.5,
    });
  }

  function setTitActive(el, active) {
    gsap.to(el, {
      opacity: active ? 1 : 0.5,
      transform: active ? "scale(1) translate(0%, 0%)" : "scale(0.7) translate(-47%, 0%)",
      duration: 0.5,
    });
  }

  function updateElements(index) {
    bgs.forEach((bg, i) => {
      const on = i === index;
      bg.classList.toggle("on", on);
      setBgActive(bg, on);
    });
    tits.forEach((tit, i) => {
      const on = i === index;
      tit.classList.toggle("on", on);
      setTitActive(tit, on);
    });
  }

  sections.forEach((section, i) => {
    if (!section) return;
    const start = i === 0 ? "top center" : "top center";
    ScrollTrigger.create({
      trigger: section,
      start,
      onEnter: () => updateElements(i),
      onLeaveBack: () => updateElements(i),
    });
  });

  initRoute();
});

// ---------------------------------------------
// route: .route 내 sec1~3·tabs·subs·imgs 연동 (IntersectionObserver)
// .route DOM이 있는 페이지에서만 동작 (현재 provided.html 마크업에는 미사용)
// ---------------------------------------------
function initRoute() {
  const route = document.querySelector(".route");
  if (!route) return;

  const sections = route.querySelectorAll("#sec1, #sec2, #sec3");
  const tabs = route.querySelectorAll(".tabs .tabs-li");
  const subs = route.querySelectorAll(".subs li");
  const imgs = route.querySelectorAll(".imgs li");

  const observer = new IntersectionObserver(
    (entries) => {
      entries
        .filter((e) => e.isIntersecting)
        .forEach((e) => {
          const id = e.target.id;
          const index = id ? parseInt(id.replace("sec", ""), 10) - 1 : -1;
          if (index < 0) return;
          [tabs, subs, imgs].forEach((group) =>
            group.forEach((el, i) => el.classList.toggle("on", i === index))
          );
        });
    },
    { root: null, rootMargin: "0px", threshold: 0.5 }
  );

  sections.forEach((s) => observer.observe(s));
}
