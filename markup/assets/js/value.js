document.addEventListener('DOMContentLoaded', (event)=> {

    // ---------------------------------------------
    // 주요기능의 라인 애니, 카드 애니
    // 사용 클래스 : js-ani
    // ---------------------------------------------
    let hasAnimationRun = false;
    const valuesAni = document.querySelector('.js-ani');
    
    if (!valuesAni) return; // 요소가 없으면 종료
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: [0, 0.7] // Observe both 0% and 70% visibility
    };
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (!hasAnimationRun && entry.intersectionRatio >= 0.7) {
                valuesAni.classList.add('card-ani');
                const linesElement = valuesAni.querySelector('.lines');
                if (linesElement) {
                    linesElement.classList.add('move-ani');
                }
                setTimeout(() => {
                    valuesAni.classList.remove('card-ani');
                }, 1200);
                hasAnimationRun = true; 
                observer.unobserve(valuesAni);
            }
        });
    };
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    observer.observe(valuesAni);

   
})
