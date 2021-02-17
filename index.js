const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");
const { run } = require("@elastic/synthetics");
const unhandled = require("electron-unhandled");
const debug = require("electron-debug");

unhandled();
debug();

// Prevent window from being garbage collected
let mainWindow;

async function createWindow() {
  const win = new BrowserWindow({
    title: "Synthetics Recorder",
    show: false,
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  win.on("ready-to-show", () => {
    win.show();
  });
  win.on("closed", () => {
    mainWindow = null;
  });

  ipcMain.on("start", async (event, data) => {
    /**
     * Load journeys
     */
    require("./journeys/basic.journey");
    const results = await run({
      outfd: process.stdout.fd,
    });
    event.sender.send("done", results);
  });

  await win.loadFile(path.join(__dirname, "index.html"));
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.whenReady().then(createWindow).catch(console.error);

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});
