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
        this._videoFile = videoFile;
        this._text = text;
        this._textX = X || 0;
        this._textY = Y || 0;
        this._loop = loop || true
    };

    splitText({mode = "words", sepBy = 6}) {
        let subtitledText = []
        console.log(mode)
        if (mode === "words") {
            let textSplit = this._text.split(" ")
            for (let i = 0; i < textSplit.length; i += sepBy) {
                let tempText = []
                for (let j = 0; j < sepBy; j++) {
                    tempText.push(textSplit[i + j])
                }
                console.log(sepBy)
                subtitledText.push(tempText.join(" "))
            }

        } else if (mode === "separator") {
            subtitledText = this._text.split(sepBy)
        }
        return subtitledText
    }
}

export default Slide;