import Slide from "../js/Classes/Slide";
import hotkeys from "hotkeys-js";
import "./index.scss";

import * as Sentry from "@sentry/electron/renderer";
import PresentationView from "../js/Classes/PresentationView";

Sentry.init({
    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/electron/configuration/options/#sendDefaultPii
    sendDefaultPii: true,
    integrations: [],
});

Sentry.setTag("type", "Show");

let presentContainer = document.getElementById("presentContainer");
let present: PresentationView;

window.comm.onInitSlideshow((data) => {
    console.log(data);
    let presentation = JSON.parse(data.content);
    let slides = presentation.map((e: any) => new Slide(e));
    present = new PresentationView({
        container: "presentContainer",
        height: presentContainer.clientHeight,
        slides,
        splitStrategy: data.mode,
        splitDelimiter: data.sepBy,
    });
});

// window.comm.onNextSlide(() => present?.next());
// window.comm.onPreviousSlide(() => present?.previous());
window.comm.onSlideChange((param) => present?.changeSlide(param));
hotkeys("down,ctrl+o,up,space", (event, handler) => {
    switch (handler.key) {
        case "down":
        case "space":
            present.next();
            break;
        case "up":
            present.previous();
            break;
    }
});

window.onbeforeunload = () => {
    console.log("Destroying show");
    // present.destroyShow();
};
