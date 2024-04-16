/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {Object} presentation_Props
 * @property {string} basePath - Indicates whether the Courage component is present.
 * @property {boolean} hasPower - Indicates whether the Power component is present.
 * @property {boolean} hasWisdom - Indicates whether the Wisdom component is present.
 */
/**
 * A class for creating presentation
 * @class Presentation
 */
import "konva";
class Presentation extends Konva.Stage {
    #w;
    #h;
    #basePath;
    #simpleText;
    #video;
    #textSlides;
    #currentSlide
    #currentTextSlide;
    #slides;
    #textLayer;
    #textBG;
    #padding = 30;
    #videoObjs;
    #mode;
    #sepBy;

    #createVideo(slide) {
        let VideoObj = document.createElement('video');
        VideoObj.src = `${this.#basePath}/${slide.videoFile}`
        VideoObj.muted = true
        VideoObj.loop = true
        VideoObj.preload = "auto"
        return VideoObj
    }

    /**
     * Create a point.
     * @param {presentation_Props} props - presentation props
     */

    constructor(props) {
        super(props)

        this.#slides = props.slides
        this.#w = props.width
        this.#h = props.height
        this.#basePath = props.basePath
        this.#currentSlide = 0
        this.#currentTextSlide = 0
        this.#mode = props.mode
        this.#sepBy = props.sepBy
        /*this.#textSlides = this.#slides[this.#currentSlide].splitText({
            mode: "separator",
            separator: ":"
        })*/
        this.#textSlides = this.#slides[this.#currentSlide].splitText({
            mode: this.#mode,
            sepBy:this.#sepBy
        })
        this.#videoObjs = this.#slides.map(this.#createVideo.bind(this))
        console.log(this.#videoObjs)

        this.baseLayer = new Konva.Layer();
        this.#textLayer = new Konva.Layer();

        this.#videoObjs[0].play()
        this.#video = new Konva.Image({
            image: this.#videoObjs[0],
            x: 0,
            y: 0,
            width: this.width(),
            height: this.height(),
        });

        this.#simpleText = new Konva.Text({
            x: 0,
            y: this.height() - 225,
            text: `${this.#textSlides[this.#currentTextSlide]}\u200f`,
            /*
             \u200f The right-to-left mark (RLM) is a non-printing character used in the computerized typesetting of bi-directional
             text containing a mix of left-to-right scripts (such as Latin and Cyrillic) and right-to-left scripts
             (such as Arabic, Syriac, and Hebrew).
             https://en.wikipedia.org/wiki/Right-to-left_mark
             https://github.com/konvajs/konva/issues/552
            */
            fontSize: 100,
            fontFamily: 'Calibri',
            fill: 'white',
            id: "text",
            draggable: false,
            width: this.width(),
            align: "center",
            cornerRadius: 20,
            fontStyle: "bold"
        });

        this.#textBG = new Konva.Rect({
            x: this.#w / 2 - this.#simpleText.getTextWidth() / 2 - this.#padding / 2,
            y: this.#simpleText.getClientRect().y - this.#padding / 2,
            height: this.#simpleText.getClientRect().height + this.#padding,
            width: this.#simpleText.getTextWidth() + this.#padding,
            cornerRadius: 20,
            fill: "#000",
            opacity: .5
        })

        this.anim = new Konva.Animation(function () {
            // do nothing, animation just need to update the layer
        }, this.baseLayer);

        this.anim.start()

        this.baseLayer.add(this.#video);

        this.#textLayer.add(this.#textBG)
        this.#textLayer.add(this.#simpleText)

        this.add(this.baseLayer);
        this.add(this.#textLayer)

        this.baseLayer.draw();

    }


    changeSlide(number = 1) {
        (this.#currentTextSlide += number)
        if (this.#currentTextSlide < this.#textSlides.length && this.#currentTextSlide >= 0) {
            this.#simpleText.text(`${this.#textSlides[this.#currentTextSlide]}\u200f`)
        } else if (this.#currentTextSlide === this.#textSlides.length && this.#currentSlide !== this.#slides.length - 1) {
            this.#currentTextSlide = 0
            this.#currentSlide++
            this.#textSlides = this.#slides[this.#currentSlide].splitText({
                mode: this.#mode,
                sepBy:this.#sepBy
            })
            this.#simpleText.text(`${this.#textSlides[this.#currentTextSlide]}\u200f`)
            this.#videoObjs[this.#currentSlide].play()
            this.#videoObjs[this.#currentSlide - 1].pause()
            this.#video.setAttr("image", this.#videoObjs[this.#currentSlide])
        } else if (this.#currentTextSlide < 0 && this.#currentSlide !== 0) {
            this.#currentSlide--
            this.#textSlides = this.#slides[this.#currentSlide].splitText({
                mode: this.#mode,
                sepBy:this.#sepBy
            })
            this.#currentTextSlide = this.#textSlides.length + this.#currentTextSlide
            this.#simpleText.text(`${this.#textSlides[this.#currentTextSlide]}\u200f`)
            this.#videoObjs[this.#currentSlide].play()
            this.#videoObjs[this.#currentSlide + 1].pause()
            this.#video.setAttr("image", this.#videoObjs[this.#currentSlide])
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
            `Slide ${this.#currentSlide + 1} of ${this.#slides.length}`,
            `Text Height: ${this.#simpleText.getClientRect().y - this.#padding / 2}`,
            `compare to height: ${+this.#simpleText.getClientRect().y - this.#padding / 2}`)
        return this.#currentTextSlide
    }

}

export default Presentation;