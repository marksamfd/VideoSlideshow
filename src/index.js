const fswin = require("fswin");
const {app, BrowserWindow, ipcMain, dialog, Menu, MessageChannelMain, protocol, net, shell} = require('electron');
const path = require('path'), fs = require("fs")
const {pathToFileURL} = require('url')
const electron = require("electron");
const AdmZip = require("adm-zip");

import {createPresentationView, createShowCreatorView, createPresenterView} from './createViews'

let projectRandom
let workingFile = {}
let presentationView, presenterView, showCreatorView;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

app.disableHardwareAcceleration()


protocol.registerSchemesAsPrivileged([{
    scheme: 'media-loader',
    privileges: {bypassCSP: true, supportFetchAPI: true, stream: true, secure: true}
}])

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    protocol.handle('media-loader', (request) => net.fetch(pathToFileURL(decodeURIComponent(request.url.slice('media-loader://'.length)))))

    showCreatorView = createShowCreatorView()

});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


function saveShow(content) {
    const zip = new AdmZip();
    zip.addFile('slides.json', content)
    let files = fs.readdirSync(workingFile["basePath"])
    if (files.length > 0) {
        zip.addLocalFolder(workingFile["basePath"], "videos");
    } else {
        zip.addFile("videos/", null)
    }
    return zip.writeZipPromise(workingFile.filePath)
}

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createPresenterView();
    }
});

ipcMain.handle("file-dialog-open", (e, mode) => {
    let filePath
    let fileFilters = [{name: "ChoirSlide Files", extensions: ["chs"]}]
    if (mode === "o") {
        filePath = dialog.showOpenDialogSync(BrowserWindow.getFocusedWindow(), {
            properties: ["openFile"], filters: fileFilters
        })
    } else if (mode === "s") {
        filePath = dialog.showSaveDialogSync(BrowserWindow.getFocusedWindow(), {
            properties: ["openFile"], filters: fileFilters
        })
    }
    return filePath ? filePath : ""

})

ipcMain.handle("file-opened", async (e, data) => {
    let mainWindow = BrowserWindow.getFocusedWindow().getParentWindow();
    BrowserWindow.getFocusedWindow().destroy()

    let filePath = data["filePath"];
    let filePathParsed = path.parse(filePath)
    let directory = filePathParsed.dir
    let fileName = filePathParsed.name
    projectRandom = Math.floor(Math.random() * 9999)
    let workingTempDir = "temp-" + projectRandom

    let workingTempDirPath = path.join(directory, workingTempDir)


    data["basePath"] = workingTempDirPath
    workingFile = structuredClone(data)
    workingFile['directory'] = directory
    workingFile["projectName"] = fileName

    console.log(workingFile)
    if (!fs.existsSync(filePath)) {
        console.log(filePath)
        fs.writeFile(filePath, JSON.stringify(filePath, null, 2), (err) => {

        })
        if (!fs.existsSync(workingTempDirPath)) {
            fs.mkdirSync(workingTempDirPath);
            fswin.setAttributesSync(workingTempDirPath, {IS_HIDDEN: true});
        }
        data["content"] = "[]"
    } else {

        let zip = new AdmZip(filePath)

        zip.extractAllTo(directory)
        fs.renameSync(path.join(directory, "videos"), path.join(directory, workingTempDir))
        fs.renameSync(path.join(directory, "slides.json"), path.join(directory, projectRandom + ".json"))

        data["content"] = fs.readFileSync(path.join(directory, projectRandom + ".json"), {encoding: "utf8"})

    }

    mainWindow.setTitle(fileName)
    mainWindow.webContents.send("file-params", data);
})

ipcMain.handle("file-save", (e, content) => {
    saveShow(content).then(() => {
        dialog.showMessageBoxSync({
            title: "File Save",
            message: "File Saved Successfully",
            type: "info"
        })
    }).catch(err => {
        dialog.showMessageBoxSync({
            title: "File Save",
            message: `An error occurred during saving the file \n ${err}`,
            type: "info"
        })
    })
})

ipcMain.handle("create-thumb", (e, props) => {
    const base64Data = props.pic.replace(/^data:image\/png;base64,/, "");
    return fs.writeFileSync(`${workingFile.basePath}/${props.filename}.png`, base64Data, 'base64');
})

ipcMain.handle("copy-video", (e, videoOriginalPath) => {
    console.log(videoOriginalPath)
    let videoFileName = path.basename(videoOriginalPath)
    return fs.copyFileSync(`${videoOriginalPath}`, `${workingFile.basePath}/${videoFileName}`)
})

ipcMain.handle("save-quit", (e, content) => {
    if (JSON.stringify(workingFile) !== "{}") {
        let choice = dialog.showMessageBoxSync(this,
            {
                type: 'question',
                title: 'Save your Work',
                message: 'Do you want to save your work before quitting',
                buttons: ['Yes', 'No'],
            });
        if (choice === 0) {
            if (fs.existsSync(workingFile["basePath"])) {
                saveShow(content).then(() => {
                    fs.rmSync(workingFile["basePath"], {recursive: true, force: true});
                    fs.rmSync(path.join(workingFile['directory'], `${projectRandom}.json`))
                    dialog.showMessageBoxSync({
                        title: "File Save",
                        message: "File Saved Successfully",
                        type: "info"
                    })
                    showCreatorView.destroy()
                    app.quit()
                }).catch(err => {
                    dialog.showMessageBoxSync({
                        title: "File Save",
                        message: `An error occurred during saving the file \n ${err}`,
                        type: "info"
                    })
                })
            } else {
                showCreatorView.destroy()
                app.quit()
            }
        }
    }
})

ipcMain.handle("slideshow:start", (e, content) => {
    saveShow(content).then(() => {
        let displays = electron.screen.getAllDisplays()
        const externalDisplay = displays.find((display) => {
            return display.bounds.x !== 0 || display.bounds.y !== 0
        })

        let data = structuredClone(workingFile)
        data["content"] = content
        if (externalDisplay) {
            presenterView = createPresenterView()
            presenterView.webContents.once('dom-ready', () => {
                presenterView.webContents.send("file-params", data)
            })

            presenterView.on('close', () => {
                fs.rmSync(workingFile["basePath"], {recursive: true, force: true});
                fs.rmSync(workingFile["filePath"].replace(".chs", ".json"))
            })
            presentationView = createPresentationView(presenterView, externalDisplay.bounds.x, externalDisplay.bounds.y)
        } else {
            // presentationView = createPresentationView(null)
            // "Please make sure to connect another screen and the projection mode is set to Extend"
            dialog.showMessageBoxSync(showCreatorView, {
                type: 'error',
                title: "No Second Screen Detected",
                message: "Please make sure to connect another screen and the projection mode is set to Extend"
            })
        }
        showCreatorView.destroy()
        console.log(workingFile)
    })
})

//presenter:main
//main:presentation
ipcMain.on("to-presentation", (e, msg) => {
    // console.log(msg)
    presentationView?.webContents.send("main:presentation", msg)
})

