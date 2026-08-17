import Slide, {SlideType} from "../../js/Classes/Slide";
import PresenterView from "../../js/Classes/PresenterView";
import hotkeys from "hotkeys-js";

let presenter: PresenterView;
//@ts-ignore
window.file.onFileParams(function (fileParams: {
    [x: string]: string;
    mode: any;
    sepBy: any;
}) {
    console.log("Presenter View - File Params:", fileParams);
    let presentation = JSON.parse(fileParams["content"]);
    let slides = presentation.map((e: SlideType | undefined) => new Slide(e));

    let slidePreviewCanv = document.getElementById("currentSlideThumbCanvas");
    presenter = new PresenterView({
        container: "currentSlideThumbCanvas",
        sidebarSlidesContainer: document.getElementById(
            "sidebarSlidesContainer",
        ) as HTMLElement,

        lyricsContainer: document.getElementById("lyricsList") as HTMLUListElement,
        width: ((slidePreviewCanv?.clientHeight ?? 0) * 16) / 9,
        height: slidePreviewCanv?.clientHeight ?? 0,
        slides,
        mode: fileParams.mode,
        sepBy: fileParams.sepBy,
        notifySlideChange: (slide) => window.comm.toPresentation(slide)
    })

    // Attach keyboard navigation

});
hotkeys("down,up,space", function (event, handler) {
    switch (handler.key) {
        case "down":
        case "space":
            presenter?.next();
            break;
        case "up":
            presenter?.previous();
            break;
    }
});
const startOverlayBtn = document.getElementById("startOverlayBtn");
startOverlayBtn.addEventListener("click", function (event) {
    window.comm.startOverlay()
    //@ts-ignore
    startOverlayBtn.disabled = true;
    startOverlayBtn.innerHTML = "Starting Overlay..."
})


window.comm.onOverlayStarted((server) => {
    const serverAddress = document.getElementById("serverAddress");
    serverAddress.innerHTML = server.url;
    startOverlayBtn.classList.add("stop-overlay-btn")
    startOverlayBtn.innerHTML = "Stop Overlay"
})