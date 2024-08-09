/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {Object} presentation_Props
 * @property {string} container - container id .
 * @property {Array} slides - Array of Slide objects.
 * @property {number} width - Canvas width.
 * @property {number} height - Canvas height.
 * @property {string} basePath - The path of the base file and videos.
 * @property {string} mode - Separate by words or by delimiter.
 * @property {(number|string)} sepBy - Indicates whether the Wisdom component is present.
 * @property {number} mode - Indicates whether it is presenter view or .
 */
import ShowPresentationBase from "./ShowPresentationBaseClass";
import Konva from "konva";


/**
 * A class for creating presentation
 * @class Show
 * @extends ShowPresentationBase
 */
class Show extends ShowPresentationBase {

    /**
     * Creates Video Object for a slide
     * @param {Slide} slide - Slide to create its video Element
     * @return {HTMLElement}
     */
    _createBackground(slide) {
        let VideoObj = document.createElement('video');
        VideoObj.src =  "media://" + encodeURIComponent(slide.videoFileName + "." + slide.videoFileFormat)
        // VideoObj.src = `${this._basePath}/${slide.videoFileName}.${slide.videoFileFormat}`
        VideoObj.muted = true
        VideoObj.loop = true
        VideoObj.preload = "auto"
        return VideoObj
    }


    /**
     * Create a Presentation.
     * @param {presentation_Props} props - presentation props
     */

    constructor(props) {
        super(props)

        this._backgroundObjs[0].play()


        this.anim = new Konva.Animation(function () {
            // do nothing, animation just need to update the layer
        }, this.baseLayer);

        this.anim.start()
    }

    destroyShow() {
        this._backgroundObjs.forEach((element, index) => {
            element.pause()
            element.src = ''
            element.load()

        })
    }

    /**
     * Changes the slides dynamically the lyrics first then the video
     * @param number
     * @return {{currentTextSlide:number, isNewSlide: boolean, currentSlide:number}}
     */
    changeSlide(number = 1) {
        let {currentTextSlide, currentSlide, isNewSlide} = super.changeSlide(number)
        if (isNewSlide) {
            if (this.slides[currentSlide].videoFileName !== undefined) {
                this._backgroundObjs[currentSlide].play()
            }
            if (currentSlide !== this._slides.length - 1) {
                this._backgroundObjs[currentSlide + number].pause()
            }
        }
        return {currentTextSlide, currentSlide, isNewSlide}
    }


}

export default Show;