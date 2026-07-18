import GreenOverlay from "./OverlayUtils";

const {
    app, BrowserWindow, ipcMain, dialog, protocol, powerSaveBlocker,
} = require("electron");
const path = require("path");
const electron = require("electron");

import {
    createPresentationView, createShowCreatorView, createPresenterView,
} from "./createViews";
import MediaResponder from "./utils/MediaResponderClass";
import WorkingFile from "./workingFile";

const fontList = require("font-list");
import progress from "progress-stream";
import log from "electron-log/main";
import * as Sentry from "@sentry/electron/main";
import process from "process";
import {IPCEvents} from "./IPCmsg";

const powerSaveBlockerId = powerSaveBlocker.start("prevent-display-sleep");

app.commandLine.appendSwitch("disable-print-preview");
app.commandLine.appendSwitch("disable-translate");
app.commandLine.appendSwitch("disable-domain-reliability");
app.commandLine.appendSwitch("disable-sync");
app.commandLine.appendSwitch("disable-speech-api");
app.commandLine.appendSwitch("disable-features", "InterestFeedContent,Translate");
app.commandLine.appendSwitch("disable-webrtc");
app.commandLine.appendSwitch("disable-autofill");
app.commandLine.appendSwitch("disable-client-side-phishing-detection");

if (app.isPackaged) {
    log.initialize({spyRendererConsole: true});
    log.transports.file.format = "[{d}/{m}/{y} -{h}:{i}:{s}.{ms}] [{level}]: [{processType}] {text}";
    // log.transports.console.level = false;
    Object.assign(console, log.functions);
}
Sentry.init({
    dsn: "https://6af2ef87eb56857c4d16241ba118d39f@o4509875546030080.ingest.de.sentry.io/4509875549962320",
    enabled: app.isPackaged,
});

/**
 *  The open project Now
 * @type {WorkingFile}
 */
let currentProject;
let presentationView, presenterView, showCreatorView, overlay;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
    app.quit();
}

protocol.registerSchemesAsPrivileged([{
    scheme: "media", privileges: {
        secure: true, bypassCSP: true, stream: true, supportFetchAPI: true, standard: true,
    },
},]);

app.disableHardwareAcceleration();
let canQuit = false;
import progressDialog from "electron-progressbar";
import workingFile from "./workingFile";

var progressBarDialog;


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
    protocol.handle("media", async (request) => {
        const responder = new MediaResponder(request, currentProject);
        return await responder.handle();

        // https://github.com/electron/electron/issues/38749#issuecomment-1681531939
    });

    showCreatorView = createShowCreatorView();
    showCreatorView.on("close", (e) => {
        if (currentProject?.isOpened && !canQuit) {
            e.preventDefault(); // stop immediate close
            powerSaveBlocker.stop(powerSaveBlockerId);
            showCreatorView.webContents.send("save-before-quit");
        }
    });
    if (!app.isPackaged) {
        sendOnReload(showCreatorView)
    }

});

function sendOnReload(window) {
    if (window.webContents.listeners("did-finish-load").length === 0)
        window.webContents.on("did-finish-load", () => {
            if (workingFile) {
                window.webContents.send("file-params", currentProject.toObject());
            }
        })
}

//TODO: Handle file open event AND add to whenReady event
function parseWindowsArgs() {
    if (process.platform === 'win32' && process.argv.length >= 2) {
        // The target file path is typically the last item in argv array
        const filePath = process.argv[process.argv.length - 1];

        // Quick sanitization check to ensure it looks like your extension
        if (filePath.endsWith('.xyz')) {
            // fileToOpen = filePath;
        }
    }
}


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createPresenterView();
    }
});


ipcMain.handle(IPCEvents.FILE_OPEN_DIALOG, (e, mode) => {
    let filePath;
    let fileFilters = [{name: "ChoirSlide Files", extensions: ["chs", "json"]}];
    if (mode === "o") {
        filePath = dialog.showOpenDialogSync(BrowserWindow.getFocusedWindow(), {
            properties: ["openFile"], filters: fileFilters,
        });
    } else if (mode === "s") {
        filePath = dialog.showOpenDialogSync(BrowserWindow.getFocusedWindow(), {
            properties: ["openDirectory"], showsTagField: true, filters: fileFilters,
        });
    }
    return filePath ? filePath : "";
});

