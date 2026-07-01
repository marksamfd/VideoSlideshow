import Slide from "../../js/Classes/Slide";
import PresentationCreatorView from "../../js/Classes/PresentationCreatorView";
import hotkeys from "hotkeys-js";

/**
 * @type {PresentationCreatorView}
 */
let creator;
let sentCloseSignal = false;

window.file.onFileParams(function (fileParams) {
    console.log(fileParams);
    let presentation = JSON.parse(fileParams["content"]);
    let slides = presentation.map((e) => new Slide(e));
    let slidePreviewCanv = document.getElementById("currentSlideThumbCanvas");

    creator = new PresentationCreatorView({
        slides: [...slides],
        sidebarSlidesContainer: document.getElementById("sidebarSlidesContainer"),
        container: "currentSlideThumbCanvas",
        width: slidePreviewCanv.clientWidth,
        height: slidePreviewCanv.clientHeight,
        splitStrategy: fileParams.mode,
        splitDelimiter: fileParams.sepBy,
        addSlideBtn: document.querySelector(`#slideAdd`),
        removeSlideBtn: document.querySelector(`#slideDelete`),
        textAreaElement: document.querySelector("textarea"),
        fontSelectorElement: document.querySelector("#fontSelector"),
        backgroundBtnElement: document.querySelector("#backgroundEnabledBtn"),
        videoToolbar: document.querySelector("#videoToolbar"),
        lyricsContainer: document.querySelector("#lyricsList"),
    });

    window.file.onSaveBeforeQuit(async () => {
        if (!sentCloseSignal) {
            sentCloseSignal = true;
            console.log("Saving data before quitting...");
            if (await file.saveAndQuit(creator.stringifyShow())) {
                window.file.saveDone();
            }
        }
    });
});
hotkeys("delete,ctrl+s", function (event, handler) {
    switch (handler.key) {
        case "delete":
            creator?.removeSlide();
            break;
        case "ctrl+s":
            file.save(creator.stringifyShow());
            console.log(creator.stringifyShow());
    }
});

window.comm.onSlideshowInitialized(() => {
    comm.startSlideshow(creator.stringifyShow());
});

/* window.comm.onSlideshowDestroy(() => {
  present?.destroyCreator();
});
window.onbeforeunload = () => {
    console.log("Destroying show")
    present?.destroyCreator()
}
 */
