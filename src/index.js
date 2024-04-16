const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path'),
    fs = require("fs")
app.commandLine.appendSwitch("enable-features","allow-file-access-from-files")
console.log(app.commandLine.hasSwitch("allow-file-access-from-files"))
let presentationView, presenterView;
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const createPresentationView = () => {
    // Create the browser window.
    presentationView = new BrowserWindow({
        width: 800,
        height: 600,
        fullscreen: true,
        webPreferences: {
            preload: PRESENTATION_VIEW_PRELOAD_WEBPACK_ENTRY,
            contextIsolation: true,
            sandbox: false
        },
    });

    presentationView.setMenu(null)
    // and load the index.html of the app.
    presentationView.loadURL(PRESENTATION_VIEW_WEBPACK_ENTRY);

    // Open the DevTools.
    presentationView.webContents.openDevTools();
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
            sandbox: false
        },
    });
    const isMac = process.platform === 'darwin'

    const template = [
        // { role: 'appMenu' }
        ...(isMac
            ? [{
                label: app.name,
                submenu: [
                    { role: 'about' },
                    { type: 'separator' },
                    { role: 'services' },
                    { type: 'separator' },
                    { role: 'hide' },
                    { role: 'hideOthers' },
                    { role: 'unhide' },
                    { type: 'separator' },
                    { role: 'quit' }
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
                { type: 'separator' },
                isMac ? { role: 'close' } : { role: 'quit' },
            ]
        },
        // { role: 'viewMenu' }
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        // { role: 'windowMenu' }
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                ...(isMac
                    ? [
                        { type: 'separator' },
                        { role: 'front' },
                        { type: 'separator' },
                        { role: 'window' }
                    ]
                    : [
                        { role: 'close' }
                    ])
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click: async () => {
                        const { shell } = require('electron')
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


};

const createOpenFileDialog = () => {
    // Create the browser window.
    let fileDialog = new BrowserWindow({
        width: 600,
        height: 215,
        parent: presenterView,
        resizable: false,
        maximizable: false,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
            contextIsolation: true,
    
        },
    });

    fileDialog.setMenu(null)
    // and load the index.html of the app.
    fileDialog.loadURL(OPEN_FILE_DIALOG_WEBPACK_ENTRY);
    fileDialog.webContents.openDevTools()
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    createPresentationView()
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
        createPresentationView();
    }
});

ipcMain.handle("file-open", (e, mode) => {
    let filePath = dialog.showOpenDialogSync(presentationView, {
        properties: ["openFile"],
        filters: [{ name: "JSON Files", extensions: ["json"] }]
    })
    if (mode === "d" && filePath) {
        return filePath
    }
    if (mode === "c" && filePath) {
        let contents = fs.readFileSync(filePath[0], { encoding: "utf8" })
        return [path.dirname(filePath[0]), contents]
    }

})

ipcMain.handle("file-opened", (e,data) => {
    console.log(data);

})

ipcMain.on("toFirstScreen", () => {

})

ipcMain.on("toSecondScreen", () => {

})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
