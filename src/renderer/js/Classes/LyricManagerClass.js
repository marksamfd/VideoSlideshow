export default class LyricManager {
  static STRAT_DELIMETER = "delim";
  static STRAT_WORDS = "words";
  constructor(props) {
    this.onFinished = props.onFinishedSlideCallback;
    this.onPrevious = props.onPreviousSlideCallback;
    this.splitStrategy = props.splitStrategy;
    this.splitDelimiter = props.splitDelimiter;
    this.currentSlide = null;
    this.lyricChunks = [];
    this.currentIndex = 0;
  }
  loadSlide(slide) {
    this.currentSlide = slide;
    this.lyricChunks = this.splitIntoChunks(slide.text);
    this.currentIndex = 0;
  }

  splitIntoChunks(text) {
    let subtitledText = [];

    if (this.splitStrategy === LyricManager.STRAT_WORDS) {
      this.splitDelimiter *= 1;
      let textSplit = text.split(" ");
      for (let i = 0; i < textSplit.length; i += this.splitDelimiter) {
        subtitledText.push(
          textSplit.slice(i, i + this.splitDelimiter).join(" ")
        );
      }
    } else {
      subtitledText = text.split(this.splitDelimiter);
    }
    console.log(subtitledText);
    return subtitledText;
  }
  getCurrentLyric() {
    return this.lyricChunks[this.currentIndex] || "";
  }

  next() {
    if (this.currentIndex < this.lyricChunks.length - 1) {
      this.currentIndex++;
    } else {
      this.onFinished?.(); // Notify ShowCreator to go to next slide
    }
  }

  previous() {
    if (this.currentIndex === 0) {
      this.onPrevious?.();
    } else {
      this.currentIndex--;
    }
  }
  reset() {
    this.currentIndex = 0;
  }
}
