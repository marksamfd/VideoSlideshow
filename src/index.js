const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  protocol,
  powerSaveBlocker,
} = require("electron");
const path = require("path");
const electron = require("electron");

import {
  createPresentationView,
  createShowCreatorView,
  createPresenterView,
} from "./createViews";
import MediaResponder from "./utils/MediaResponderClass";
import WorkingFile from "./workingFile";
const fontList = require("font-list");
import progress from "progress-stream";
import log from "electron-log/main";
import * as Sentry from "@sentry/electron/main";
import process from "process";

const powerSaveBlockerId = powerSaveBlocker.start("prevent-display-sleep");

// app.commandLine.appendSwitch("disable-print-preview");
// app.commandLine.appendSwitch("disable-translate");
// app.commandLine.appendSwitch("disable-domain-reliability");
// app.commandLine.appendSwitch("disable-sync");
// app.commandLine.appendSwitch("disable-speech-api");
// app.commandLine.appendSwitch("disable-features", "InterestFeedContent,Translate");
// app.commandLine.appendSwitch("disable-webrtc");
// app.commandLine.appendSwitch("disable-autofill");
// app.commandLine.appendSwitch("disable-client-side-phishing-detection");

/* if (app.isPackaged) {
  log.initialize({ spyRendererConsole: true });
  log.transports.file.format =
    "[{d}/{m}/{y} -{h}:{i}:{s}.{ms}] [{processType}] {text}";
  // log.transports.console.level = false;
  Object.assign(console, log.functions);
} */
Sentry.init({
  dsn: "https://6af2ef87eb56857c4d16241ba118d39f@o4509875546030080.ingest.de.sentry.io/4509875549962320",
  enabled: app.isPackaged,
});

/**
 *  The open project Now
 * @type {WorkingFile}
 */
let currentProject;
let presentationView, presenterView, showCreatorView;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

protocol.registerSchemesAsPrivileged([
  {
    scheme: "media",
    privileges: {
      secure: true,
      bypassCSP: true,
      stream: true,
      supportFetchAPI: true,
      standard: true,
    },
  },
]);

app.disableHardwareAcceleration();
let canQuit = false;
let saveProgress = progress({});
import progressDialog from "electron-progressbar";
var progressBar;

saveProgress.on("progress", (data) => {
  let currentPercent = data.percentage / 100;
  progressBar.value = currentPercent;
  showCreatorView.setProgressBar(currentPercent);
});

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
});

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

ipcMain.handle("file-dialog-open", (e, mode) => {
  let filePath;
  let fileFilters = [{ name: "ChoirSlide Files", extensions: ["chs", "json"] }];
  if (mode === "o") {
    filePath = dialog.showOpenDialogSync(BrowserWindow.getFocusedWindow(), {
      properties: ["openFile"],
      filters: fileFilters,
    });
  } else if (mode === "s") {
    filePath = dialog.showSaveDialogSync(BrowserWindow.getFocusedWindow(), {
      properties: ["openFile"],
      filters: fileFilters,
    });
  }
  return filePath ? filePath : "";
});

ipcMain.handle("file-opened", async (e, data) => {
  let mainWindow = BrowserWindow.getFocusedWindow().getParentWindow();
  BrowserWindow.getFocusedWindow().destroy();
  currentProject = new WorkingFile({ ...data });
  if (!data.present) {
    await currentProject.editProject();

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
    title: "File Save",
    message: "File Saved",
    type: "info",
  });
});

ipcMain.handle("save-quit", async (e, content) => {
  // showCreatorView.setProgressBar(1.1, { mode: "indeterminate" });
  progressBar = new progressDialog({
    indeterminate: false,
    title: "File is Saving",
    text: "",
    detail: "Saving is in progress",
    maxValue: 1,
    browserWindow: {
      parent: showCreatorView,
    },
  });

  progressBar.on("progress", function (value) {
    progressBar.detail = `Saving ${Math.floor(value * 100)}%`;
  });
  return currentProject?.closeProject(content, saveProgress);
});

ipcMain.on("save-done", () => {
  canQuit = true;
  showCreatorView.setProgressBar(-1);
  if (showCreatorView) {
    showCreatorView.close();
  }
});

ipcMain.handle("getSystemFonts", async () => {
  return fontList.getFonts({ disableQuoting: true });
});

ipcMain.on(
  "addSlideFiles",
  (_, { imgBase64, imgFileName, videoFilePath, videoFileName }) => {
    const base64Data = imgBase64.replace(/^data:image\/png;base64,/, "");
    let imgBuffer = Buffer.from(base64Data, "base64");
    currentProject.addVideoSlideFiles({
      imgBuffer,
      imgFileName,
      videoFilePath,
      videoFileName,
    });
  }
);

function initPresentationView() {
  let displays = electron.screen.getAllDisplays();
  const externalDisplay = displays.find((display) => {
    return display.bounds.x !== 0 || display.bounds.y !== 0;
  });

  let data = currentProject.toObject();
  console.log(data);
  if (externalDisplay) {
    presenterView = createPresenterView();
    presenterView.webContents.once("dom-ready", () => {
      presenterView.webContents.send("file-params", data);
    });

    presentationView = createPresentationView(
      presenterView,
      externalDisplay.bounds.x,
      externalDisplay.bounds.y
    );
    presentationView.webContents.once("dom-ready", () => {
      presentationView.webContents.send("main:presentation", {
        type: "init",
        data,
      });
    });
    showCreatorView.destroy();
    presenterView.focus();
  } else {
    dialog.showMessageBoxSync(showCreatorView, {
      type: "error",
      title: "No Second Screen Detected",
      message:
        "Please make sure to connect another screen and the projection mode is set to Extend",
    });
  }
}

ipcMain.handle("slideshow:start", (e, content) => {
  let choice = dialog.showMessageBoxSync(showCreatorView, {
    type: "question",
    title: "Save your Work",
    message:
      "Please make sure that you have saved the show before starting \nAre you sure you want to continue ?",
    buttons: ["Yes", "No"],
  });
  if (choice === 0) {
    initPresentationView();
  }
});

//presenter:main
//main:presentation
ipcMain.on("to-presentation", (e, msg) => {
  // console.log(msg)
  presentationView?.webContents.send("main:presentation", msg);
});
