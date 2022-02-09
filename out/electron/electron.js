"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const electron_1 = require("electron");
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
const electron_unhandled_1 = __importDefault(require("electron-unhandled"));
const electron_debug_1 = __importDefault(require("electron-debug"));
const electron_log_1 = __importDefault(require("electron-log"));
const execution_1 = __importDefault(require("./execution"));
const menu_1 = require("./menu");
// For dev
(0, electron_unhandled_1.default)({ logger: err => electron_log_1.default.error(err) });
(0, electron_debug_1.default)({ isEnabled: true, showDevTools: false });
const BUILD_DIR = (0, path_1.join)(__dirname, "..", "build");
// We can't read from the `env` file within `services` here
// so we must access the process env directly
const IS_TEST = process.env.NODE_ENV === "test";
const TEST_PORT = process.env.TEST_PORT;
async function createWindow() {
    const win = new electron_1.BrowserWindow({
        width: 1100,
        height: 700,
        minHeight: 500,
        minWidth: 800,
        webPreferences: {
            devTools: electron_is_dev_1.default || IS_TEST,
            nodeIntegration: true,
            contextIsolation: false,
            nativeWindowOpen: true,
        },
    });
    if (electron_is_dev_1.default && !IS_TEST) {
        win.loadURL("http://localhost:3000");
    }
    else if (IS_TEST && TEST_PORT) {
        win.loadURL(`http://localhost:${TEST_PORT}`);
    }
    else {
        win.loadFile((0, path_1.join)(BUILD_DIR, "index.html"));
    }
}
function createMenu() {
    const menuTemplate = (0, menu_1.buildMenu)(electron_1.app.name);
    electron_1.Menu.setApplicationMenu(electron_1.Menu.buildFromTemplate(menuTemplate));
}
electron_1.app.whenReady().then(() => {
    createWindow();
    (0, execution_1.default)();
    createMenu();
    electron_1.app.on("activate", function () {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
