import Konva from "konva";
import CanvasRenderer from "./CanvasRendererClass";
import Slide from "../Slide";

export class PresenterCanvasRenderer extends CanvasRenderer {
  override createBackgroundElement() {
    let imgElement = document.createElement("img");
    return imgElement;
  }

  override setCanvasToVideo(slide: Slide = this.currentSlide) {
    if (slide.videoFileName !== undefined) {
      this.container().style.background = "transparent";
      // this.#videoObj.src = "file://" + this.#basePath + "/" + slide.videoFileName + "." + slide.videoFileFormat
      (this.backgroundDOMObj as HTMLImageElement).src =
        "media://local/" +
        encodeURIComponent(
          slide.videoFileName + "." + slide.videoThumbnailFormat,
        );
    }
  }
  override _attachEventListeners(): void {}

  constructor(parameters: Konva.StageConfig) {
    super(parameters);
    this.textLayer.draggable(false);
  }
}
