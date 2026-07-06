import PresentationCanvasRenderer from "./CanvasRenderer/PresentationCanvasRendererClass";
import BaseViewport, { BaseViewportProps } from "./BaseViewport";
import CanvasRenderer from "./CanvasRenderer/CanvasRendererClass";
import OverlayCanvasRenderer from "./CanvasRenderer/OverlayCanvasRendererClass";

export default class OverlayView extends BaseViewport {
  declare canvas: OverlayCanvasRenderer;

  constructor(props: BaseViewportProps) {
    super(props);
    // TODO: Implement Canvas Renderer for presentation view
    // TODO: Find method to cache videos before play
    /*  -> caching in canvas renderer class
          in a record of videoname and value is video object when slide is rendered
          the video object is loaded*/

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
