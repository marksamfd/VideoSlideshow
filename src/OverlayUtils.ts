import WorkingFile from "./workingFile";

export type messageType = {
    messageType: "init" | "slide"
    message: string | { sepby: string, mode: string, content: string }
}

function initOverlayView(file: WorkingFile) {
}


export default class GreenOverlay {
    host = "http://localhost:4040";
    headers = {
        'Content-Type': 'application/json',
    }


    constructor(private file: WorkingFile) {
    }

    create() {

    }

    init() {
        let body = this.file.toObject()
        console.log(body);
        fetch(`${this.host}/api/slides/init`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify(body),
        }).then(e => e.json()).then(console.log).catch(e => console.error(e));
    }

    changeSlide(slide: string) {
        fetch(`${this.host}/api/slides/trigger`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify({slide})
        }).then(e => e.json()).then(console.log).catch(e => console.error(e));
    }
}