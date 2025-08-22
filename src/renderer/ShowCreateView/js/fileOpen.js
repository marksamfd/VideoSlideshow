import Slide from "../../js/Classes/Slide";
import ShowCreator from "../../js/Classes/ShowCreator";
import hotkeys from "hotkeys-js";

/**
 * @type {ShowCreator}
 */
let present;
let sentCloseSignal = false;

window.file.onFileParams(function (fileParams) {
  console.log(fileParams);
  let presentation = JSON.parse(fileParams["content"]);
  let slides = presentation.map((e) => new Slide(e));
  let slidePreviewCanv = document.getElementById("currentSlideThumbCanvas");

  present = new ShowCreator({
    slides: [...slides],
    sidebarSlidesContainer: document.getElementById("sidebarSlidesContainer"),
    container: "currentSlideThumbCanvas",
    width: slidePreviewCanv.clientWidth,
    height: slidePreviewCanv.clientHeight,
    splitStrategy: fileParams.mode,
    splitDelimiter: fileParams.sepBy,
    addSlideBtn: document.querySelector(`#slideAdd`),
    removeSlideBtn: document.querySelector(`#slideDelete`),
    textEditorField: document.querySelector("textarea"),
    fontSelector: document.querySelector("#fontSelector"),
    backgroundEnabledBtn: document.querySelector("#backgroundEnabledBtn"),
    videoToolbar: document.querySelector("#videoToolbar"),
  });

  window.file.onSaveBeforeQuit(async () => {
    if (!sentCloseSignal) {
      sentCloseSignal = true;
      console.log("Saving data before quitting...");
      if (await file.saveAndQuit(present.stringifyShow())) {
        window.file.saveDone();
      }
    }
  });
});
hotkeys("delete,ctrl+s", function (event, handler) {
  switch (handler.key) {
    case "delete":
      present?.removeSlide();
      break;
    case "ctrl+s":
      file.save(present.stringifyShow());
      console.log(present.stringifyShow());
  }
});

window.comm.onSlideshowInitialized(() => {
  comm.startSlideshow(present.stringifyShow());
});

/* window.comm.onSlideshowDestroy(() => {
  present?.destroyCreator();
});
window.onbeforeunload = () => {
    console.log("Destroying show")
    present?.destroyCreator()
}
 */
