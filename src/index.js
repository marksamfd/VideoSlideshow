const {app, BrowserWindow, ipcMain, dialog, Menu, MessageChannelMain, protocol, net} = require('electron');
const path = require('path'),
    fs = require("fs")
const {pathToFileURL} = require('url')
const electron = require("electron");
const {data} = require("autoprefixer");
let workingFile = {}
let presentationView, presenterView, openFileDialog;

const {port1, port2} = new MessageChannelMain()
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

app.disableHardwareAcceleration()

const createPresentationView = (x = 0,y = 0) => {
    // Create the browser window.
    presentationView = new BrowserWindow({
        x,
        y,
        width: 800,
        height: 600,
        fullscreen: true,
        alwaysOnTop:app.isPackaged,
        parent:presenterView,
        webPreferences: {
            preload: PRESENTATION_VIEW_PRELOAD_WEBPACK_ENTRY,
            contextIsolation: true,
            sandbox: false,
            webSecurity: app.isPackaged,
            allowRunningInsecureContent: app.isPackaged
        },
    });

    console.log(process.env)
    presentationView.setMenu(null)
    // and load the index.html of the app.
    presentationView.loadURL(PRESENTATION_VIEW_WEBPACK_ENTRY);
    // Open the DevTools.
    presentationView.webContents.openDevTools();

    presentationView.once("ready-to-show", () => {
        presentationView.webContents.postMessage('port', null, [port2])
    })
};


const createPresenterView = () => {
    // Create the browser window.
    presenterView = new BrowserWindow({
        width: 800,
        height: 600,

        /*fullscreen: true,*/
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
            contextIsolation: true,
            sandbox: false,
            webSecurity: app.isPackaged,
            allowRunningInsecureContent: app.isPackaged
        },
    });
    const isMac = process.platform === 'darwin'

    const template = [
        // { role: 'appMenu' }
        ...(isMac
            ? [{
                label: app.name,
                submenu: [
                    {role: 'about'},
                    {type: 'separator'},
                    {role: 'services'},
                    {type: 'separator'},
                    {role: 'hide'},
                    {role: 'hideOthers'},
                    {role: 'unhide'},
                    {type: 'separator'},
                    {role: 'quit'}
                ]
            }]
            : []),
        // { role: 'fileMenu' }
        {
            label: 'File',
            submenu: [
                {
                    label: 'Open Presentation',
                    click: () => {
                        createOpenFileDialog()
                    }
                },
                {
                    label: 'Reload Presentation',
                    click: () => {
                        createOpenFileDialog()
                    }
                },
                {type: 'separator'},
                isMac ? {role: 'close'} : {role: 'quit'},
            ]
        },
        // { role: 'viewMenu' }
        {
            label: 'View',
            submenu: [
                {role: 'reload'},
                {role: 'forceReload'},
                {role: 'toggleDevTools'},
                {type: 'separator'},
                {role: 'resetZoom'},
                {role: 'zoomIn'},
                {role: 'zoomOut'},
                {type: 'separator'},
                {role: 'togglefullscreen'}
            ]
        },
        // { role: 'windowMenu' }
        {
            label: 'Window',
            submenu: [
                {role: 'minimize'},
                ...(isMac
                    ? [
                        {type: 'separator'},
                        {role: 'front'},
                        {type: 'separator'},
                        {role: 'window'}
                    ]
                    : [
                        {role: 'close'}
                    ])
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click: async () => {
                        const {shell} = require('electron')
                        await shell.openExternal('https://electronjs.org')
                    }
                }
            ]
        }
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
    // and load the index.html of the app.
    presenterView.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    presenterView.maximize()
    // Open the DevTools.
    presenterView.webContents.openDevTools();

    presenterView.once('ready-to-show', () => {
        presenterView.webContents.postMessage('port', null, [port1])
    })

};

const createOpenFileDialog = () => {
    // Create the browser window.
    openFileDialog = new BrowserWindow({
        width: 600,
        height: 215,
        parent: presenterView,
        modal: true,
        resizable: false,
        maximizable: false,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
            contextIsolation: true,
        },
    });
    openFileDialog.setMenu(null)
    openFileDialog.loadURL(OPEN_FILE_DIALOG_WEBPACK_ENTRY);
};

protocol.registerSchemesAsPrivileged([
    {scheme: 'media-loader', privileges: {bypassCSP: true, supportFetchAPI: true, stream: true, secure: true}}
])

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.commandLine.appendSwitch('--force_high_performance_gpu')
app.on('ready', () => {
    protocol.handle('media-loader', (request) =>
        net.fetch(pathToFileURL(decodeURIComponent(request.url.slice('media-loader://'.length)))))

    createPresenterView()

    let displays = electron.screen.getAllDisplays()
    let externalDisplay = displays.find((display) => {
        return display.bounds.x !== 0 || display.bounds.y !== 0
    })

    createPresentationView(externalDisplay.bounds.x,externalDisplay.bounds.y)
    // console.log(app.getAppMetrics())
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

ipcMain.handle("file-open", (e, mode) => {
    let filePath = dialog.showOpenDialogSync(presentationView, {
        properties: ["openFile"],
        filters: [{name: "JSON Files", extensions: ["json"]}]
    })
    if (mode === "d" && filePath) {
        return filePath
    }
    if (mode === "c" && filePath) {
        let contents = fs.readFileSync(filePath[0], {encoding: "utf8"})
        return [path.dirname(filePath[0]), contents]
    }

})

ipcMain.handle("file-opened", (e, data) => {
    openFileDialog.destroy();
    data["basePath"] = path.dirname(data["filePath"])
    workingFile = structuredClone(data)
    data["content"] = fs.readFileSync(data["filePath"], {encoding: "utf8"})
    presenterView.webContents.send("file-params", data);
})

ipcMain.on("create-thumb", (e, props) => {
    const base64Data = props.pic.replace(/^data:image\/png;base64,/, "");
    fs.writeFile(`${workingFile.basePath}/${props.filename}.png`, base64Data, 'base64', function (err) {
        console.log(err);
    });
})


//presenter:main
//main:presentation

ipcMain.on("to-presentation", (e,msg) => {
    console.log(msg)
    presentationView?.webContents.send("main:presentation",msg)
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
