import Slide from "./Slide";
import Konva from "konva";
import addVideoSvg from "../../asset/resource/video_camera_back_add_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg";

// TODO: https://chatgpt.com/share/6889bfdd-c3b0-8002-bf5b-9b05270064f0
// eslint-disable-next-line import/no-webpack-loader-syntax
import videojs from "video.js";
import Utils from "./Utils";

/**
 * The Canvas renderer props
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

class CanvasRenderer extends Konva.Stage {
  /**
   * @type {[Slide]}
   */
  #slides = [];
  /**
   * @type {number}
   * */
  #currentSlide;

  #sideBarSlidesContainer;
  #baseLayer;
  #textLayer;
  #background;
  #textBackground;
  #videoObj;
  #anim;
  #filePicker;
  #controller;
  #textToHeightRatio = 0.125;

  #simpleText;
  #padding;

  #createFilePicker() {
    let filePicker = document.createElement("input");
    filePicker.type = "file";
    filePicker.accept = "video/*";
    filePicker.addEventListener("change", this.#onVideoFilePicked.bind(this), {
      signal: this.#controller.signal,
    });
    return filePicker;
  }
  #createVideoElement() {
    let videoElement = document.createElement("video");
    videoElement.autoplay = true;
    videoElement.loop = true;
    videoElement.controls = true;
    videoElement.muted = true;
    return videoElement;
  }

  pickVideoFile() {
    this.#filePicker.click();
  }

  #onImageLayerClicked(e) {
    if (this.#currentSlide.videoFileName === undefined) {
      this.pickVideoFile();
    }
    if (this.#videoObj.paused) {
      this.#videoObj.play();
    } else {
      this.#videoObj.pause();
    }
  }

  async #onVideoFilePicked(e) {
    let filePicker = e.target;
    let file = filePicker.files.item(0);
    let videoFileName = file.name;
    let imgFileName = videoFileName.replace(/\.[^/.]+$/, "");

    try {
      let generatedImage = await Utils.createVideoCoverImage(file.path);
      const add = await slideFiles.addSlideFiles({
        imgBase64: generatedImage,
        videoFilePath: file.path,
        imgFileName,
        videoFileName,
      });
    } catch (err) {
      console.error(err);
    }

    this.onVideoPicked?.(videoFileName);
  }

  /**
   * Sets the canvas background to a video if the provided slide contains a video file.
   * Updates the video source, sets the background image, and starts video playback and animation.
   * If no video file is present in the slide, triggers the canvas video picker.
   *
   * @private
   * @param {Slide} [slide=this.#currentSlide] - The slide object to use for setting the video background.
   */
  #setCanvasToVideo(/** Slide*/ slide = this.#currentSlide) {
    if (slide.videoFileName !== undefined) {
      this.container().style.background = "transparent";
      // this.#videoObj.src = "file://" + this.#basePath + "/" + slide.videoFileName + "." + slide.videoFileFormat
      this.#videoObj.src =
        "media://" +
        encodeURIComponent(slide.videoFileName + "." + slide.videoFileFormat);
      this.#videoObj.muted = slide.isMuted;

      this.#background.setAttrs({
        image: this.#videoObj,
        x: 0,
        y: 0,
        width: this.width(),
        height: this.height(),
      });

      this.#videoObj.play();
      this.#anim.start();
    } else {
      this.#createCanvasVideoPicker();
    }
  }

  #createCanvasVideoPicker() {
    let imgdim = this.height() * 0.5;
    Konva.Image.fromURL(addVideoSvg, (imageNode) => {
      this.#background.setAttrs({
        image: imageNode.image(),
        width: imgdim,
        height: imgdim,
        x: (this.width() - imgdim) / 2,
        y: (this.height() - imgdim) / 2,
      });
    });
    this.container().style.background = "#000";
  }

  constructor(props) {
    super(props);

    this.container().children[0].classList.add("border");
    this.container().children[0].classList.add("border-light-subtle");
    this.#padding = 0.2;

    this.onVideoPicked = props.onVideoPicked;
    this.muteVideoBtn = props.muteVideoBtn;
    this.onTextDrag = props.onTextDragFn;
    this.#controller = new AbortController();

    this.#videoObj = this.#createVideoElement();
    this.#filePicker = this.#createFilePicker();

    this.#baseLayer = new Konva.Layer();
    this.add(this.#baseLayer);

    this.#anim = new Konva.Animation(function () {
      // do nothing, animation just need to update the layer
    }, this.#baseLayer);

    this.#anim.start();

    /**
     * @type {Konva.Image}
     */
    this.#background = new Konva.Image({
      x: 0,
      y: 0,
      width: this.width(),
      height: this.height(),
    });

    /* this.#textLayer = new Konva.Group({
      draggable: true,
      boundBoxFunc: (oldBox, newBox) => {
        // Adopted from https://konvajs.org/docs/sandbox/Limited_Drag_And_Resize.html
        // Calculate the actual bounding box of the transformed shape
        const box = Utils.getClientRect(newBox);

        // Check if the new box is outside the stage boundaries
        const isOut =
          box.x < 0 ||
          box.y < 0 ||
          box.x + box.width > this.width() ||
          box.y + box.height > this.height();

        // If outside boundaries, keep the old box
        if (isOut) {
          return oldBox;
        }

        // If within boundaries, allow the transformation
        return newBox;
      },
    });
 */
    this.#simpleText = new Konva.Text({
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

    this.#textLayer = new Konva.Label({
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
    this.#textLayer.add(this.#textBackground);

    this.#textLayer.add(this.#simpleText);

    this.#baseLayer.add(this.#background);

    this.#baseLayer.add(this.#textLayer);

    console.log(`${this.constructor.name} initialized `);
  }

  _attachEventListeners() {
    this.#baseLayer.on("mouseover", function (evt) {
      var shape = evt.target;
      document.body.style.cursor = "pointer";
    });
    this.#baseLayer.on("mouseout", function (evt) {
      var shape = evt.target;
      document.body.style.cursor = "default";
    });

    this.#baseLayer.on("click", this.#onImageLayerClicked.bind(this));

    this.#textLayer.dragBoundFunc((pos) => {
      // Clone the group and simulate the new position
      const clone = this.#textLayer.clone();
      clone.position(pos);
      const box = clone.getClientRect();

      let newX = pos.x;
      let newY = pos.y;

      const stageWidth = this.width();
      const stageHeight = this.height();

      if (box.x < 0) {
        newX = pos.x - box.x;
      }
      if (box.y < 0) {
        newY = pos.y - box.y;
      }
      if (box.x + box.width > stageWidth) {
        newX = pos.x - (box.x + box.width - stageWidth);
      }
      if (box.y + box.height > stageHeight) {
        newY = pos.y - (box.y + box.height - stageHeight);
      }
      return { x: newX, y: newY };
    });
    this.#textLayer.on("dragend", (e) => {
      const lastTextPos = e.target._lastPos;
      const relativeTextPos = {
        x: lastTextPos.x / this.width(),
        y: lastTextPos.y / this.height(),
      };
      this.onTextDrag?.(relativeTextPos);
    });
  }

  renderSlide(slide) {
    this.#currentSlide = slide;
    this.#setCanvasToVideo(slide);
  }

  changeVideoMuteState(isMuted) {
    this.#videoObj.muted = isMuted;
  }

  rendertext(text) {
    this.#simpleText.text(text);
  }
  renderTextPosition({ x, y }) {
    this.#textLayer.x(x * this.width());
    this.#textLayer.y(y * this.height());
  }
  renderTextProps(textProps) {
    this.#simpleText.setAttrs({ ...textProps });
  }
  renderTextBackground(props) {
    if (props) {
      this.#textBackground.fill(props.color);
      this.#textBackground.opacity(props.opacity);
    } else {
      this.#textBackground.opacity(0);
    }
  }

  destroyCreator() {
    this.#videoObj.pause();
    this.#videoObj.src = "";
    this.#videoObj.load();
    while (
      this.#sideBarSlidesContainer.firstChild &&
      this.#sideBarSlidesContainer.removeChild(
        this.#sideBarSlidesContainer.firstChild
      )
    );
    this.#controller.abort();
    this.destroy();
  }
}

export default CanvasRenderer;
