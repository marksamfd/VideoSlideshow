import SlideManager from "./SlideManager";
import LyricManager from "./LyricManager";
import LyricRenderer from "./LyricRenderer";
import Slide from "./Slide";
import CanvasRendererClass from "./CanvasRenderer/CanvasRendererClass";

export interface BaseViewportProps {
    slides: Slide[];
    splitStrategy?: string;
    splitDelimiter?: string | number;
    mode?: string;
    sepBy?: string | number;
    container: string;
    width?: number;
    height: number;
}


abstract class BaseViewport {
    slides: SlideManager;
    lyrics: LyricManager;
    lyricRenderer?: LyricRenderer;
    canvas: CanvasRendererClass;
    loadLyricsFromPreviousSlide: boolean;

    constructor(props: BaseViewportProps) {
        const splitStrategy = props.splitStrategy ?? props.mode ?? "words";
        const splitDelimiter = props.splitDelimiter ?? props.sepBy ?? 4;

        this.slides = new SlideManager({
            slides: props.slides,
            onSlideChange: this.onSlideChange.bind(this),
        });

        this.lyrics = new LyricManager({
            onFinishedLyricCallback: () => this.onLyricsSlideFinished(),
            onPreviousLyricCallback: () => this.onLyricsSlidePrevious(),
            onLyricChangeCallback: () => this.onLyricChange(),
            splitStrategy,
            splitDelimiter,
        });

        this.loadLyricsFromPreviousSlide = false;
        this.canvas = this.createCanvasRenderer(props);
    }

    protected abstract createCanvasRenderer(props: BaseViewportProps): CanvasRendererClass;

    protected initializeViewport() {
        this.attachBaseEventListeners();
    }

    attachBaseEventListeners() {
        this.canvas._attachEventListeners();
        this.lyricRenderer?._attachEventListeners();
    }

    onSlideChange() {
        if (!this.slides.currentSlide) return;

        this.canvas.renderSlide(this.slides.currentSlide);
        this.lyrics.loadSlide(
            this.slides.currentSlide,
            this.loadLyricsFromPreviousSlide,
        );
        this.loadLyricsFromPreviousSlide = false;


        this.canvas.renderTextPosition(this.slides.currentSlide.textPosition);
        this.canvas.rendertext(this.lyrics.getCurrentLyric());
        this.canvas.renderTextProps({
            fontFamily: this.slides.currentSlide.fontFamily,
        });
        this.canvas.renderTextBackground(this.slides.currentSlide.fontBackground);
    }

    onLyricChange() {
        this.canvas.rendertext(this.lyrics.getCurrentLyric());
    }

    onLyricsSlideFinished() {
        this.slides.setCurrent(this.slides.currentIndex + 1);
    }

    onLyricsSlidePrevious() {
        this.loadLyricsFromPreviousSlide = true;
        this.slides.setCurrent(this.slides.currentIndex - 1);
    }


    next() {
        this.lyrics.next();
    }

    previous() {
        this.lyrics.previous();
    }
}

export default BaseViewport;
