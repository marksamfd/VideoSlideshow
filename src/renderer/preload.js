// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// Preload (Isolated World)
const {contextBridge, ipcRenderer} = require("electron");
const {IPCEvents} = require("../IPCmsg");

contextBridge.exposeInMainWorld("file", {
    openDialog: (mode) => ipcRenderer.invoke(IPCEvents.FILE_OPEN_DIALOG, mode),
    fileOpened: (fileParams) =>
        ipcRenderer.invoke("file-opened", JSON.parse(JSON.stringify(fileParams))),
    onFileParams: (callback) =>
        ipcRenderer.on("file-params", (_event, fileParams) => callback(fileParams)),
    save: (fileContent) => ipcRenderer.invoke("file-save", fileContent),
    onSaveBeforeQuit: (callback) => ipcRenderer.on("save-before-quit", callback),
    saveAndQuit: (fileContent) => ipcRenderer.invoke("save-quit", fileContent),
    saveDone: () => ipcRenderer.send("save-done"),
    onPresentationDialog: (callback) => ipcRenderer.on(IPCEvents.FILE_OPEN_DIALOG_PRESENTATION, callback)
});

/* contextBridge.exposeInMainWorld("thumbs", {
  create: (props) => ipcRenderer.invoke("create-thumb", props),
});
 */

contextBridge.exposeInMainWorld("slideFiles", {
    addSlideFiles: (props) => ipcRenderer.send("addSlideFiles", props),
    allFonts: () => ipcRenderer.invoke("getSystemFonts"),
});

contextBridge.exposeInMainWorld("comm", {
    toPresentation: (props) => ipcRenderer.send("to-presentation", props),
    onSlideshowInitialized: (callback) =>
        ipcRenderer.on("slideshow:init", (_e) => callback()),
    startSlideshow: (content) => ipcRenderer.invoke("slideshow:start", content),
    onSlideshowDestroy: (callback) =>
        ipcRenderer.on("slideshow:destroy", (_e) => callback()),
    startOverlay: () => ipcRenderer.send(IPCEvents.OVERLAY_START),
    onOverlayStarted: (callback) => ipcRenderer.on(IPCEvents.OVERLAY_STARTED, (_e, server) => callback(server)),
});

/*
ipcRenderer.on("file-opened",(event, basePath, fileContent)=>{
    contextBridge.exposeInMainWorld("dir",{
        basePath,
        fileContent,
        presentation:JSON.parse(fileContent)
    })
})*/
