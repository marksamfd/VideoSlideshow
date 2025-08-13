import CanvasRenderer from "./CanvasRendererClass";
import SidebarRenderer from "./SidebarRendererClass";
import SlideManager from "./SlideManager";
import VideoToolbar from "./VideoToolbarClass";
import Slide from "./Slide";
import LyricManager from "./LyricManagerClass";
import TextEditorArea from "./TextEditorClass";

/**
 * Manages the creation and editing of a video slideshow, including slide management,
 * sidebar rendering, canvas rendering, and event handling for UI controls.
 *
 * @class
 * @classdesc Handles the main logic for adding, removing, and updating slides,
 * as well as synchronizing UI components such as the sidebar and canvas.
 *
 */
class ShowCreator {
  #addSlideBtn;
  #removeSlideBtn;
  #textEditorField;
  /**
   * Creates an instance of ShowCreator.
   * @param {Object} props - Configuration properties for ShowCreator.
   * @param {Slide[]} props.slides - Initial slides to load.
   * @param {HTMLElement} props.sidebarSlidesContainer - Container for sidebar slides.
   * @param {string} props.container - Canvas container element.
   * @param {number} props.width - Width of the canvas.
   * @param {number} props.height - Height of the canvas.
   * @param {HTMLElement} props.addSlideBtn - Button to add a new slide.
   * @param {HTMLElement} props.removeSlideBtn - Button to remove the current slide.
   * @param {HTMLTextAreaElement} props.textEditorField - Text area for editing slide text.
   */
  constructor(props) {
    this.slides = new SlideManager({
      slides: props.slides,
      onSlideChange: this.onSlideChange.bind(this),
    });
    this.lyrics = new LyricManager({
      onFinished: () => this.onLyricsSlideFinished(),
      onPrevious: () => this.onLyricsSlidePrevious(),
      splitStrategy: props.splitStrategy,
      splitDelimiter: props.splitDelimiter,
    });
    this.sidebar = new SidebarRenderer({
      container: props.sidebarSlidesContainer,
      onSlideClickfn: this.onSlideClicked.bind(this),
    });
    this.canvas = new CanvasRenderer({
      container: props.container,
      width: (props.height * 16) / 9,
      height: props.height,
      onVideoPicked: this.onVideoPicked.bind(this),
      onTextDragFn: this.onTextDrag.bind(this),
    });

    this.videoToolbar = new VideoToolbar({
      container: props.videoToolbar,
      onMuteButton: () => this.onMuteButtonClicked(),
    });
    this.textEditor = new TextEditorArea({
      textAreaElement: props.textEditorField,
      fontSelectorElement: props.fontSelector,
      backgroundBtnElemnt: props.backgroundEnabledBtn,
      onTextEditedFn: this.onTextEdited.bind(this),
      onFontSelectedFn: this.onFontSelected.bind(this),
      onBackgroundToggle: this.onBackgroundBtn.bind(this),
    });

    this.#addSlideBtn = props.addSlideBtn;
    this.#removeSlideBtn = props.removeSlideBtn;
    this.#textEditorField = props.textEditorField;
    this.#renderInitialSlides();
    this.#attachEventListeners();
    console.log(`${this.constructor.name} initialized `);
  }

  #attachEventListeners() {
    // hook into addSlide, removeSlide, textarea input, etc.
    this.#addSlideBtn.addEventListener("click", (e) => this.addNewSlide());
    this.#removeSlideBtn.addEventListener("click", (e) => this.removeSlide());

    this.sidebar._attachEventListeners();
    this.canvas._attachEventListeners();
    this.videoToolbar._attachEventListeners();
    this.textEditor._attachEventListeners();
  }

  onSlideChange() {
    console.log(this.slides.currentSlide);
    this.canvas.renderTextPosition(this.slides.currentSlide.textPosition);
    this.canvas.renderSlide(this.slides.currentSlide);
    this.lyrics.loadSlide(this.slides.currentSlide);
    this.canvas.rendertext(this.lyrics.getCurrentLyric());
    this.canvas.renderTextProps({
      fontFamily: this.slides.currentSlide.fontFamily,
    });

    this.textEditor.setTextArea(this.slides.currentSlide.text);
    this.textEditor.setFontSelector(this.slides.currentSlide.fontFamily);

    this.canvas.renderTextBackground(this.slides.currentSlide.fontBackground);
    this.textEditor.renderBackgroundBtn(
      !!this.slides.currentSlide.fontBackground.color
    );

    this.videoToolbar.changeMuteButtonIcon(this.slides.currentSlide.isMuted);
  }

  onLyricsSlideFinished() {
    this.slides.setCurrent(this.slides.currentIndex + 1);
  }
  onLyricsSlidePrevious() {
    this.slides.setCurrent(this.slides.currentIndex - 1);
  }

  addNewSlide(
    slide = new Slide({
      text: { value: `Slide ${this.slides.allSlides.length + 1}` },
      video: { name: undefined, muted: true },
    })
  ) {
    const idx = this.slides.addSlide(slide);
    this.sidebar.addSlideElement(slide, idx);
  }

  removeSlide() {
    const idx = this.slides.removeSlide();
    this.sidebar.removeSlideElement(idx, this.slides.currentIndex);
    //  this.#textEditorField.value = this.slides.currentSlide.text;
    // this.canvas.renderSlide(this.slides.currentSlide);
  }

  #renderInitialSlides() {
    this.sidebar.clear();
    if (this.slides.allSlides.length === 0) {
      this.addNewSlide();
    } else {
      this.slides.allSlides.forEach((s, idx) => {
        this.sidebar.addSlideElement(s, idx);

        if (idx === this.slides.currentIndex) {
          this.onSlideChange();
        }
      });
    }
  }

  onTextDrag({ x, y }) {
    this.slides.updateTextPosition(x, y);
  }
  onTextEdited(text) {
    this.slides.updateSlideText(text);
    this.lyrics.loadSlide(this.slides.currentSlide);
    this.canvas.rendertext(this.lyrics.getCurrentLyric());
    this.sidebar.rerenderSlideElementText(this.slides.currentIndex, text);
  }

  onVideoPicked(filename) {
    this.slides.updateSlideVideo(filename);
    console.log(this.slides.currentSlide);
    this.sidebar.rerenderSlideThumbnail(
      this.slides.currentIndex,
      this.slides.currentSlide
    );
    this.canvas.renderSlide(this.slides.currentSlide);
  }

  onSlideClicked(slideNumber) {
    this.slides.setCurrent(slideNumber);
  }

  onMuteButtonClicked() {
    let newMuteState = this.slides.toggleMuteSlide();
    this.videoToolbar.changeMuteButtonIcon(newMuteState);
    this.canvas.changeVideoMuteState(newMuteState);
  }
  onFontSelected(font) {
    this.slides.updateTextFont(font);
    this.canvas.renderTextProps({ fontFamily: font });
  }
  onBackgroundBtn() {
    let backgroundProps = this.slides.toggleSlideBackground();
    this.canvas.renderTextBackground(backgroundProps);
  }
  stringifyShow() {
    return JSON.stringify(this.slides);
  }
}
export default ShowCreator;
