import Konva from "konva";

class ShowPresentationBase extends Konva.Stage {
    #w;
    #h;
    #textToHeightRatio = 0.125
    #textToSpacingRatio = .65
    _basePath;
    #simpleText;
    #background;
    #textSlides;
    #currentSlide
    #currentTextSlide;
    _slides
    #textLayer;
    #textBG;
    #padding = 20;
    _backgroundObjs;
    _mode;
    _sepBy;
    static WORDS = "words";
    static DELIMITER = "delimiter";

    get slides() {
        return this._slides;
    }

    get basePath() {
        return this._basePath;
    }

    get mode() {
        return this._mode;
    }

    get sepBy() {
        return this._sepBy;
    }

    /**
     * Creates Video Object for a slide
     * @param {Slide} slide - Slide to create its video Element
     * @return {HTMLElement}
     */
    _createBackground(slide) {
        return new Image();
    }

    /**
     * Create video objects for caching.
     * @param {number} numOfVideos - Number of videos to be cached after the current video
     */
    _cacheBG(numOfVideos = 3) {
        return this._slides.slice(this.#currentSlide + 2, this.#currentSlide + 2 + numOfVideos).map(this._createBackground.bind(this))
    }

    /**
     * Create a Presentation.
     * @param {presentation_Props} props - presentation props
     */
    constructor(props) {
        super(props);
        this._slides = props.slides
        this.#w = props.width
        this.#h = props.height
        this._basePath = props.basePath
        this._mode = props.mode
        this._sepBy = props.sepBy
        this.#currentSlide = 0
        this.#currentTextSlide = 0
        this.#textSlides = this._slides[this.#currentSlide].splitText(
            this._mode,
            this._sepBy
        )
        this._backgroundObjs = this._slides.slice(0, 3).map(this._createBackground.bind(this))
        console.log(this._backgroundObjs)

        this.baseLayer = new Konva.Layer();
        this.#textLayer = new Konva.Layer();

        this.#background = new Konva.Image({
            image: this._backgroundObjs[0],
            x: 0,
            y: 0,
            width: this.width(),
            height: this.height(),
        });

        console.log((this.height() - 225) / this.height(),)
        this.#simpleText = new Konva.Text({
            x: 0,
            y: this.height() * this.#textToSpacingRatio,
            text: `${this.#textSlides[this.#currentTextSlide]}\u202e`,
            /*
             \u200f The right-to-left mark (RLM) is a non-printing character used in the computerized typesetting of bi-directional
             text containing a mix of left-to-right scripts (such as Latin and Cyrillic) and right-to-left scripts
             (such as Arabic, Syriac, and Hebrew).
             https://en.wikipedia.org/wiki/Right-to-left_mark
             https://github.com/konvajs/konva/issues/552
            */
            fontSize: this.height() * this.#textToHeightRatio,
            fontFamily: 'Calibri',
            fill: 'white',
            id: "text",
            draggable: false,
            width: this.width(),
            align: "center",
            cornerRadius: 20,
            fontStyle: "bold",
            lineHeight:1.25
        });

        this.#textBG = new Konva.Rect({
            // x: this.#w / 2 - this.#simpleText.getTextWidth() / 2 - this.#padding / 2,
            x: this.#simpleText.getClientRect().x - this.#padding / 2,
            y: this.#simpleText.getClientRect().y - this.#padding / 2,
            height: this.#simpleText.getClientRect().height + this.#padding,
            width: this.#simpleText.getTextWidth() + this.#padding,
            cornerRadius: 20,
            fill: "#000",
            opacity: .5
        })

        this.baseLayer.add(this.#background);

        this.#textLayer.getCanvas()._canvas.setAttribute("dir","rtl")
        this.#textLayer.add(this.#textBG)
        this.#textLayer.add(this.#simpleText)

        this.add(this.baseLayer);
        this.add(this.#textLayer)

        this.baseLayer.draw();
    }

    /**
     * Changes the slides dynamically the lyrics first then the video
     * @param number
     * @return {{currentTextSlide:number, isNewSlide: boolean, currentSlide:number}}
     */
    changeSlide(number = 1) {
        this.#currentTextSlide += number
        let isNewSlide = false
        if (this.#currentTextSlide < this.#textSlides.length && this.#currentTextSlide >= 0) {
            this.#simpleText.text(`${this.#textSlides[this.#currentTextSlide]}`)
        } else if (this.#currentTextSlide === this.#textSlides.length && this.#currentSlide !== this._slides.length - 1) {
            this.#currentTextSlide = 0
            this.#currentSlide++
            this.#textSlides = this._slides[this.#currentSlide].splitText(
                this._mode,
                this._sepBy
            )
            this.#simpleText.text(`${this.#textSlides[this.#currentTextSlide]}\u202e`)
            isNewSlide = true

            if (this.#currentSlide === this._backgroundObjs.length - 2) {
                this._backgroundObjs.push(...this._cacheBG())
                console.log(this._backgroundObjs)
            }
            this.#background.setAttr("image", this._backgroundObjs[this.#currentSlide])
        } else if (this.#currentTextSlide < 0 && this.#currentSlide !== 0) {
            this.#currentSlide--
            this.#textSlides = this._slides[this.#currentSlide].splitText(
                this._mode,
                this._sepBy
            )
            this.#currentTextSlide = this.#textSlides.length + this.#currentTextSlide
            this.#simpleText.text(`${this.#textSlides[this.#currentTextSlide]}`)
            isNewSlide = true
            this.#background.setAttr("image", this._backgroundObjs[this.#currentSlide])
        } else if (this.#currentTextSlide < 0 && this.#currentSlide === 0) {
            this.#currentTextSlide = 0
        } else {
            this.#currentTextSlide = this.#textSlides.length - 1
        }

        this.#textBG.setAttrs({
            x: this.#w / 2 - this.#simpleText.getTextWidth() / 2 - this.#padding / 2,
            y: this.#simpleText.getClientRect().y - this.#padding / 2,
            height: this.#simpleText.getClientRect().height + this.#padding,
            width: this.#simpleText.getTextWidth() + this.#padding,
        })
        console.log(`Text ${this.#currentTextSlide + 1} of ${this.#textSlides.length},`,
            `Slide ${this.#currentSlide + 1} of ${this._slides.length},\n`,
            `Text Height: ${this.#simpleText.getClientRect().y - this.#padding / 2}`,
            `compare to height: ${+this.#simpleText.getClientRect().y - this.#padding / 2}`)
        return {currentTextSlide: this.#currentTextSlide, currentSlide: this.#currentSlide, isNewSlide}
    }

}

export default ShowPresentationBase