class Slide {
    get textX() {
        return this._textX;
    }

    set textX(value) {
        this._textX = value;
    }

    get textY() {
        return this._textY;
    }

    set textY(value) {
        this._textY = value;
    }

    get text() {
        return this._text;
    }

    set text(value) {
        this._text = value;
    }

    get videoFile() {
        return this._videoFile;
    }

    set videoFile(value) {
        this._videoFile = value;
    }

    get loop() {
        return this._loop;
    }

    set loop(value) {
        this._loop = value;
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

    splitText({mode = "words", numberOfWords = 6, separator = " "} ) {
        let subtitledText = []
        console.log(mode)
        if (mode === "words") {
            let textSplit = this._text.split(" ")
            for (let i = 0; i < textSplit.length; i += numberOfWords) {
                let tempText = []
                for (let j = 0; j < numberOfWords; j++) {
                    tempText.push(textSplit[i + j])
                }
                console.log(numberOfWords)
                subtitledText.push(tempText.join(" "))
            }

        }else if(mode ==="separator"){
            subtitledText = this._text.split(separator)
        }
        return subtitledText
    }
}

