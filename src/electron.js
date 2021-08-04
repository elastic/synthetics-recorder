const { join } = require("path");
const { app, BrowserWindow } = require("electron");
const isDev = require("electron-is-dev");
const unhandled = require("electron-unhandled");
require("./core/execution");

unhandled();

const BUILD_DIR = join(__dirname, "..", "build");

async function createWindow() {
  const win = new BrowserWindow({
    title: "Synthetics Recorder",
    show: false,
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  win.on("ready-to-show", () => win.show());

  isDev
    ? win.loadURL("http://localhost:3000")
    : win.loadFile(join(BUILD_DIR, "index.html"));

  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
  }
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.whenReady().then(createWindow).catch(console.error);

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
