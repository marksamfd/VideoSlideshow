const {app, BrowserWindow, ipcMain, dialog, protocol, net} = require('electron');
const path = require('path'), fs = require("fs")
const {pathToFileURL} = require('url')
const electron = require("electron");

import {createPresentationView, createShowCreatorView, createPresenterView} from './createViews'
import WorkingFile from './workingFile'
import log from 'electron-log/main';

let VidFilestream;


if (app.isPackaged) {
    log.initialize({spyRendererConsole: true});
    log.transports.file.format = '[{h}:{i}:{s}.{ms}] [{processType}] {text}';
// log.transports.console.level = false;
    Object.assign(console, log.functions);
}

/**
 *  The open project Now
 * @type {WorkingFile}
 */
let currentProject = new WorkingFile({filePath: pathToFileURL(process.cwd())});
let presentationView, presenterView, showCreatorView;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

protocol.registerSchemesAsPrivileged([
    {
        scheme: "media",
        privileges: {
            // secure: true,
            bypassCSP: true,
            stream: true,
        },
    },
])

app.disableHardwareAcceleration()

function parseRangeRequests(text, size) {
    const token = text.split("=");
    if (token.length !== 2 || token[0] !== "bytes") {
        return [];
    }

    return token[1]
        .split(",")
        .map((v) => parseRange(v, size))
        .filter(([start, end]) => !isNaN(start) && !isNaN(end) && start <= end);
}

const NAN_ARRAY = [NaN, NaN];

function parseRange(text, size) {
    const token = text.split("-");
    if (token.length !== 2) {
        return NAN_ARRAY;
    }

    const startText = token[0].trim();
    const endText = token[1].trim();

    if (startText === "") {
        if (endText === "") {
            return NAN_ARRAY;
        } else {
            let start = size - Number(endText);
            if (start < 0) {
                start = 0;
            }

            return [start, size - 1];
        }
    } else {
        if (endText === "") {
            return [Number(startText), size - 1];
        } else {
            let end = Number(endText);
            if (end >= size) {
                end = size - 1;
            }

            return [Number(startText), end];
        }
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    protocol.handle("media", (request) => {
        // https://github.com/electron/electron/issues/38749#issuecomment-1681531939
        const fp = path.join(currentProject.basePath, decodeURIComponent(request.url.slice('media://'.length)))
        const stats = fs.statSync(fp);

        // console.log(fp, stats)
        const headers = new Headers();
        headers.set("Accept-Ranges", "bytes");
        headers.set("Content-Type", "video/mp4");

        let status = 200;
        const rangeText = request.headers.get("range");

        if (rangeText) {
            const ranges = parseRangeRequests(rangeText, stats.size);

            const [start, end] = ranges[0];
            // console.log(rangeText, stats.size, start, end);
            headers.set("Content-Length", `${end - start + 1}`);
            headers.set("Content-Range", `bytes ${start}-${end}/${stats.size}`);
            status = 206;
            VidFilestream = fs.createReadStream(fp, {start, end});
        } else {
            headers.set("Content-Length", `${stats.size}`);
            VidFilestream = fs.createReadStream(fp);

        }

        return new Response(VidFilestream, {
            headers,
            status,
        });
    })

    showCreatorView = createShowCreatorView()
    showCreatorView.on('close', (e) => {
        if (currentProject.isOpened) {
            let choice = dialog.showMessageBoxSync(showCreatorView,
                {
                    type: 'question',
                    title: 'Save your Work',
                    message: 'Make sure to save your work before Quitting \nAre you sure you want to Quit?',
                    buttons: ['Yes', 'No'],
                })
            if (choice === 1) {
                e.preventDefault()
            } else {
                if (currentProject.isOpened) {
                    VidFilestream?.destroy()
                    currentProject.closeProject()
                }
            }
        }
    })
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {

    if (process.platform !== 'darwin') {
        app.quit();
    }
});


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

    if (currentProject.isOpened) {
        VidFilestream?.destroy()
        mainWindow.webContents.send("slideshow:destroy")
        currentProject.closeProject()
    }

    currentProject = new WorkingFile(data)

    if (!fs.existsSync(data["filePath"])) {
        currentProject.createProject()
    } else {
        currentProject.openProject()
    }
    mainWindow.setTitle(`ChoirSlide - ${currentProject.projectName}`)
    mainWindow.webContents.send("file-params", currentProject.toObject());
})

