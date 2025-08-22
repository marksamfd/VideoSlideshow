import Show from "../js/Classes/ShowClass";
import Slide from "../js/Classes/Slide";
import hotkeys from "hotkeys-js";
import "./index.scss";

let presentContainer = document.getElementById("presentContainer");
let present;

comm.onPresenterMessage((msg) => {
  console.log(msg);
  let msgType = msg.type;
  switch (msgType) {
    case "init":
      let fileParams = msg.data;
      let presentation = JSON.parse(fileParams.content);
      console.log(fileParams);
      let slides = presentation.map((e) => new Slide(e));
      present = new Show({
        container: "presentContainer",
        width: (presentContainer.clientHeight * 16) / 9,
        height: presentContainer.clientHeight,
        slides,
        basePath: fileParams.basePath,
        mode: fileParams.mode,
        sepBy: fileParams.sepBy,
      });
      break;
    case "change":
      present.changeSlide(msg.data);
      break;
  }
});

window.onbeforeunload = () => {
  console.log("Destroying show");
  present.destroyShow();
};
