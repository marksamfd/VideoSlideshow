import Presentation from "../js/PresentationClass";
import Slide from "../js/SlideClass";
import hotkeys from 'hotkeys-js';
import "./index.scss";

let presentContainer = document.getElementById("presentContainer")
let present


comm.onPresenterMessage((msg) => {
    console.log(msg)
    let msgType = msg.type
    switch (msgType) {
        case "init":
            let fileParams = JSON.parse(msg.data)
            let presentation = JSON.parse(fileParams.content)
            let slides = presentation.map(e => new Slide(e.text.value, e.video.path))
            present = new Presentation({
                container: "presentContainer",
                width: presentContainer.clientWidth,
                height: presentContainer.clientHeight,
                slides,
                basePath:fileParams.basePath,
                mode: fileParams.mode,
                sepBy: fileParams.sepBy
            })
            break;
        case "change":
            present.changeSlide(msg.data)
    }


})