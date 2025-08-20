interface FontBackground {
  color: string;
  opacity: number;
}

interface Font {
  family?: string;
  bold?: boolean;
  textToHeightRatio?: number;
  background: FontBackground | false;
}

interface SlideJSON {
  video: {
    name?: string;
    format?: string;
    muted?: boolean;
  };
  text?: {
    x: number;
    y: number;
    font: Font;
    value: string;
  };
  thumbnail?: {
    format: string;
  };
}

class Slide {
  private _text: string;
  private _textX: number;
  private _textY: number;
  private _loop: boolean;
  private _muted: boolean;

  private _fontFamily: string;
  private _fontBold: boolean;
  private _fontTextToHeightRatio: number;
  private _fontBackground: FontBackground | false;

  private _videoThumbnailFormat: string;
  private _videoFileName: string;
  private _videoFileFormat: string;

  constructor(
    props: SlideJSON = {
      video: { name: undefined, muted: true, format: "mp4" },
    }
  ) {
    this._videoFileName = props?.video?.name;
    this._videoFileFormat = props?.video?.format || "mp4";

    this._videoThumbnailFormat = props?.thumbnail?.format || "png";

    this._text = props?.text?.value;
    this._textX = props?.text?.x || 0;
    this._textY = props?.text?.y || 0;

    this._muted = props.video.muted;

    this._fontFamily = props?.text?.font?.family || "Calibri";
    this._fontBold = props?.text?.font?.bold || true;
    this._fontTextToHeightRatio = props?.text?.font?.textToHeightRatio || 0.125;

    this._fontBackground = props?.text?.font?.background || {
      color: "black",
      opacity: 0.5,
    };
  }

  get text() {
    return this._text;
  }
  get fontBackground() {
    return this._fontBackground;
  }
  get fontFamily() {
    return this._fontFamily;
  }
  get textPosition() {
    return { x: this._textX, y: this._textY };
  }
  /**
   * Sets the position of the text overlay on the slide.
   *
   * @param prop - An object containing the `x` and `y` coordinates for the text position.
   * @property prop.x - The horizontal position of the text.
   * @property prop.y - The vertical position of the text.
   */
  setTextPosition(prop: { x: number; y: number }) {
    this._textX = prop.x;
    this._textY = prop.y;
  }

  get videoThumbnailFormat(): string {
    return this._videoThumbnailFormat;
  }
  get videoFileFormat(): string {
    return this._videoFileFormat;
  }
  get videoFileName(): string {
    return this._videoFileName;
  }
  get loop(): boolean {
    return this._loop;
  }

  get isMuted(): boolean {
    return this._muted;
  }

  toggleMuted(): Boolean {
    this._muted = !this._muted;
    return this._muted;
  }
  toggleBackground(): FontBackground | false {
    if (this._fontBackground) {
      this._fontBackground = false;
      return this._fontBackground;
    }
    this._fontBackground = {
      color: "black",
      opacity: 0.5,
    };
    return this._fontBackground;
  }

  setText(text: string): void {
    this._text = text;
  }
  setFontName(name: string): void {
    this._fontFamily = name;
  }
  setVideoFileName(filename: string) {
    const fileNameSplitted = filename.split(".");
    fileNameSplitted.pop();
    this._videoFileName = fileNameSplitted.join(".");
  }

  toJSON(): SlideJSON {
    return {
      video: {
        name: this._videoFileName,
        format: this._videoFileFormat,
        muted: this._muted,
      },
      text: {
        x: this._textX,
        y: this._textY,
        font: {
          family: this._fontFamily,
          bold: this._fontBold,
          textToHeightRatio: this._fontTextToHeightRatio,
          background: this._fontBackground || false,
        },
        value: this._text,
      },
      thumbnail: {
        format: this.videoThumbnailFormat,
      },
    };
  }

  // this function is only added to prevent any breaks in presentation mode
  /**
   * this function is only added to prevent any breaks in presentation mode
   * and it will be deprecated and removed in future version in favour of LyricManager
   * @param mode
   * @param sepBy
   * @returns
   */
  splitText(mode = "words", sepBy: any = "6") {
    let subtitledText = [];

    if (mode === "words") {
      sepBy *= 1;
      let textSplit = this._text.split(" ");
      for (let i = 0; i < textSplit.length; i += sepBy) {
        subtitledText.push(textSplit.slice(i, i + sepBy).join(" "));
      }
    } else {
      subtitledText = this._text.split(sepBy);
    }
    console.log(subtitledText);
    return subtitledText;
  }
}

export default Slide;
