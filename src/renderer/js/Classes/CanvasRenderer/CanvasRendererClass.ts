import Slide, {SlideFont, SlideFontBackground} from "../Slide";
import Konva from "konva";
// TODO: https://chatgpt.com/share/6889bfdd-c3b0-8002-bf5b-9b05270064f0
import Utils from "../Utils";
import {StageConfig} from "konva/lib/Stage";
import {TextConfig} from "konva/lib/shapes/Text";

declare global {
    interface Window {
        slideFiles?: {
            addSlideFiles?: (args: {
                imgBase64: string;
                videoFilePath: string;
                imgFileName: string;
                videoFileName: string;
            }) => Promise<any>;
        };
    }
}

abstract class CanvasRenderer extends Konva.Stage {
    protected currentSlide!: Slide;

    protected baseLayer;
    protected textLayer!: Konva.Label;

    protected background;
    #textBackground;
    protected backgroundDOMObj!: CanvasImageSource;
    protected controller;
    #textToHeightRatio = 0.125;

    protected simpleText;
    #padding;

    /**
     * Sets the canvas background to a video if the provided slide contains a video file.
     * Updates the video source, sets the background image, and starts video playback and animation.
     * If no video file is present in the slide, triggers the canvas video picker.
     *
     * @private
     * @param {Slide} [slide=this.#currentSlide] - The slide object to use for setting the video background.
     */
    protected abstract setCanvasToVideo(slide: Slide): void;

    protected abstract createBackgroundElement(): CanvasImageSource;

    abstract _attachEventListeners(): void;

    constructor(props: Konva.StageConfig) {
        super(props);

        this.container().children[0].classList.add("border");
        this.container().children[0].classList.add("border-light-subtle");
        this.#padding = 0.2;
        this.controller = new AbortController();

        this.backgroundDOMObj = this.createBackgroundElement();

        this.baseLayer = new Konva.Layer();
        this.add(this.baseLayer);

        /**
         * @type {Konva.Image}
         */
        this.background = new Konva.Image({
            x: 0,
            y: 0,
            width: this.width(),
            height: this.height(),
            image: this.backgroundDOMObj,
        });

        this.simpleText = new Konva.Text({
            x: 0,
            y: 0,
            width: this.width() * 0.5,
            text: "",
            /*
                       \u200f The right-to-left mark (RLM) is a non-printing character used in the computerized typesetting of bi-directional
                       text containing a mix of left-to-right scripts (such as Latin and Cyrillic) and right-to-left scripts
                       (such as Arabic, Syriac, and Hebrew).
                       https://en.wikipedia.org/wiki/Right-to-left_mark
                       https://github.com/konvajs/konva/issues/552
                      */
            fontFamily: "Calibri",
            fill: "white",
            id: "text",
            fontSize: this.height() * this.#textToHeightRatio,
            align: "center",
            fontStyle: "bold",
            lineHeight: 1.25,
            padding: this.#padding * 10,
        });

        this.textLayer = new Konva.Label({
            x: 0,
            y: 0,
            opacity: 1,
            draggable: true,
        });

        this.#textBackground = new Konva.Tag({
            fill: "black",
            opacity: 0.5,
            cornerRadius: 12,
            padding: this.#padding * 10,
        });

        this.baseLayer.add(this.background);
        this.textLayer.add(this.#textBackground);
        this.textLayer.add(this.simpleText);
        this.baseLayer.add(this.textLayer);

        console.log(`${this.constructor.name} initialized `);
    }

    renderSlide(slide: Slide) {
        this.currentSlide = slide;
        this.setCanvasToVideo(slide);
    }

    rendertext(text: string) {
        this.simpleText.text(text);
    }

    renderTextPosition(position: { x: number; y: number }) {
        let {x, y} = position;
        this.textLayer.x(x * this.width());
        this.textLayer.y(y * this.height());
    }

    renderTextProps(textProps: TextConfig) {
        this.simpleText.setAttrs({...textProps});
    }

    renderTextBackground(props: SlideFontBackground | false) {
        if (props) {
            this.#textBackground.fill(props.color);
            this.#textBackground.opacity(props.opacity);
        } else {
            this.#textBackground.opacity(0);
        }
    }

    destroyCreator() {
        this.destroy();
    }
}

export default CanvasRenderer;
