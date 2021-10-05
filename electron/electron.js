const { join } = require("path");
const { app, BrowserWindow, Menu } = require("electron");
const isDev = require("electron-is-dev");
const unhandled = require("electron-unhandled");
const debug = require("electron-debug");
const logger = require("electron-log");
const setupListeners = require("./execution");
const buildMenu = require("./menu");

// For dev
unhandled({ logger: err => logger.error(err) });
debug({ enabled: true, showDevTools: false });

const BUILD_DIR = join(__dirname, "..", "build");

async function createWindow() {
  const win = new BrowserWindow({
    width: 1445,
    height: 788,
    minHeight: 500,
    minWidth: 800,
    webPreferences: {
      devTools: isDev,
      nodeIntegration: true,
      contextIsolation: false,
      nativeWindowOpen: true,
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

app.whenReady().then(() => {
  createWindow();
  setupListeners();
  createMenu();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
