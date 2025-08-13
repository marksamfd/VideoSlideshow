// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// Preload (Isolated World)
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("file", {
  open: (mode) => ipcRenderer.invoke("file-dialog-open", mode),
  fileOpened: (fileParams) =>
    ipcRenderer.invoke("file-opened", JSON.parse(JSON.stringify(fileParams))),
  onFileParams: (callback) =>
    ipcRenderer.on("file-params", (_event, fileParams) => callback(fileParams)),
  save: (fileContent) => ipcRenderer.invoke("file-save", fileContent),
  onSaveBeforeQuit: (callback) => ipcRenderer.on("save-before-quit", callback),
  saveAndQuit: (fileContent) => ipcRenderer.invoke("save-quit", fileContent),
  saveDone: () => ipcRenderer.send("save-done"),
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
});

/*
ipcRenderer.on("file-opened",(event, basePath, fileContent)=>{
    contextBridge.exposeInMainWorld("dir",{
        basePath,
        fileContent,
        presentation:JSON.parse(fileContent)
    })
})*/
