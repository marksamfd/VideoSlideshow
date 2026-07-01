import Konva from "konva";
import CanvasRenderer from "./CanvasRendererClass";
import Slide from "../Slide";
import Utils from "../Utils";
import addVideoSvg from "../../../asset/resource/video_camera_back_add_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg";
import { StageConfig } from "konva/lib/Stage";
export type CreatorCanvasRendererConfig = StageConfig & {
  onVideoPicked?: Function;
  onTextDragFn?: Function;
};
export default class CreatorCanvasRenderer extends CanvasRenderer {
  private filePicker;
  private onVideoPicked: Function;

  private onTextDrag: Function;
  protected anim: any;

  override createBackgroundElement(): CanvasImageSource {
    let videoElement = document.createElement("video");
    videoElement.autoplay = true;
    videoElement.loop = true;
    videoElement.controls = false;
    videoElement.muted = true;
    return videoElement;
  }

  private createCanvasVideoPicker() {
    let imgdim = this.height() * 0.5;
    Konva.Image.fromURL(addVideoSvg, (imageNode) => {
      this.background.setAttrs({
        image: imageNode.image(),
        width: imgdim,
        height: imgdim,
        x: (this.width() - imgdim) / 2,
        y: (this.height() - imgdim) / 2,
      });
    });
    this.container().style.background = "#000";
  }
  private createFilePicker() {
    let filePicker = document.createElement("input");
    filePicker.type = "file";
    filePicker.accept = "video/*";
    filePicker.addEventListener("change", this.#onVideoFilePicked.bind(this), {
      signal: this.controller.signal,
    });
    return filePicker;
  }

  private pickVideoFile() {
    this.filePicker.click();
  }

  private onImageLayerClicked() {
    if (this.currentSlide.videoFileName === undefined) {
      this.pickVideoFile();
    }
    if (this.backgroundDOMObj instanceof HTMLVideoElement) {
      if (this.backgroundDOMObj.paused) {
        this.backgroundDOMObj.play();
      } else {
        this.backgroundDOMObj.pause();
      }
    }
  }

  async #onVideoFilePicked(e: Event) {
    let filePicker = e.target as HTMLInputElement;
    let file = filePicker?.files?.item(0);
    if (file) {
      let videoFileName = file.name;
      let imgFileName = videoFileName.replace(/\.[^/.]+$/, "");

      try {
        let generatedImage = await Utils.createVideoCoverImage(file.path);
        const add = await window?.slideFiles?.addSlideFiles({
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
  }
  override setCanvasToVideo(slide: Slide = this.currentSlide) {
    if (slide.videoFileName !== undefined) {
      this.container().style.background = "transparent";
      // this.#videoObj.src = "file://" + this.#basePath + "/" + slide.videoFileName + "." + slide.videoFileFormat
      if (this.backgroundDOMObj instanceof HTMLVideoElement) {
        this.backgroundDOMObj.src =
          "media://local/" +
          encodeURIComponent(slide.videoFileName + "." + slide.videoFileFormat);
        this.backgroundDOMObj.muted = slide.isMuted;
        this.backgroundDOMObj.play();
      }

      this.background.setAttrs({
        image: this.backgroundDOMObj,
        x: 0,
        y: 0,
        width: this.width(),
        height: this.height(),
      });

      this.anim.start();
    }
    if (slide.videoFileName == undefined) {
      this.createCanvasVideoPicker();
    }
  }

  constructor(props: CreatorCanvasRendererConfig) {
    super(props);
    this.onVideoPicked = props.onVideoPicked;
    this.onTextDrag = props.onTextDragFn;
    this.filePicker = this.createFilePicker();
    this.anim = new Konva.Animation(function () {
      // do nothing, animation just need to update the layer
    }, this.baseLayer);

    this.anim.start();
  }

  changeVideoMuteState(isMuted: boolean) {
    if (this.backgroundDOMObj instanceof HTMLVideoElement)
      this.backgroundDOMObj.muted = isMuted;
  }
  override _attachEventListeners() {
    this.background.on("mouseover", function (evt) {
      var shape = evt.target;
      document.body.style.cursor = "pointer";
    });
    this.background.on("mouseout", function (evt) {
      var shape = evt.target;
      document.body.style.cursor = "default";
    });

    this.textLayer.on("mouseover", function (evt) {
      var shape = evt.target;
      document.body.style.cursor = "move";
    });
    this.textLayer.on("mouseout", function (evt) {
      var shape = evt.target;
      document.body.style.cursor = "default";
    });

    this.baseLayer.on("click", this.onImageLayerClicked.bind(this));

    this.textLayer.dragBoundFunc((pos) => {
      // Clone the group and simulate the new position
      const clone = this.textLayer.clone();
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

    this.textLayer.on("dragend", (e) => {
      const lastTextPos = e.target._lastPos;
      const relativeTextPos = {
        x: lastTextPos.x / this.width(),
        y: lastTextPos.y / this.height(),
      };
      this.onTextDrag?.(relativeTextPos);
    });
  }
}
