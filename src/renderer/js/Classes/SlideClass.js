import slide from '../../asset/resource/Presentation1.png';

/** Class representing a slide.
 * @class
 */
class Slide {
    #videoFileFormat;
    #videoFileName;

    get textX() {
        return this._textX;
    }

    get textY() {
        return this._textY;
    }

    get text() {
        return this._text;
    }

    get videoFileName() {
        return this.#videoFileName;
    }

    get videoFileFormat() {
        return this.#videoFileFormat;
    }

    get loop() {
        return this._loop;
    }

    set text(text) {
        this._text = text;
    }

    /**
     *
     * @param {string} videoFileName
     */
    set videoFileName(videoFileName) {
        let nameSplitted = videoFileName.split(".")
        this.#videoFileFormat = nameSplitted.pop();
        console.log(nameSplitted, this.#videoFileFormat)
        this.#videoFileName = nameSplitted.join(".");
    }


    /**
     *
     * @param {Object} params
     * @param {string} params.text
     * @param {string} params.videoFileName
     * @param {number} params.X
     * @param {number} params.Y
     * @param {boolean} params.loop
     * @param {string} params.videoFileFormat
     * @param {string} params.videoThumbnailFormat
     * @param {boolean} params.isRTL
     */
    constructor({
                    text = "Please Enter the text",
                    videoFileName = undefined,
                    isRTL = true,
                    X = 0,
                    Y = 0,
                    loop = true,
                    videoThumbnailFormat = "png",
                    videoFileFormat = "mp4"
                } = {}) {

        /** @type{string} Video file name */
        this.#videoFileName = videoFileName;
        /** @type{string} Video file format */
        this.#videoFileFormat = videoFileFormat;
        /** @type{string} Video thumbnail format */
        this.videoThumbnailFormat = videoThumbnailFormat
        /** @type{string} text attached to the video */
        this._text = text;
        /** @type{number} text X position */
        this._textX = X || 0;
        /** @type{number} text Y position */
        this._textY = Y || 0;
        /** @type{boolean} weather to loop the video */
        this._loop = loop || true
    };

    /**
     * Split text according to the delimiters
     * @param {string} mode
     * @param {string} sepBy
     * @return {string[]}
     */
    splitText(mode = "words", sepBy = "6") {
        let subtitledText = []

        if (mode === "words") {
            sepBy *= 1
            let textSplit = this._text.split(" ")
            for (let i = 0; i < textSplit.length; i += sepBy) {
                subtitledText.push(textSplit.slice(i, i + sepBy).join(" "))
            }

        } else {
            subtitledText = this._text.split(sepBy)
        }
        console.log(subtitledText)
        return subtitledText
    }


    /**
     * Create video thumbnail
     * @param {string} basePath
     * @param {number} thumbAtPercent
     * @return {Promise<string>} base64 Image
     */

    createVideoCoverImage(basePath, thumbAtPercent = 0.2) {
        return new Promise((resolve, reject) => {
            // define a canvas to have the same dimension as the video
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = 1920;
            canvas.height = 1080;
            if (this.videoFileName !== undefined) {
                // load the file to a video player
                const videoPlayer = document.createElement('video');
                videoPlayer.setAttribute('src', "file://" + basePath + "/" + this.videoFileName + "." + this.videoFileFormat);
                videoPlayer.load();
                videoPlayer.addEventListener('error', (ex) => {
                    reject("error when loading video file", ex);
                });
                // load metadata of the video to get video duration and dimensions
                videoPlayer.addEventListener('loadedmetadata', () => {
                    // seek to user defined timestamp (in seconds) if possible
                    if (videoPlayer.duration < thumbAtPercent) {
                        reject("video is too short.");
                        return;
                    }
                    // delay seeking or else 'seeked' event won't fire on Safari
                    setTimeout(() => {
                        videoPlayer.currentTime = videoPlayer.duration * thumbAtPercent;
                    }, 200);
                    // extract video thumbnail once seeking is complete
                    videoPlayer.addEventListener('seeked', () => {
                        console.log('video is now paused at %ss.', thumbAtPercent);
                        // draw the video frame to canvas
                        ctx.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);
                        resolve(canvas.toDataURL('image/' + this.videoThumbnailFormat, 0.8));
                    });
                });
            } else {
                ctx.fillStyle = "#fff"
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/' + this.videoThumbnailFormat, 0.8))
            }
        });
    }


    /**
     * Converts Slide
     * @return {Object}
     */
    toJSON() {
        return {
            text: this._text,
            videoFileName: this.#videoFileName,
            videoFileFormat: this.#videoFileFormat,
            videoThumbnailFormat: this.videoThumbnailFormat,
            x: this.textX,
            y: this.textY,
            loop: this.loop,
        }
    }


}

export default Slide;