import {contextBridge, ipcRenderer} from "electron";

contextBridge.exposeInMainWorld("comm", {
    onPresenterMessage: (callback) => ipcRenderer.on("main:presentation", (_, data) => callback(data)),
    onSlideshowDestroy: (callback) => ipcRenderer.on("slideshow:destroy", (_e) => callback()),
})

contextBridge.exposeInMainWorld("file", {
    open: (mode) => ipcRenderer.invoke("file-open", mode),
    fileOpened: (fileParams) => ipcRenderer.invoke("file-opened", JSON.parse(JSON.stringify(fileParams))),
    onFileParams: (callback) => ipcRenderer.on("file-params", (_event, fileParams) => callback(fileParams))
})