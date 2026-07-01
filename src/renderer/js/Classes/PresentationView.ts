import SlideManager from "./SlideManager";
import LyricManager from "./LyricManager";
import Slide from "./Slide";
import PresentationCanvasRenderer from "./CanvasRenderer/PresentationCanvasRendererClass";

interface PresentationViewConfig {
  container: string | HTMLDivElement;
  height: number;
  slides: Slide[];
  splitStrategy: string;
  splitDelimiter: string | number;
}

// : extend from baseport and remove duplicate defined class match ShowCreator.js
export default class PresentationView {
  private slides: SlideManager;
  private lyrics: LyricManager;
  private canvas: PresentationCanvasRenderer;
  private loadLyricsFromPreviousSlide: boolean;
  constructor(props: PresentationViewConfig) {
    this.slides = new SlideManager({
      slides: props.slides,
      onSlideChange: this.onSlideChange.bind(this),
    });
    this.lyrics = new LyricManager({
      onFinishedLyricCallback: () => this.onLyricsSlideFinished(),
      onPreviousLyricCallback: () => this.onLyricsSlidePrevious(),
      splitStrategy: props.splitStrategy,
      splitDelimiter: props.splitDelimiter,
      onLyricChangeCallback: () => this.onLyricChange(),
    });
    this.canvas = new PresentationCanvasRenderer({
      container: props.container,
      width: (props.height * 16) / 9,
      height: props.height,
    });
    // TODO: Implement Canvas Renderer for presentation view
    // TODO: Find method to cache videos before play 
      /*  -> caching in canvas renderer class
        in a record of videoname and value is video object when slide is rendered 
        the video object is loaded*/

    this.loadLyricsFromPreviousSlide = false;
    this.canvas.cacheVideo(this.slides.currentSlide);
    this.canvas.renderSlide(this.slides.currentSlide);
    this.lyrics.loadSlide(this.slides.currentSlide, this.loadLyricsFromPreviousSlide);
    this.canvas.cacheVideo(this.slides.nextSlide);
    this.onLyricChange();
  }
  onSlideChange() {
    this.canvas.renderSlide(this.slides.currentSlide);
    this.lyrics.loadSlide(this.slides.currentSlide, this.loadLyricsFromPreviousSlide);
    this.loadLyricsFromPreviousSlide = false;
    this.canvas.renderTextProps({
      fontFamily: this.slides.currentSlide.fontFamily,
    });
    this.onLyricChange();
    this.canvas.cacheVideo(this.slides.nextSlide);
  }

  onLyricChange() {
    console.log(this.lyrics.getCurrentLyric());
    this.canvas.rendertext(this.lyrics.getCurrentLyric());
    this.canvas.renderTextPosition(this.slides.currentSlide.textPosition);
    this.canvas.renderTextBackground(this.slides.currentSlide.fontBackground);
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
