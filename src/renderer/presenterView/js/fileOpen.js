import Slide from "../../js/Classes/Slide";
import ShowPresenterView from "../../js/Classes/ShowPresenterViewClass";
import hotkeys from "hotkeys-js";

let present;

window.file.onFileParams(function (fileParams) {
  console.log(fileParams);
  let presentation = JSON.parse(fileParams["content"]);
  let slides = presentation.map((e) => new Slide(e));

  let slidePreviewCanv = document.getElementById("currentSlideThumbCanvas");
  console.log(slidePreviewCanv);
  present = new ShowPresenterView({
    container: "currentSlideThumbCanvas",
    sidebarSlidesContainer: document.getElementById("sidebarSlidesContainer"),
    lyricsContainer: document.getElementById("textSlidesList"),
    width: (slidePreviewCanv.clientHeight * 16) / 9,
    height: slidePreviewCanv.clientHeight,
    slides,
    basePath: fileParams.basePath,
    mode: fileParams.mode,
    sepBy: fileParams.sepBy,
  });
  hotkeys("down,ctrl+o,up,space", function (event, handler) {
    switch (handler.key) {
      case "down":
      case "space":
        present.changeSlide();
        comm.toPresentation({ type: "change", data: 1 });
        break;
      case "up":
        present.changeSlide(-1);
        comm.toPresentation({ type: "change", data: -1 });
        break;
    }
  });
});
