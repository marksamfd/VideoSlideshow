// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// Preload (Isolated World)
const {contextBridge, ipcRenderer} = require('electron')
contextBridge.exposeInMainWorld("file",{
    open: (mode)=> ipcRenderer.invoke("file-open",mode),
    fileOpened:(fileParams)=>ipcRenderer.invoke("file-opened",fileParams)
})



/*
ipcRenderer.on("file-opened",(event, basePath, fileContent)=>{
    contextBridge.exposeInMainWorld("dir",{
        basePath,
        fileContent,
        presentation:JSON.parse(fileContent)
    })
})*/
