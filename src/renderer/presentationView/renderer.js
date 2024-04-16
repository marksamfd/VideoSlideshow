import Presentation from "../js/PresentationClass";
import Slide from "../js/SlideClass";
import hotkeys from 'hotkeys-js';
import "./index.scss";

let presentContainer = document.getElementById("presentContainer")
let present

hotkeys('down,ctrl+o,up,space', function (event, handler){
    switch (handler.key) {
        case 'down':
        case 'space':
            present.changeSlide()
            break;
        case 'up':
            present.changeSlide(-1)
            break;
        case 'ctrl+o':
            file.open("c").then(([basePath, content]) => {
                let presentation = JSON.parse(content)
                let slides = presentation.map(e => new Slide(e.text.value, e.video.path))
                present = new Presentation({
                    container: "dd",
                    width: presentContainer.clientWidth,
                    height: presentContainer.clientHeight,
                    slides,
                    basePath,
                    mode: "words",
                    by:"6"
                })
            })
            break;
    }
});