ipcMain.handle("file-save", (e, content) => {
    dialog.showMessageBox(BrowserWindow.fromId(e.frameId), {
        title: "File Save",
        message: "File Is Saving",
        type: "info",
    })

    currentProject.saveProject(content).then(() => {
        dialog.showMessageBox(BrowserWindow.fromId(e.frameId), {
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
    return fs.writeFileSync(`${currentProject.basePath}/${props.filename}.png`, base64Data, 'base64');
})

ipcMain.handle("copy-video", (e, videoOriginalPath) => {
    console.log(videoOriginalPath)
    let videoFileName = path.basename(videoOriginalPath)
    return fs.copyFileSync(`${videoOriginalPath}`, `${currentProject.basePath}/${videoFileName}`)
})

ipcMain.handle("save-quit", async (e, content) => {
    log.info("Save and quit IPC")
    /*if (JSON.stringify(workingFile) !== "{}") {
        let choice = dialog.showMessageBoxSync(BrowserWindow.fromWebContents(e.sender),
            {
                type: 'question',
                title: 'Save your Work',
                message: 'Do you want to save your work before quitting',
                buttons: ['Yes', 'No'],
            });
        if (choice === 0) {
            if (fs.existsSync(workingFile["basePath"])) {
                try {
                    await saveShow(content)
                    fs.rmSync(path.join(workingFile['directory'], `${projectRandom}.json`))
                    fs.rmSync(workingFile["basePath"], {recursive: true, force: true});
                    dialog.showMessageBoxSync(BrowserWindow.fromWebContents(e.sender), {
                        title: "File Save",
                        message: "File Saved Successfully",
                        type: "info"
                    })
                    showCreatorView.destroy()
                    app.quit()
                } catch (err) {
                    dialog.showMessageBoxSync(BrowserWindow.fromWebContents(e.sender), {
                        title: "File Save",
                        message: `An error occurred during saving the file \n ${err}`,
                        type: "error"
                    })
                }
            } else {
                showCreatorView.destroy()
                app.quit()
            }
        } else {
            showCreatorView.destroy()
            app.quit()
        }
    }*/
})

ipcMain.handle("slideshow:start", (e, content) => {

    let choice = dialog.showMessageBoxSync(showCreatorView,
        {
            type: 'question',
            title: 'Save your Work',
            message: 'Please make sure that you have saved the show before starting \nAre you sure you want to continue ?',
            buttons: ['Yes', 'No'],
        });
    if (choice === 0) {
        let displays = electron.screen.getAllDisplays()
        const externalDisplay = displays.find((display) => {
            return display.bounds.x !== 0 || display.bounds.y !== 0
        })

        let data = currentProject.toObject()
        if (externalDisplay) {
            presenterView = createPresenterView()
            presenterView.webContents.once('dom-ready', () => {
                presenterView.webContents.send("file-params", data)
            })

            presenterView.on('close', () => {
                currentProject.closeProject()
            })
            presentationView = createPresentationView(presenterView, externalDisplay.bounds.x, externalDisplay.bounds.y)
            presentationView.webContents.once('dom-ready', () => {
                presentationView.webContents.send("main:presentation", {type: "init", data})
            })
            showCreatorView.destroy()
            presenterView.focus()
        } else {
            dialog.showMessageBoxSync(showCreatorView, {
                type: 'error',
                title: "No Second Screen Detected",
                message: "Please make sure to connect another screen and the projection mode is set to Extend"
            })
        }
    }
})

//presenter:main
//main:presentation
ipcMain.on("to-presentation", (e, msg) => {
    // console.log(msg)
    presentationView?.webContents.send("main:presentation", msg)
})

