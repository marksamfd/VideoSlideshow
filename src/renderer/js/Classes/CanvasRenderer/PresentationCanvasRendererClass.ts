import Konva from "konva";
import CanvasRenderer from "./CanvasRendererClass";
import Slide from "../Slide";

export default class PresentationCanvasRenderer extends CanvasRenderer {
  private cachedVideos: Map<string, HTMLVideoElement> = new Map();
  protected anim: Konva.Animation;

  override createBackgroundElement() {
    let videoElement = document.createElement("video");
    videoElement.autoplay = true;
    videoElement.loop = true;
    videoElement.controls = false;
    videoElement.muted = true;
    return videoElement;
  }

  override setCanvasToVideo(slide: Slide = this.currentSlide) {
    if (this.backgroundDOMObj instanceof HTMLVideoElement) {
      if (slide.videoFileName !== undefined) {
        this.container().style.background = "transparent";

        this.background.getAttr("image").pause();
        let currentVideo = this.cachedVideos.get(slide.videoFileName);
        this.background.setAttr("image", currentVideo);
        currentVideo?.play();
        return;
      }
      this.anim.start();
    }
  }
  override _attachEventListeners(): void {}

  constructor(parameters: Konva.StageConfig) {
    super(parameters);
    this.textLayer.draggable(false);
    this.anim = new Konva.Animation(function () {
      // do nothing, animation just need to update the layer
    }, this.baseLayer);

    this.anim.start();
  }

  cacheVideo(slide: Slide) {
    if (slide && slide.videoFileName) {
      const videoElement = document.createElement("video");
      videoElement.src =
        "media://local/" +
        encodeURIComponent(slide.videoFileName + "." + slide.videoFileFormat);
      videoElement.muted = slide.isMuted;
      videoElement.loop = true;
      videoElement.preload = "auto";
      this.cachedVideos.set(slide.videoFileName, videoElement);
    }
  }
}
