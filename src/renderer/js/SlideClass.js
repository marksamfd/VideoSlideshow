/** Class representing a slide.
 * @class
 */
class Slide {
    get textX() {
        return this._textX;
    }

    get textY() {
        return this._textY;
    }

    get text() {
        return this._text;
    }

    get videoFile() {
        return this._videoFile;
    }

    get loop() {
        return this._loop;
    }

    constructor(text,
                videoFile,
                X = 0,
                Y = 0,
                loop = true,
    ) {
        /** @type{string} Video file name */
        this._videoFile = videoFile;
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
     *
     * @param mode
     * @param sepBy
     * @return {string[]}
     */
    splitText({mode = 0, sepBy = 6}) {
        let subtitledText = []

        if (mode === "words") {
            sepBy *= 1
            let textSplit = this._text.split(" ")
            for (let i = 0; i < textSplit.length; i += sepBy) {
                subtitledText.push(textSplit.slice(i, i + sepBy).join(" "))
            }

        } else if (mode === "delimiter") {
            subtitledText = this._text.split(sepBy)
        }
        console.log(subtitledText)
        return subtitledText
    }

    // get HTMLslides(){
    //     let splittedText =
    // }
}

export default Slide;