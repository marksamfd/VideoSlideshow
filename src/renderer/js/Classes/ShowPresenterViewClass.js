import ShowPresentationBase from "./ShowPresentationBaseClass";

/**
 * The presenter view props
 * @typedef {Object} presenter_Props
 * @property {string} container - slide preview canvas id.
 * @property {HTMLDivElement} sidebarSlidesContainer - sidebar container id.
 * @property {HTMLUListElement} lyricsContainer - lyrics id.
 * @property {Slide[]} slides - Array of Slide objects.
 * @property {number} width - Canvas width.
 * @property {number} height - Canvas height.
 * @property {string} basePath - The path of the base file and videos.
 * @property {string} mode - Separate by words or by delimiter.
 * @property {(number|string)} sepBy - Indicates whether the Wisdom component is present.
 */

/**
 * Class representing Presenter View
 * @class
 * @extends ShowPresentationBase
 */
class ShowPresenterView extends ShowPresentationBase {

    #lyricsContainer;
    #sideBarSlidesContainer

    /**
     * Creates Image Object for a slide
     * @param {Slide} slide - Slide to create its image Element
     * @return {HTMLElement}
     */
    _createBackground(slide) {
        let ImgObj = document.createElement('img');
        // VideoObj.src = `media-loader://${encodeURIComponent(`${this.#basePath}/${slide.videoFile}`)}`
        ImgObj.src = `file://${this.basePath}/${slide.videoFileName}.${slide.videoThumbnailFormat}`
        return ImgObj
    }

    /**
     * Creates sidebar preview Object for a slide
     * @param {Slide} slide - Slide to create its image Element
     */
    #createSlideSidebarPreview(slide) {
        let slideContainer = document.createElement("li");
        slideContainer.className = "list-group-item list-group-item-action d-box"

        let divContainer = document.createElement("div");
        divContainer.className = "slideThumbContainer";

        let slideThumbPreview = document.createElement("img");
        slideThumbPreview.className = "slideThumb";
        slideThumbPreview.src = `file://${this.basePath}/${slide.videoFileName}.${slide.videoThumbnailFormat}`;
        let slidePrevTextContainer = document.createElement("span");
        slidePrevTextContainer.className = "slideText";
        slidePrevTextContainer.innerText = slide.text
        slidePrevTextContainer.dir = "rtl"

        divContainer.appendChild(slideThumbPreview);
        divContainer.appendChild(slidePrevTextContainer);

        slideContainer.appendChild(divContainer);

        return slideContainer;
    }

    /**
     * Creates sidebar preview Object for a slide
     * @param {Slide} slide
     * @return {HTMLLIElement[]}
     */
    #createLyricsPreview(slide) {
        let lyricsLines = slide.splitText(this._mode, this._sepBy);
        return lyricsLines.map((line, i) => {
            // <li data-textSlideNumber="0" class="active-text-slide">ها بطيب</li>
            let liEl = document.createElement("li");
            liEl.textContent = line
            liEl.dataset.textslidenumber = i
            liEl.dir = "rtl"
            return liEl
        });
    }

    /**
     * Create a Presenter View.
     * @param {presenter_Props} props - presentation props
     */
    constructor(props) {
        super(props);
        this.#sideBarSlidesContainer = props.sidebarSlidesContainer
        this.#lyricsContainer = props.lyricsContainer


        let addSlideBtn = document.querySelector(`#${this.#sideBarSlidesContainer.id}>:first-child`);

        this._slides.forEach(slide => {
            this.#sideBarSlidesContainer.insertBefore(this.#createSlideSidebarPreview(slide), addSlideBtn)
        })

        this.#lyricsContainer.replaceChildren(...this.#createLyricsPreview(this._slides[0]))

        this.#sideBarSlidesContainer.children[0].classList.add("active");
        this.#lyricsContainer.children[0].classList.add("active-text-slide");
    }

    /**
     * Changes the slides dynamically the lyrics first then the video
     * @param number
     * @return {{currentTextSlide:number, isNewSlide: boolean, currentSlide:number}}
     */

    changeSlide(number = 1) {
        let scrollBehaviour = {behavior: "smooth", block: "center"}
        let {currentSlide, currentTextSlide, isNewSlide} = super.changeSlide(number);

        if (isNewSlide) {
            let currentActive = this.#sideBarSlidesContainer.children[currentSlide]
            this.#lyricsContainer.replaceChildren(...this.#createLyricsPreview(this._slides[currentSlide]))
            this.#lyricsContainer.children[currentTextSlide].classList.add("active-text-slide");
            currentActive.classList.add("active");
            currentActive.scrollIntoView(scrollBehaviour)
            this.#sideBarSlidesContainer.children[currentSlide - number].classList.remove("active");
        } else {
            this.#lyricsContainer.children[currentTextSlide].classList.add("active-text-slide");
            this.#lyricsContainer.children[currentTextSlide].scrollIntoView(scrollBehaviour)
            if (this.#lyricsContainer.children.length > 1) {
                this.#lyricsContainer.children[currentTextSlide - number].classList.remove("active-text-slide");
            }
        }

        return {currentSlide, currentTextSlide, isNewSlide}
    }

}

export default ShowPresenterView;