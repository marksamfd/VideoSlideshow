// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// Preload (Isolated World)
const {contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld("file", {
    open: (mode) => ipcRenderer.invoke("file-dialog-open", mode),
    save: (fileContent) => ipcRenderer.invoke("file-save", fileContent),
    saveAndQuit: (fileContent) => ipcRenderer.invoke("save-quit", fileContent),
    copyVideo: (vidPath) => ipcRenderer.invoke("copy-video", vidPath),
    fileOpened: (fileParams) => ipcRenderer.invoke("file-opened", JSON.parse(JSON.stringify(fileParams))),
    onFileParams: (callback) => ipcRenderer.on("file-params", (_event, fileParams) => callback(fileParams))
})

contextBridge.exposeInMainWorld("thumbs", {
    create: (props) => ipcRenderer.invoke("create-thumb", props)
})

contextBridge.exposeInMainWorld("comm", {
    toPresentation: (props) => ipcRenderer.send("to-presentation", props),
    onSlideshowInitialized: (callback) => ipcRenderer.on("slideshow:init", (_e) => callback()),
    startSlideshow: (content) => ipcRenderer.invoke("slideshow:start", content),
    onSlideshowDestroy: (callback) => ipcRenderer.on("slideshow:destroy", (_e) => callback()),

})


/*
ipcRenderer.on("file-opened",(event, basePath, fileContent)=>{
    contextBridge.exposeInMainWorld("dir",{
        basePath,
        fileContent,
        presentation:JSON.parse(fileContent)
    })
})*/
