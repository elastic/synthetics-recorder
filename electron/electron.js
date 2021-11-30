/*
MIT License

Copyright (c) 2021-present, Elastic NV

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

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
    width: 1100,
    height: 700,
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
