import Slide from "./Slide";

interface LyricManagerProps {
  onFinishedLyricCallback?: () => void;
  onPreviousLyricCallback?: () => void;
  splitStrategy: string;
  splitDelimiter: string | number;
  onLyricChangeCallback?: () => void;
}

export default class LyricManager {
  static STRAT_DELIMETER = "delim";
  static STRAT_WORDS = "words";
  onFinished?: () => void;
  onPrevious?: () => void;
  splitStrategy: string;
  splitDelimiter: string | number;
  currentSlide: null | Slide;
  lyricChunks: string[];
  currentIndex: number;
  onLyricChanged?: () => void;
  constructor(props: LyricManagerProps) {
    this.onFinished = props.onFinishedLyricCallback;
    this.onPrevious = props.onPreviousLyricCallback;
    this.onLyricChanged = props.onLyricChangeCallback;
    this.splitStrategy = props.splitStrategy;
    this.splitDelimiter = props.splitDelimiter;
    this.currentSlide = null;
    this.lyricChunks = [];
    this.currentIndex = 0;
  }
  loadSlide(slide: Slide, loadedFromPrevious = false) {
    this.currentSlide = slide;
    this.lyricChunks = this.splitIntoChunks(slide.text);
    this.currentIndex = loadedFromPrevious && this.lyricChunks.length > 0
      ? this.lyricChunks.length - 1
      : 0;
  }

  splitIntoChunks(text: string) {
    let subtitledText = [];

    if (this.splitStrategy === LyricManager.STRAT_WORDS) {
      this.splitDelimiter = Number(this.splitDelimiter);
      let textSplit = text.split(" ");
      for (let i = 0; i < textSplit.length; i += this.splitDelimiter) {
        subtitledText.push(
          textSplit.slice(i, i + this.splitDelimiter).join(" ")
        );
      }
    } else {
      subtitledText = text.split(this.splitDelimiter as string);
    }
    console.log(subtitledText);
    return subtitledText;
  }
  getCurrentLyric() {
    return this.lyricChunks[this.currentIndex] || "";
  }

  setCurrent(idx: number) {
    this.currentIndex = idx;
  }
  getCurrentLyricIdx() {
    return this.currentIndex;
  }

  getAllLyrics() {
    return this.lyricChunks;
  }
  next() {
    if (this.currentIndex < this.lyricChunks.length - 1) {
      this.currentIndex++;
      this.onLyricChanged?.();
    } else {
      this.onFinished?.(); // Notify Orchestrator to go to next slide
    }
  }

  previous() {
    if (this.currentIndex === 0) {
      this.onPrevious?.(); // Notify Orchestrator to go to Previous slide
      this.onLyricChanged?.();
    } else {
      this.currentIndex--;
    }
  }
  reset() {
    this.currentIndex = 0;
  }
}
