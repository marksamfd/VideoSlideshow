import Slide from "./Slide";

/**
 * Manages a collection of slides, providing methods to add, remove, and navigate slides.
 *
 * @class
 * @classdesc SlideManager handles the storage and manipulation of Slide objects, maintaining the current slide index and providing accessors for slides and indices.
 *
 * @param {Slide[]} [initialSlides=[]] - Optional array of initial slides to populate the manager.
 *
 * @example
 * const manager = new SlideManager([slide1, slide2]);
 * manager.addSlide(slide3);
 * manager.removeSlide();
 * console.log(manager.currentSlide);
 */
class SlideManager {
  _slides = [];
  #current = -1;
  _onSlideChange;

  constructor(props) {
    console.log(props);
    this._slides = [...props.slides];
    this._onSlideChange = props.onSlideChange;
    this.#current = this._slides.length > 0 ? 0 : -1;
    console.log(`${this.constructor.name} initialized `, this._onSlideChange);
  }

  addSlide(slide, index = Number(this.#current) + 1) {
    // Handle edge case when no slides exist
    if (this._slides.length === 0) {
      this._slides.push(slide);
      this.#current = 0;
      console.log("Added first slide, new length:", this._slides.length);
      this.setCurrent(this.#current);
      return this.#current;
    }

    index = Math.min(index, this._slides.length);
    console.log("Adjusted index:", index);

    this._slides.splice(index, 0, slide);
    this.setCurrent(index);

    return this.#current;
  }

  removeSlide() {
    if (this.#current === -1) return;
    this._slides.splice(this.#current, 1);
    let removedSlideIdx = this.#current;
    this.setCurrent(Math.max(0, this.#current - 1));
    return removedSlideIdx;
  }

  updateTextFont(fontName, index = this.#current) {
    this._slides[index].setFontName(fontName);
  }
  updateTextPosition(x, y, index = this.#current) {
    this._slides[index].setTextPosition({ x, y });
  }
  updateSlideText(text, index = this.#current) {
    this._slides[index].setText(text);
  }
  updateSlideVideo(videoName, index = this.#current) {
    this._slides[index].setVideoFileName(videoName);
  }

  /**
   * Toggles the muted state of the slide at the specified index.
   * If no index is provided, toggles the muted state of the current slide.
   *
   * @param {number} [index=this.#current] - The index of the slide to toggle mute on.
   * @returns {boolean} - The new muted state of the slide (true if muted, false otherwise).
   */
  toggleMuteSlide(index = this.#current) {
    return this._slides[index].toggleMuted();
  }

  toggleSlideBackground(index = this.#current) {
    return this._slides[index].toggleBackground();
  }

  get currentSlide() {
    return this._slides[this.#current];
  }

  get currentIndex() {
    return this.#current;
  }

  setCurrent(index) {
    this.#current = index;
    this._onSlideChange?.();
  }

  get allSlides() {
    return [...this._slides];
  }

  toJSON() {
    return this._slides;
  }
}
export default SlideManager;
