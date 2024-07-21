import Slide from "../../js/Classes/SlideClass";
import ShowCreator from "../../js/Classes/ShowCreatorClass";
import hotkeys from "hotkeys-js";

let present

window.file.onFileParams(function (fileParams) {
    console.log(fileParams);
    let presentation = JSON.parse(fileParams["content"])
    let slides = presentation.map(e => new Slide(e))
    let slidePreviewCanv = document.getElementById("currentSlideThumbCanvas");
    console.log(slidePreviewCanv)
    comm.toPresentation({type: "init", data: JSON.stringify(fileParams)})
    present = new ShowCreator({
        container: "currentSlideThumbCanvas",
        sidebarSlidesContainer: document.getElementById("sidebarSlidesContainer"),
        lyricsContainer: document.getElementById("textSlidesList"),
        slideTextEditor: document.getElementById("textSlidesEditor"),
        width: slidePreviewCanv.clientWidth,
        height: slidePreviewCanv.clientHeight,
        slides,
        basePath: fileParams.basePath,
        mode: fileParams.mode,
        sepBy: fileParams.sepBy
    })
    hotkeys('delete,ctrl+s', function (event, handler) {
        switch (handler.key) {
            case 'delete':
                present.removeSlide()
                break;
            case 'ctrl+s':
                file.save(present.saveShow())
        }
    })

    // window.onbeforeunload = (e) => {
    //     e.preventDefault()
    //     file.saveAndQuit(present.saveShow())
    //
    // }


})

comm.onSlideshowInitialized(() => {
    comm.startSlideshow(present.saveShow())
})

comm.onSlideshowDestroy(() => {
    present.destroyShow()
})
window.onbeforeunload = () => {
    console.log("Destroying show")
    present?.destroyCreator()
}