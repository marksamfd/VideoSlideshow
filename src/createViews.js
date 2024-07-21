import {app, BrowserWindow, Menu} from "electron";

const createPresentationView = (parent, x = 0, y = 0) => {
    // Create the browser window.
    let presentationView = new BrowserWindow({
        x,
        y,
        width: 800,
        height: 600,
        parent,
        fullscreen: true,
        alwaysOnTop: app.isPackaged,
        // parent: presenterView,
        webPreferences: {
            preload: PRESENTATION_VIEW_PRELOAD_WEBPACK_ENTRY,
            contextIsolation: true,
            sandbox: false,
            webSecurity: app.isPackaged,
            allowRunningInsecureContent: app.isPackaged
        },
    });


    presentationView.setMenu(null)
    // and load the index.html of the app.
    presentationView.loadURL(PRESENTATION_VIEW_WEBPACK_ENTRY);
    // Open the DevTools.
    if (!app.isPackaged)
        presentationView.webContents.openDevTools();

    return presentationView
};


const createPresenterView = () => {
    // Create the browser window.
    let presenterView = new BrowserWindow({
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
                /*{
                    label: 'Open Presentation',
                    click: () => {
                        createOpenFileDialog(presenterView)
                    }
                },
                {
                    label: 'Reload Presentation',
                    click: () => {
                        createOpenFileDialog()
                    }
                },
                {type: 'separator'},*/
                isMac ? {role: 'close'} : {role: 'quit'},
            ]
        },
        // { role: 'viewMenu' }
        ...(!app.isPackaged ? [{
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
        }] : []),
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
        }
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
    // and load the index.html of the app.
    presenterView.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    presenterView.maximize()
    // Open the DevTools.
    if (!app.isPackaged) {
        presenterView.webContents.openDevTools();
    }

    return presenterView
};

/**
 *
 * @return {Electron.CrossProcessExports.BrowserWindow}
 */
const createShowCreatorView = () => {
    // Create the browser window.
    let showCreatorView = new BrowserWindow({
        width: 800,
        height: 600,

        /*fullscreen: true,*/
        webPreferences: {
            preload: SHOW_CREATOR_VIEW_PRELOAD_WEBPACK_ENTRY,
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
                    label: 'Create a Show',
                    click: () => {
                        createSaveFileDialog(showCreatorView)
                    }
                },
                {
                    label: 'Open Existing Show',
                    click: () => {
                        createOpenFileDialog(showCreatorView)
                    }
                },
                {type: 'separator'},
                isMac ? {role: 'close'} : {role: 'quit'},
            ]
        },
        // { role: 'viewMenu' }
        ...(!app.isPackaged ? [{
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
        }] : []),
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
            label: 'Slideshow',
            submenu: [
                {
                    label: 'Start Show',
                    click: async () => {
                        showCreatorView.webContents.send("slideshow:init")
                    }
                }
            ]
        }
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
    // and load the index.html of the app.
    showCreatorView.loadURL(SHOW_CREATOR_VIEW_WEBPACK_ENTRY);

    showCreatorView.maximize()
    if (!app.isPackaged) {
        // Open the DevTools.
        showCreatorView.webContents.openDevTools();
    }
    return showCreatorView

};

const createOpenFileDialog = (parent) => {
    // Create the browser window.
    let openFileDialog = new BrowserWindow({
        width: 600,
        height: 215,
        parent,
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
    return openFileDialog
};

const createSaveFileDialog = (parent) => {
    // Create the browser window.
    let openFileDialog = new BrowserWindow({
        width: 600,
        height: 215,
        parent,
        modal: true,
        resizable: false,
        maximizable: false,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
            contextIsolation: true,
        },
    });
    openFileDialog.setMenu(null)
    openFileDialog.loadURL(SAVE_FILE_DIALOG_WEBPACK_ENTRY);
    return openFileDialog
};

export {createPresenterView, createShowCreatorView, createPresentationView}