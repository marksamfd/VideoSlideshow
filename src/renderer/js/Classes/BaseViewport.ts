import SlideManager from "./SlideManager";
import LyricManager from "./LyricManager";
import Slide from "./Slide";
import CanvasRendererClass from "./CanvasRenderer/CanvasRendererClass";
import Konva from "konva";

export type BaseViewportProps = {
    slides: Slide[];
    splitStrategy?: string;
    splitDelimiter?: string | number;
    mode?: string;
    sepBy?: string | number;
    notifySlideChange?: (current: string) => void;
} & Konva.StageConfig;


abstract class BaseViewport {
    slides: SlideManager;
    lyrics: LyricManager;
    canvas: CanvasRendererClass;
    loadLyricsFromPreviousSlide: boolean;
    notifySlideChange: (current: string) => void;

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
        this.notifySlideChange = props.notifySlideChange ?? (() => {
        });
    }

    protected abstract createCanvasRenderer(props: BaseViewportProps): CanvasRendererClass;

    protected initializeViewport() {
        this.attachBaseEventListeners();
    }

    attachBaseEventListeners() {
        this.canvas._attachEventListeners();
    }

    onSlideChange() {
        if (!this.slides.currentSlide) return;

        this.canvas.renderSlide(this.slides.currentSlide);
        this.lyrics.loadSlide(
            this.slides.currentSlide,
            this.loadLyricsFromPreviousSlide,
        );
        this.loadLyricsFromPreviousSlide = false;
    }

    onLyricChange() {
        this.canvas.rendertext(this.lyrics.getCurrentLyric());
        this.canvas.renderTextPosition(this.slides.currentSlide.textPosition);
        this.canvas.renderTextBackground(this.slides.currentSlide.fontBackground);
        this.canvas.renderTextProps({fontFamily: this.slides.currentSlide.fontFamily});
        this.notifySlideChange?.(`${this.slides.currentIndex}:${this.lyrics.currentIndex}`)
    }

    onLyricsSlideFinished() {
        this.loadLyricsFromPreviousSlide = false
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

    changeSlide(current: string) {
        const [slideIdx, lyricIdx] = current.split(":");
        if (Number(slideIdx) !== this.slides.currentIndex)
            this.slides.setCurrent(Number(slideIdx))
        if (Number(lyricIdx) !== this.lyrics.currentIndex)
            this.lyrics.setCurrent(Number(lyricIdx))
    }

}

export default BaseViewport;
