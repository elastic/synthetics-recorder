const { join } = require("path");
const { app, BrowserWindow, Menu } = require("electron");
const isDev = require("electron-is-dev");
const unhandled = require("electron-unhandled");
const debug = require("electron-debug");
const initAutoUpdate = require("update-electron-app");
const setupListeners = require("./execution");
const buildMenu = require("./menu");

// For dev
unhandled();
debug({ enabled: true, showDevTools: false });

// Looks for updates
initAutoUpdate({
  repo: "elastic/synthetics-recorder",
  updateInterval: "1 hour",
});

const BUILD_DIR = join(__dirname, "..", "build");

async function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 700,
    minHeight: 500,
    minWidth: 800,
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

function createMenu() {
  const menuTemplate = buildMenu(app.name);
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
}

app.on("ready", () => {
  createWindow();
  setupListeners();
  createMenu();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
