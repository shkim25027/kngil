document.addEventListener("DOMContentLoaded", (event) => {
    // ---------------------------------------------
    // js-fixLeft 오른쪽에 따라 왼쪽 내용 변하기
    // 사용 클래스 : js-fixLeft-tit, js-fixLeft-bg, js-fixLeft-sec
    // ---------------------------------------------
    // primary.html 페이지에서만 실행
    if (!document.querySelector(".js-fixLeft-tit")) {
        return;
    }

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP or ScrollTrigger not loaded');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const tits = document.querySelectorAll(".js-fixLeft-tit");
    const bgs = document.querySelectorAll(".js-fixLeft-bg");
    const sections = document.querySelectorAll(".js-fixLeft-secs > div");


    function bgOnEnter(element) {
        gsap.to(element, {
            transform: "scale(1.05)",
            duration: 0.5
        });
    }

    function bgOnLeave(element) {
        gsap.to(element, {
            transform: "scale(1)",
            duration: 0.5
        });
    }
    
    function titOnEnter(element) {
        gsap.to(element, {
            opacity: 1,
            transform: "scale(1) translate(0%, 0%)",
            duration: 0.5
        });
    }
    
    function titOnLeave(element) {
        gsap.to(element, {
            opacity: 0.5,
            transform: "scale(0.7) translate(-47%, 0%)",
            duration: 0.5
        });
    }

    function updateElements(index) {
        bgs.forEach((bg, i) => {
            if (i === index) {
                bg.classList.add("on");
                bgOnEnter(bg);
            } else {
                bg.classList.remove("on");
                bgOnLeave(bg);
            }
        });
        
        tits.forEach((tit, i) => {
            if (i === index) {
                tit.classList.add("on");
                titOnEnter(tit);
            } else {
                tit.classList.remove("on");
                titOnLeave(tit);
            }
        });
    }
   
    ScrollTrigger.create({
        trigger: sections[0],
        start: "top top",
        // markers: true,
        onEnter: () => updateElements(0),
        onLeaveBack: () => updateElements(0)
    });
    
    ScrollTrigger.create({
        trigger: sections[1],
        start: "top center",
        // markers: true,
        onEnter: () => updateElements(1),
        onLeaveBack: () => updateElements(1)
    });

    ScrollTrigger.create({
        trigger: sections[2],
        start: "top center",
       // markers: true,
        onEnter: () => updateElements(2),
        onLeaveBack: () => updateElements(2)
    });

});
// 고정 슬라이드
document.addEventListener('DOMContentLoaded', function() {
    const route = document.querySelector('.route');
    if (!route) {
        return;
    }
    const sections = route.querySelectorAll('#sec1, #sec2, #sec3');
    const tabs = route.querySelectorAll('.tabs .tabs-li');
    const subs = route.querySelectorAll('.subs li');
    const imgs = route.querySelectorAll('.imgs li');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const observerCallback = (entries) => {
        entries.filter(entry => entry.isIntersecting).forEach(entry => {
            const id = entry.target.id;
            [tabs, subs, imgs].forEach(group => 
                group.forEach((el, index) => 
                    el.classList.toggle('on', id === `sec${index + 1}`)
                )
            );
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(section => observer.observe(section));
});


