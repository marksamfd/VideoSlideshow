import {contextBridge, ipcRenderer} from "electron";
import {IPCEvents} from "../IPCmsg";

contextBridge.exposeInMainWorld("comm", {
    onInitSlideshow: (callback) =>
        ipcRenderer.on(IPCEvents.PRESENTATION_INIT, (_, data) => callback(data)),
    onSlideChange: (callback) =>
        ipcRenderer.on(IPCEvents.PRESENTATION_SLIDE_CHANGE, (_, data) => callback(data)),
    onSlideshowDestroy: (callback) =>
        ipcRenderer.on("slideshow:destroy", (_e) => callback()),
});

contextBridge.exposeInMainWorld("file", {
    open: (mode) => ipcRenderer.invoke("file-open", mode),
    fileOpened: (fileParams) =>
        ipcRenderer.invoke("file-opened", JSON.parse(JSON.stringify(fileParams))),
    onFileParams: (callback) =>
        ipcRenderer.on("file-params", (_event, fileParams) => callback(fileParams)),
});
