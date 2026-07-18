import {PresenterCanvasRenderer} from "./CanvasRenderer/PresenterCanvasRendererClass";
import BaseViewport, {BaseViewportProps} from "./BaseViewport";
import SidebarRenderer, {SidebarRendererProps} from "./SidebarRendererClass";
import LyricRenderer, {LyricRendererConfig} from "./LyricRenderer";

type PresenterViewportProps = BaseViewportProps & SidebarRendererProps & LyricRendererConfig

class PresenterView extends BaseViewport {
    sidebar: SidebarRenderer;
    lyricRenderer: LyricRenderer
    declare canvas: PresenterCanvasRenderer;

    protected initializeViewport() {
        super.initializeViewport();
        this.renderInitialSlides()
        this.lyricRenderer?._attachEventListeners();
        this.sidebar?._attachEventListeners();
    }

    constructor(props: PresenterViewportProps) {
        super(props);
        this.slides.setCurrent(0);
        this.sidebar = new SidebarRenderer({
            sidebarSlidesContainer: props.sidebarSlidesContainer,
            onSlideClickfn: this.onSlideClicked.bind(this),
        });
        this.lyricRenderer = new LyricRenderer({
            lyricsContainer: props.lyricsContainer,
            onLyricClickCallback: this.onLyricClicked.bind(this),
        })
        this.initializeViewport();
    }

    onSlideClicked(slideNumber: number | string) {
        this.slides.setCurrent(Number(slideNumber));
        console.log(`Slide ${slideNumber} clicked`);
    }

    override onLyricChange() {
        super.onLyricChange();
        this.lyricRenderer?.heighlightLyric(this.lyrics.getCurrentLyricIdx());

    }

    onLyricClicked(lyricIdx: number) {
        if (lyricIdx === undefined || lyricIdx === null) return;
        this.lyrics.setCurrent(lyricIdx);
        this.canvas.rendertext(this.lyrics.getCurrentLyric());
        this.lyricRenderer?.heighlightLyric(lyricIdx);
    }

    override onSlideChange() {
        super.onSlideChange();
        this.sidebar?.setCurrentSlide(this.slides.currentIndex)
        this.lyricRenderer?.renderLyricsPreview(this.lyrics.getAllLyrics());
        this.lyricRenderer?.heighlightLyric(this.lyrics.getCurrentLyricIdx());

    }

    createCanvasRenderer(props: BaseViewportProps) {
        return new PresenterCanvasRenderer({
            container: props.container,
            width: (props.height * 16) / 9,
            height: props.height,
        });
    }

    private renderInitialSlides() {
        this.sidebar?.clear();

        if (this.slides.allSlides.length === 0) {
            return;
        }

        this.slides.allSlides.forEach((slide, idx) => {
            this.sidebar.addSlideElement(
                slide,
                idx,
                idx === this.slides.currentIndex,
            );

            if (idx === this.slides.currentIndex) {
                this.onSlideChange();
            }
        });
    }
}

export default PresenterView;
