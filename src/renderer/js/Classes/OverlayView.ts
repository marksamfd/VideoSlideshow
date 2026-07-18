import PresentationCanvasRenderer from "./CanvasRenderer/PresentationCanvasRendererClass";
import BaseViewport, { BaseViewportProps } from "./BaseViewport";
import CanvasRenderer from "./CanvasRenderer/CanvasRendererClass";
import OverlayCanvasRenderer from "./CanvasRenderer/OverlayCanvasRendererClass";

export default class OverlayView extends BaseViewport {
  declare canvas: OverlayCanvasRenderer;

  constructor(props: BaseViewportProps) {
    super(props);


    this.loadLyricsFromPreviousSlide = false;
    this.canvas.renderSlide(this.slides.currentSlide);
    this.lyrics.loadSlide(
      this.slides.currentSlide,
      this.loadLyricsFromPreviousSlide,
    );
    this.onLyricChange();
  }

  protected createCanvasRenderer(props: BaseViewportProps): CanvasRenderer {
    return new OverlayCanvasRenderer({
      container: props.container,
      width: (props.height * 16) / 9,
      height: props.height,
    });
  }
}
