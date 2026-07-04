import CreatorCanvasRenderer, {CreatorCanvasRendererConfig} from "./CanvasRenderer/CreatorCanvasRendererClass";
import VideoToolbar from "./VideoToolbarClass";
import TextEditorArea, {TextEditorProps} from "./TextEditorClass";
import BaseViewport, {BaseViewportProps} from "./BaseViewport";
import Slide from "./Slide";
import SidebarRenderer, {SidebarRendererProps} from "./SidebarRendererClass";
import LyricRenderer, {LyricRendererConfig} from "./LyricRenderer";

/**
 * Manages the creation and editing of a video slideshow, including slide management,
 * sidebar rendering, canvas rendering, and event handling for UI controls.
 *
 * @class
 * @classdesc Handles the main logic for adding, removing, and updating slides,
 * as well as synchronizing UI components such as the sidebar and canvas.
 *
 */
type PresentationCreatorProps =
    BaseViewportProps
    & TextEditorProps
    & CreatorCanvasRendererConfig
    & LyricRendererConfig
    & SidebarRendererProps
    & {
    videoToolbar: HTMLDivElement;
    addSlideBtn: HTMLButtonElement;
    removeSlideBtn: HTMLButtonElement;

}

class PresentationCreatorView extends BaseViewport {
    sidebar: SidebarRenderer;
    videoToolbar: VideoToolbar;
    textEditor: TextEditorArea;
    lyricRenderer: LyricRenderer;
    declare canvas: CreatorCanvasRenderer

    #addSlideBtn;
    #removeSlideBtn;

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
     */
    //@ts-ignore

    constructor(props: PresentationCreatorProps) {
        super(props);
        this.sidebar = new SidebarRenderer({
            sidebarSlidesContainer: props.sidebarSlidesContainer,
            onSlideClickfn: this.onSlideClicked.bind(this),
        });

        this.videoToolbar = new VideoToolbar({
            container: props.videoToolbar,
            onMuteButton: () => this.onMuteButtonClicked(),
            onReplaceBtn: () => this.onReplaceButtonClicked()

        });
        this.textEditor = new TextEditorArea({
            textAreaElement: props.textAreaElement,
            fontSelectorElement: props.fontSelectorElement,
            backgroundBtnElement: props.backgroundBtnElement,
            onTextEditedFn: this.onTextEdited.bind(this),
            onFontSelectedFn: this.onFontSelected.bind(this),
            onBackgroundToggle: this.onBackgroundBtn.bind(this),
        });
        this.lyricRenderer = new LyricRenderer({
            lyricsContainer: props.lyricsContainer,
            onLyricClickCallback: this.onLyricClicked.bind(this),
        });

        this.#addSlideBtn = props.addSlideBtn;
        this.#removeSlideBtn = props.removeSlideBtn;
        this.initializeViewport();
        if (this.slides.allSlides.length === 0) {
            this.addNewSlide();
        }
        this.attachEventListeners();
        console.log(`${this.constructor.name} initialized `);
    }

    //@ts-ignore

    onSlideClicked(slideNumber: number | string) {
        this.slides.setCurrent(Number(slideNumber));
    }

    onLyricClicked(lyricIdx: number) {
        this.canvas.rendertext(this.lyrics.lyricChunks[lyricIdx])
    }

    createCanvasRenderer(props: CreatorCanvasRendererConfig) {
        return new CreatorCanvasRenderer({
            container: props.container,
            width: (props.height * 16) / 9,
            height: props.height,
            onVideoPicked: this.onVideoPicked.bind(this),
            onTextDragFn: this.onTextDrag.bind(this),
        });
    }

    attachEventListeners() {
        super.attachBaseEventListeners();
        this.#addSlideBtn.addEventListener("click", () => this.addNewSlide());
        this.#removeSlideBtn.addEventListener("click", () => this.removeSlide());

        this.videoToolbar._attachEventListeners();
        this.textEditor._attachEventListeners();
        this.sidebar._attachEventListeners();
        this.lyricRenderer?._attachEventListeners();

    }

    protected initializeViewport(): void {
        super.initializeViewport();
        this.#renderInitialSlides();
    }

    override onSlideChange() {
        super.onSlideChange();

        if (!this.slides.currentSlide) return;

        this.textEditor.setTextArea(this.slides.currentSlide.text);
        this.textEditor.setFontSelector(this.slides.currentSlide.fontFamily);
        this.textEditor.renderBackgroundBtn(
            //@ts-ignore
            !!this.slides.currentSlide.fontBackground.color,
        );

        this.videoToolbar.changeMuteButtonIcon(this.slides.currentSlide.isMuted);
        this.sidebar.setCurrentSlide(this.slides.currentIndex);
        this.lyricRenderer?.renderLyricsPreview(this.lyrics.getAllLyrics());
        this.lyricRenderer?.heighlightLyric(this.lyrics.getCurrentLyricIdx());
    }

    onMuteButtonClicked() {
        let newMuteState = this.slides.toggleMuteSlide();
        this.videoToolbar.changeMuteButtonIcon(newMuteState);
        this.canvas.changeVideoMuteState(newMuteState);
    }

    addNewSlide(
        slide = new Slide({
            //@ts-ignore

            text: {value: `Slide ${this.slides.allSlides.length + 1}`},
            video: {name: undefined, muted: true},
        }),
    ) {
        const idx = this.slides.addSlide(slide);
        this.sidebar.addSlideElement(slide, idx, true);

    }

    removeSlide() {
        const idx = this.slides.removeSlide();
        if (idx === undefined) return;
        this.sidebar.removeSlideElement(idx, this.slides.currentIndex);
    }

    //@ts-ignore

    onTextDrag({x, y}) {
        this.slides.updateTextPosition(x, y);
    }

    onTextEdited(text: string) {
        this.slides.updateSlideText(text);
        //@ts-ignore

        this.lyrics.loadSlide(this.slides.currentSlide);
        this.sidebar.rerenderSlideElementText(this.slides.currentIndex, text);
        this.lyricRenderer?.renderLyricsPreview(this.lyrics.getAllLyrics());
        this.lyricRenderer?.heighlightLyric(0);
        this.canvas.rendertext(this.lyrics.getCurrentLyric());
    }

    //@ts-ignore

    onVideoPicked(filename) {
        this.slides.updateSlideVideo(filename);
        this.sidebar.rerenderSlideThumbnail(
            this.slides.currentIndex,
            this.slides.currentSlide,
        );
        this.canvas.renderSlide(this.slides.currentSlide);
    }

    //@ts-ignore

    onFontSelected(font) {
        this.slides.updateTextFont(font);
        this.canvas.renderTextProps({fontFamily: font});
    }

    onBackgroundBtn() {
        let backgroundProps = this.slides.toggleSlideBackground();
        this.canvas.renderTextBackground(backgroundProps);
    }

    onLyricChange() {
        super.onLyricChange();
        this.lyricRenderer?.heighlightLyric(this.lyrics.getCurrentLyricIdx());

    }

    stringifyShow() {
        return JSON.stringify(this.slides);
    }

    #renderInitialSlides() {
        this.sidebar.clear();

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

    private onReplaceButtonClicked() {
        this.canvas.pickVideoFile()
    }
}

export default PresentationCreatorView;
