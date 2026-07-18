import OverlayView from "../../../renderer/js/Classes/OverlayView";
import Slide from "../../../renderer/js/Classes/Slide";

let view: OverlayView

function createOverlayView(data) {
    let {sepBy, mode, content, currentSlide} = data;
    let presentation = JSON.parse(content);
    let slides = presentation.map((e: any) => new Slide(e));
    view = new OverlayView({
        container: "presentContainer",
        height: document.getElementById("presentContainer")?.clientHeight,
        slides,
        splitStrategy: mode,
        splitDelimiter: sepBy,
    });
    view.changeSlide(currentSlide)
}

fetch("/api/slides/content")
    .then((response) => response.json())
    .then((data) => {
        createOverlayView(data);
    })
    .catch((error) => {
        console.error("Error fetching slide content:", error);
    });


const eventSource = new EventSource('api/slides/live');
// Listen for the general 'message' event or named types
eventSource.addEventListener('slide', (event) => {
    let data = event.data;
    view?.changeSlide(data);
})


eventSource.addEventListener('init', (event) => {
    console.log("Initializing Show OverlayView");
    createOverlayView(JSON.parse(event.data));
});

eventSource.onerror = (error) => {
    console.error('SSE connection failed:', error);
    eventSource.close(); // Close stream manually if needed
};