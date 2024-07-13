import Slide from "./SlideClass";
import Konva from "konva";
import addVideoSvg from '../../asset/resource/video-add-svgrepo-com.svg'


/**
 * The presenter view props
 * @typedef {Object} presenter_Props
 * @property {string} container - slide preview canvas id.
 * @property {HTMLDivElement} sidebarSlidesContainer - sidebar container id.
 * @property {HTMLDivElement} slideTextEditor - sidebar container id.
 * @property {Slide[]} slides - Array of Slide objects.
 * @property {number} width - Canvas width.
 * @property {number} height - Canvas height.
 * @property {string} basePath - The path of the base file and videos.
 * @property {string} mode - Separate by words or by delimiter.
 * @property {(number|string)} sepBy - Indicates whether the Wisdom component is present.
 */

class ShowCreator extends Konva.Stage {

    /**
     * @type {[Slide]}
     */
    #slides = []
    /**
     * @type {number}
     * */
    #currentSlide = -1;
    #w;
    #h;
    #basePath;
    #sideBarSlidesContainer;
    #addSlideBtn;
    #addVidBtn;
    #baseLayer;
    #background;
    #slideTextEditor;
    #slideTextInput;
    #videoObj;
    #anim;
    #filePicker;

    #slidesRadioSelector() {
        return document.querySelectorAll(`#${this.#sideBarSlidesContainer.id} input`)
    };

    /**
     * Creates sidebar preview Object for a slide
     * @param {Slide} slide - Slide to create its image Element
     * @param {number} slideId Represent slide id in the list
     */
    #createSlideSidebarPreview(slide, slideId) {
        let slideContainer = document.createElement("li")

        let radioBtn = document.createElement("input");
        radioBtn.setAttribute("type", "radio");
        radioBtn.name = "slides"
        radioBtn.id = "s" + slideId;

        slideContainer.appendChild(radioBtn)

        slideContainer.className = "list-group-item list-group-item-action d-flex"

        let LabelContainer = document.createElement("label");
        // LabelContainer.className = "list-group-item";
        LabelContainer.setAttribute('for', 's' + slideId)

        let divInLabel = document.createElement("div");
        divInLabel.className = "slideThumbContainer ";


        let slideThumbPreview = document.createElement("img");
        slideThumbPreview.className = "slideThumb";
        if (slide.videoFileName === undefined) {
            slide.createVideoCoverImage().then(img => {
                slideThumbPreview.src = `${img}`;
            })
        } else {
            slideThumbPreview.src = "file://" + this.#basePath + "/" + slide.videoFileName + "." + slide.videoThumbnailFormat;
        }


        let slidePrevTextContainer = document.createElement("span");
        slidePrevTextContainer.className = "slideText";
        slidePrevTextContainer.innerText = slide.text
        slidePrevTextContainer.dataset.slidenumber = slideId;
        slidePrevTextContainer.dir = "rtl"
        divInLabel.appendChild(slideThumbPreview);
        divInLabel.appendChild(slidePrevTextContainer);
        LabelContainer.appendChild(divInLabel);
        slideContainer.appendChild(LabelContainer);


        return slideContainer;
    }

    #findSelectedSlidePos() {
        return [...this.#slidesRadioSelector()].findIndex(el => el.checked)
    }

    #changeSlideText(e) {
        // change slide text values and sidebar
        this.#slides[this.#currentSlide].text = e.target.value;
        this.#sideBarSlidesContainer.children[this.#currentSlide].querySelector("span").innerText = e.target.value
    }

    #onSlideClick(e) {
        /**
         * https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#event_delegation
         */
        this.#currentSlide = this.#findSelectedSlidePos()
        this.#slideTextInput.value = this.#slides[this.#currentSlide].text
        this.#videoObj.src = "file://" + this.#basePath + "/" + this.#slides[this.#currentSlide].videoFileName + "." + this.#slides[this.#currentSlide].videoFileFormat
        console.log(this.#currentSlide, this.#slides.length);

    }

    #createFilePicker() {
        let filePicker = document.createElement("input");
        filePicker.type = "file";
        filePicker.accept = "video/*";
        filePicker.addEventListener("change", this.#onVideoFilePicked.bind(this));
        return filePicker
    }

    #onImageLayerClicked(e) {
        if (this.#slides[this.#currentSlide].videoFileName === undefined) {
            this.#filePicker.click()
        }
        if (this.#videoObj.paused) {
            this.#videoObj.play();
        } else {
            this.#videoObj.pause();
        }
    }

    async #onVideoFilePicked(e) {
        let filePicker = e.target
        console.log(filePicker.files.item(0))
        let file = filePicker.files.item(0)
        let fileName = file.name
        console.log(this, fileName)
        this.#slides[this.#currentSlide].videoFileName = fileName;
        let videoBasePath = file.path.split("\\")
        videoBasePath.pop()
        videoBasePath = videoBasePath.join("\\")
        let currentSlideImg = this.#slides[this.#currentSlide]
        let generatedImage = await currentSlideImg.createVideoCoverImage(videoBasePath)
        await thumbs.create({pic: generatedImage, filename: currentSlideImg.videoFileName})
        await window.file.copyVideo(file.path)
        this.#sideBarSlidesContainer.children[this.#currentSlide].querySelector("img").src = "file://" + this.#basePath + "/" + currentSlideImg.videoFileName + "." + currentSlideImg.videoThumbnailFormat
        this.#setCanvasToVideo(currentSlideImg)
    }

    #setCanvasToVideo(/** Slide*/slide) {
        this.container().style.background = "transparent"
        this.#videoObj.src = "file://" + this.#basePath + "/" + slide.videoFileName + "." + slide.videoFileFormat
        console.log(this.#videoObj)
        this.#background.setAttrs({
            image: this.#videoObj,
            x: 0,
            y: 0,
            width: this.width(),
            height: this.height(),
        });

        this.#videoObj.play()
        this.#anim.start()

        this.#slideTextInput.value = slide.text
    }

    #createCanvasVideoPicker() {
        let imgdim = this.height() * .50
        Konva.Image.fromURL(addVideoSvg, (imageNode) => {
            this.#background.setAttrs({
                image: imageNode.image(),
                width: imgdim,
                height: imgdim,
                x: (this.width() - imgdim) / 2,
                y: (this.height() - imgdim) / 2
            });

        });
        this.container().style.background = "#000"
    }

    constructor(props) {
        super(props);
        this.#sideBarSlidesContainer = props.sidebarSlidesContainer
        this.#slideTextEditor = props.slideTextEditor
        this.#slideTextInput = this.#slideTextEditor.querySelector(`textarea`);


        this.#basePath = props.basePath
        this.#slides = props.slides

        console.log(this.#slides)
        this.#addSlideBtn = document.querySelector(`#slideAdd`);

        this.#videoObj = document.createElement("video");
        this.#videoObj.autoplay = true;
        this.#videoObj.loop = true
        this.#videoObj.muted = true


        this.#filePicker = this.#createFilePicker()


        this.#baseLayer = new Konva.Layer({});
        this.add(this.#baseLayer)

        this.#addSlideBtn.addEventListener("click", () => {
            this.addNewSlide()
        })
        this.#sideBarSlidesContainer.addEventListener("change", this.#onSlideClick.bind(this))
        this.#slideTextInput.addEventListener("input", this.#changeSlideText.bind(this))

        this.#anim = new Konva.Animation(function () {
            // do nothing, animation just need to update the layer
        }, this.#baseLayer);

        this.#anim.start()

        this.#baseLayer.on('mouseover', function (evt) {
            var shape = evt.target;
            document.body.style.cursor = 'pointer';

        });
        this.#baseLayer.on('mouseout', function (evt) {
            var shape = evt.target;
            document.body.style.cursor = 'default';
        });

        this.#baseLayer.on('click', this.#onImageLayerClicked.bind(this))

        /**
         *
         * @type {Konva.Image}
         */
        this.#background = new Konva.Image({
            x: 0, y: 0, width: this.width(), height: this.height(),
        });

        this.#baseLayer.add(this.#background)

        this.slideNumber = 0

        // mapping slides must be at end
        this.#slides.forEach(slide => this.addNewSlide(slide))


        if (this.#slides.length === 0) {
            this.addNewSlide()
        }

    }


    /**
     * Adds New slide to the show
     *
     */
    addNewSlide(newSlide = new Slide({
        text: this.slideNumber + " Please add slide text", videoFileName: undefined
    })) {


        let itemToInsertBefore = this.#sideBarSlidesContainer.children[this.#currentSlide + 1]
        this.#currentSlide += 1
        this.#sideBarSlidesContainer.insertBefore(this.#createSlideSidebarPreview(newSlide, ++this.slideNumber), itemToInsertBefore)
        document.querySelectorAll("#sidebarSlidesContainer input")[this.#currentSlide].checked = true

        if (newSlide.videoFileName === undefined) {
            this.#slides.splice(this.#currentSlide + 1, 0, newSlide)
            this.#slideTextInput.value = ""
            this.#createCanvasVideoPicker()
        } else {
            this.#setCanvasToVideo(this.#slides[this.#currentSlide])
        }
    }


    /**
     * Removes slide from the show
     *
     */
    removeSlide() {
        if (this.#currentSlide > -1) {
            this.#slides.splice(this.#currentSlide, 1)
            let slideElementToRemove = this.#sideBarSlidesContainer.children[this.#currentSlide]
            this.#sideBarSlidesContainer.removeChild(slideElementToRemove)
            this.#currentSlide -= 1

            // console.log(this.#currentSlide, this.#slides.length)
            if (this.#currentSlide > -1) {
                this.#slidesRadioSelector()[this.#currentSlide].checked = true
            }

            //TODO: Delete video and Thumbnail from folder
        }
    }

    saveShow() {
        return JSON.stringify(this.#slides)
    }
}

export default ShowCreator;