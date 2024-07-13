import hotkeys from 'hotkeys-js';
// Text Slides Selector
let textSlidesList = document.querySelector('#textSlidesList');
let textSlides = document.querySelectorAll("#textSlidesList > li");
let currentActiveTextSlide = 0
let currentActiveSlide = 0

function slideTextClicked(e) {
    let newActiveTextSlide = e.target.dataset.textslidenumber *1 ;
    if (newActiveTextSlide !== currentActiveTextSlide) {
        textSlides[currentActiveTextSlide].classList.remove("active-text-slide");
        textSlides[(newActiveTextSlide)].classList.add("active-text-slide");
        currentActiveTextSlide = newActiveTextSlide;
    }
}

textSlides.forEach(ts => ts.addEventListener("click", slideTextClicked));
let scrollBehaviour = { behavior: "instant",block:"center"}

hotkeys('down,ctrl+o,up,space', function (event, handler) {
    switch (handler.key) {
        case 'down':
        case 'space':
            if (currentActiveTextSlide < textSlides.length-1) {
                textSlides[currentActiveTextSlide].classList.remove("active-text-slide");
                currentActiveTextSlide += 1
                textSlides[currentActiveTextSlide].classList.add("active-text-slide");
                textSlides[currentActiveTextSlide].scrollIntoView(scrollBehaviour)


            }
            break;
        case 'up':
            if (currentActiveTextSlide > 0) {
                textSlides[currentActiveTextSlide].classList.remove("active-text-slide");
                currentActiveTextSlide -= 1
                textSlides[currentActiveTextSlide].classList.add("active-text-slide");
                textSlides[currentActiveTextSlide].scrollIntoView(scrollBehaviour)

            }
            break;

    }
});