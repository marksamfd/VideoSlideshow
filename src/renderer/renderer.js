
let f = document.getElementById("dd")
let present

hotkeys('down,ctrl+o,up,space', function (event, handler){
    switch (handler.key) {
        case 'down':
        case 'space':
            present.changeSlide()
            break;
        case 'up':
            present.changeSlide(-1)
            break;
        case 'ctrl+o':
            file.open().then(([basePath, content]) => {
                let presentation = JSON.parse(content)
                let slides = presentation.map(e => new Slide(e.text.value, e.video.path))
                present = new Presentation({
                    container: "dd",
                    width: f.clientWidth,
                    height: f.clientHeight,
                    slides,
                    basePath
                })
                console.log(slides,present)
            })
            break;
    }
});