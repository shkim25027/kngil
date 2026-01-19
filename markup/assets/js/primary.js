document.addEventListener("DOMContentLoaded", (event) => {
   
    // ---------------------------------------------
    // js__fixLeft 오른쪽에 따라 왼쪽 내용 변하기
    // 사용 클래스 : js__fixLeft_tit, js__fixLeft_bg, js__fixLeft_sec
    // ---------------------------------------------
    // floorplan.html 페이지에서만 실행
    const key1 = document.querySelector('.key.find');
    if (!key1) {
        return;
    }

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP or ScrollTrigger not loaded');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const key1Tits = key1.querySelectorAll(".js__fixLeft_tit > li");
    const key1Sections = key1.querySelectorAll(".js__fixLeft_secs > div");   
    const key2 = document.querySelector('.key.info');
    const key2Tits = key2 ? key2.querySelectorAll(".js__fixLeft_tit > li") : [];
    const key2Sections = key2 ? key2.querySelectorAll(".js__fixLeft_secs > div") : [];   
    const key3 = document.querySelector('.key.print');
    const key3Tits = key3 ? key3.querySelectorAll(".js__fixLeft_tit > li") : [];
    const key3Sections = key3 ? key3.querySelectorAll(".js__fixLeft_secs > div") : [];   

    
    function titOnEnter(element) {
        gsap.to(element, {
            duration: 0.5
        });
    }
    
    function titOnLeave(element) {
        gsap.to(element, {
            duration: 0.5
        });
    }

    function key1UpdateTit(index) {
        key1Tits.forEach((tit, i) => {
            if (i === index) {
                tit.classList.add("on");
                titOnEnter(tit);
            } else {
                tit.classList.remove("on");
                titOnLeave(tit);
            }
        });
    }

    function key2UpdateTit(index) {
        key2Tits.forEach((tit, i) => {
            if (i === index) {
                tit.classList.add("on");
                titOnEnter(tit);
            } else {
                tit.classList.remove("on");
                titOnLeave(tit);
            }
        });
    }

    function key3UpdateTit(index) {
        key3Tits.forEach((tit, i) => {
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
        trigger: key1Sections[0],
        start: "top 30%",
        // markers: true,
        onEnter: () => key1UpdateTit(0),
        onLeaveBack: () => key1UpdateTit(0)
    });
    
    ScrollTrigger.create({
        trigger: key1Sections[1],
        start: "center 70%",
        // markers: true,
        onEnter: () => key1UpdateTit(1),
        onLeaveBack: () => key1UpdateTit(1)
    });

    ScrollTrigger.create({
        trigger: key1Sections[2],
        start: "bottom bottom",
        // markers: true,
        onEnter: () => key1UpdateTit(2),
        onLeaveBack: () => key1UpdateTit(2)
    });

    ScrollTrigger.create({
        trigger: key2Sections[0],
        start: "top 30%",
        // markers: true,
        onEnter: () => key2UpdateTit(0),
        onLeaveBack: () => key2UpdateTit(0)
    });
    
    ScrollTrigger.create({
        trigger: key2Sections[1],
        start: "center 70%",
        // markers: true,
        onEnter: () => key2UpdateTit(1),
        onLeaveBack: () => key2UpdateTit(1)
    });

    ScrollTrigger.create({
        trigger: key2Sections[2],
        start: "bottom bottom",
        // markers: true,
        onEnter: () => key2UpdateTit(2),
        onLeaveBack: () => key2UpdateTit(2)
    });

    ScrollTrigger.create({
        trigger: key2Sections[3],
        start: "bottom bottom",
        // markers: true,
        onEnter: () => key2UpdateTit(3),
        onLeaveBack: () => key2UpdateTit(3)
    });

    ScrollTrigger.create({
        trigger: key3Sections[0],
        start: "top 30%",
        // markers: true,
        onEnter: () => key3UpdateTit(0),
        onLeaveBack: () => key3UpdateTit(0)
    });
    
    ScrollTrigger.create({
        trigger: key3Sections[1],
        start: "center 70%",
        // markers: true,
        onEnter: () => key3UpdateTit(1),
        onLeaveBack: () => key3UpdateTit(1)
    });

    ScrollTrigger.create({
        trigger: key3Sections[2],
        start: "bottom bottom",
        // markers: true,
        onEnter: () => key3UpdateTit(2),
        onLeaveBack: () => key3UpdateTit(2)
    });

});