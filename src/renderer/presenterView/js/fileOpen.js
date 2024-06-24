import Slide from "../../js/SlideClass";
import PresenterView from "../../js/PresenterClass";
import hotkeys from "hotkeys-js";

function getVideoCover(file, seekTo = 0.0) {
    console.log("getting video cover for file: ", file);
    return new Promise((resolve, reject) => {
        // load the file to a video player
        const videoPlayer = document.createElement('video');
        videoPlayer.setAttribute('src', file);
        videoPlayer.load();
        videoPlayer.addEventListener('error', (ex) => {
            reject("error when loading video file", ex);
        });
        // load metadata of the video to get video duration and dimensions
        videoPlayer.addEventListener('loadedmetadata', () => {
            // seek to user defined timestamp (in seconds) if possible
            if (videoPlayer.duration < seekTo) {
                reject("video is too short.");
                return;
            }
            // delay seeking or else 'seeked' event won't fire on Safari
            setTimeout(() => {
                videoPlayer.currentTime = seekTo;
            }, 200);
            // extract video thumbnail once seeking is complete
            videoPlayer.addEventListener('seeked', () => {
                console.log('video is now paused at %ss.', seekTo);
                // define a canvas to have the same dimension as the video
                const canvas = document.createElement("canvas");
                canvas.width = videoPlayer.videoWidth;
                canvas.height = videoPlayer.videoHeight;
                // draw the video frame to canvas
                const ctx = canvas.getContext("2d");
                ctx.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);
                // return the canvas image as a blob
                let splitFile = file.split("\\")
                console.log(splitFile[splitFile.length - 1].replace('.mp4', ""))
                resolve({
                    pic: canvas.toDataURL('image/jpg', 0.8),
                    filename: splitFile[splitFile.length - 1].replace('.mp4', "")
                });
            });
        });
    });
}

let present

window.file.onFileParams(function (fileParams) {
    console.log(fileParams);
    let presentation = JSON.parse(fileParams["content"])
    let slides = presentation.map(e => new Slide(e.text.value, e.video.path))
    // slides.forEach(el => {
    //     getVideoCover("file://" + fileParams.basePath + "\\" + el.videoFile, 1.5).then(thumbs.create);
    //
    // })
    let slidePreviewCanv = document.getElementById("currentSlideThumbCanvas");
    console.log(slidePreviewCanv)
    comm.toPresentation({type: "init", data: JSON.stringify(fileParams)})
    present = new PresenterView({
        container: "currentSlideThumbCanvas",
        sidebarSlidesContainer: document.getElementById("sidebarSlidesContainer"),
        lyricsContainer: document.getElementById("textSlidesList"),
        width: slidePreviewCanv.clientWidth,
        height: slidePreviewCanv.clientHeight,
        slides,
        basePath: fileParams.basePath,
        mode: fileParams.mode,
        sepBy: fileParams.sepBy
    })
    hotkeys('down,ctrl+o,up,space', function (event, handler) {
        switch (handler.key) {
            case 'down':
            case 'space':
                present.changeSlide()
                comm.toPresentation({type: "change", data: 1})
                break;
            case 'up':
                present.changeSlide(-1)
                comm.toPresentation({type: "change", data: -1})
                break;
        }
    });
})