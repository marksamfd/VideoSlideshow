import PresentationCanvasRenderer from "./CanvasRenderer/PresentationCanvasRendererClass";
import BaseViewport, {BaseViewportProps} from "./BaseViewport";
import CanvasRenderer from "./CanvasRenderer/CanvasRendererClass";

export default class PresentationView extends BaseViewport {

    declare canvas: PresentationCanvasRenderer;

    constructor(props: BaseViewportProps) {
        super(props);
        this.loadLyricsFromPreviousSlide = false;
        this.canvas.cacheVideo(this.slides.currentSlide);
        this.canvas.renderSlide(this.slides.currentSlide);
        this.lyrics.loadSlide(this.slides.currentSlide, this.loadLyricsFromPreviousSlide);
        this.canvas.cacheVideo(this.slides.nextSlide);
        this.onLyricChange();
    }

    onSlideChange() {
        super.onSlideChange();
        this.canvas.cacheVideo(this.slides.nextSlide);
    }

    protected createCanvasRenderer(props: BaseViewportProps): CanvasRenderer {
        return new PresentationCanvasRenderer({
            container: props.container,
            width: (props.height * 16) / 9,
            height: props.height,
        });
    }


}