ipcMain.handle("file-opened", async (e, data) => {
    let mainWindow = BrowserWindow.getFocusedWindow().getParentWindow();
    BrowserWindow.getFocusedWindow().destroy();

    if (currentProject) {
        await currentProject.closeProject()
    }
    currentProject = new WorkingFile({...data});
    if (data.projectName) {
        currentProject.newProject(data.projectName)
    } else {
        currentProject.editProject();
    }
    if (!data.present) {
        mainWindow.setTitle(`ChoirSlide - ${currentProject.projectName}`);
        mainWindow.webContents.send("file-params", currentProject.toObject());
        return;
    }
    await currentProject.presentProject();
    initPresentationView();
});

ipcMain.handle("file-save", (e, content) => {
    currentProject?.saveProject(content);
    dialog.showMessageBox(BrowserWindow.fromId(e.frameId), {
        title: "File Save", message: "File Saved", type: "info",
    });
});

ipcMain.handle("save-quit", async (e, content) => {
    if (currentProject.isNeedRepacking()) {
        progressBarDialog = new progressDialog({
            title: "File is Saving", text: "", detail: "Saving is in progress", browserWindow: {
                parent: showCreatorView,
            },
        });

    }
    try {
        await currentProject?.closeProject(content)
        showCreatorView.setProgressBar(1.2);
        return true
    } catch (e) {
        console.error(e);
        return false;
    }
});

ipcMain.on("save-done", () => {
    canQuit = true;
    showCreatorView.setProgressBar(-1);
    if (showCreatorView) {
        showCreatorView.close();
    }
});

ipcMain.handle("getSystemFonts", async () => {
    return fontList.getFonts({disableQuoting: true});
});

ipcMain.on("addSlideFiles", (_, {imgBase64, imgFileName, videoFilePath, videoFileName}) => {
    const base64Data = imgBase64.replace(/^data:image\/png;base64,/, "");
    let imgBuffer = Buffer.from(base64Data, "base64");
    currentProject.addSlideFiles({
        imgBuffer, imgFileName, videoFilePath, videoFileName,
    });
});

function initPresentationView() {
    let displays = electron.screen.getAllDisplays();
    const externalDisplay = displays.find((display) => {
        return display.bounds.x !== 0 || display.bounds.y !== 0;
    });
    console.log({externalDisplay})
    let data = currentProject.toObject();
    if (!presentationView) {
        presentationView = createPresentationView(presenterView);
        presentationView.webContents.on("dom-ready", () => {
            presentationView.webContents.send(IPCEvents.PRESENTATION_INIT, data);
        });
        if (!app.isPackaged) {
            sendOnReload(presentationView)
        }
        if (externalDisplay) {
            presenterView = createPresenterView();
            presenterView.webContents.once("dom-ready", () => {
                presenterView.webContents.send("file-params", data);
            });
            console.log(externalDisplay.bounds)
            presentationView.setBounds(externalDisplay.bounds);
            presentationView.setFullScreen(true);
            presentationView.setParentWindow(presenterView);

            showCreatorView.destroy();
            presenterView.focus();
            if (!app.isPackaged) {
                sendOnReload(presenterView)
            }
        }
        return
    }
    presenterView.webContents.send("file-params", data);
    presentationView.webContents.send(IPCEvents.PRESENTATION_INIT, data);
    if (overlay) overlay.init(currentProject.toObject())

}

// TODO: start presentation from CreatorView
ipcMain.handle("slideshow:start", (e, content) => {
    let choice = dialog.showMessageBoxSync(showCreatorView, {
        type: "question",
        title: "Save your Work",
        message: "Please make sure that you have saved the show before starting \nAre you sure you want to continue ?",
        buttons: ["Yes", "No"],
    });
    if (choice === 0) {
        initPresentationView();
    }
});

ipcMain.on("to-presentation", (e, msg) => {
    presentationView?.webContents.send(IPCEvents.PRESENTATION_SLIDE_CHANGE, msg);
    overlay?.changeSlide(msg)
});


function overlayStarted(message) {
    presenterView.webContents.send(IPCEvents.OVERLAY_STARTED, message);
}

ipcMain.on(IPCEvents.OVERLAY_START, (e) => {
    if (!overlay) overlay = new GreenOverlay(currentProject, overlayStarted);
})

