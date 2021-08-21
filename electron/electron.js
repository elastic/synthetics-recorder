const { join } = require("path");
const { app, BrowserWindow } = require("electron");
const isDev = require("electron-is-dev");
const unhandled = require("electron-unhandled");
const debug = require("electron-debug");
const initAutoUpdate = require("update-electron-app");
const setupListeners = require("./execution");

// For dev
unhandled();
debug({ enabled: true, showDevTools: false });

// Update the app
// TODO - Change repo location after moving to Elastic
initAutoUpdate({
  repo: "vigneshshanmugam/synthetics-recorder",
  updateInterval: "1 hour",
});

const BUILD_DIR = join(__dirname, "..", "build");

async function createWindow() {
  const win = new BrowserWindow({
    title: "Synthetics Recorder",
    width: 1000,
    height: 600,
    webPreferences: {
      devTools: isDev,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  isDev
    ? win.loadURL("http://localhost:3000")
    : win.loadFile(join(BUILD_DIR, "index.html"));
}

app.on("ready", () => {
  createWindow();
  setupListeners();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
