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

import { join } from 'path';
import { app, BrowserWindow, Menu } from 'electron';
import isDev from 'electron-is-dev';
import unhandled from 'electron-unhandled';
import debug from 'electron-debug';
import logger from 'electron-log';
import setupListeners, { MainWindowEvent } from './execution';
import { buildMenu } from './menu';
import { EventEmitter } from 'events';
// For dev
unhandled({ logger: err => logger.error(err) });
debug({ isEnabled: true, showDevTools: false });

const BUILD_DIR = join(__dirname, '..', '..', 'build');

// We can't read from the `env` file within `services` here
// so we must access the process env directly
const IS_TEST = process.env.NODE_ENV === 'test';
const TEST_PORT = process.env.TEST_PORT;

async function createWindow() {
  const mainWindowEmitter = new EventEmitter();
  const win = new BrowserWindow({
    width: 1100,
    height: 700,
    minHeight: 500,
    minWidth: 800,
    webPreferences: {
      devTools: isDev || IS_TEST,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (isDev && !IS_TEST) {
    win.loadURL('http://localhost:3000');
  } else if (IS_TEST && TEST_PORT) {
    win.loadURL(`http://localhost:${TEST_PORT}`);
  } else {
    win.loadFile(join(BUILD_DIR, 'index.html'));
  }
  win.on('close', () => {
    mainWindowEmitter.emit(MainWindowEvent.MAIN_CLOSE);
  });
  win.on('closed', () => {
    mainWindowEmitter.removeAllListeners();
  });
  return mainWindowEmitter;
}

async function initMainWindow() {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
}

function createMenu() {
  const menuTemplate = buildMenu(app.name, initMainWindow);
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
}

async function createMainWindow() {
  if (BrowserWindow.getAllWindows().length === 0) {
    const mainWindowEmitter = await createWindow();
    const ipcListenerDestructors = setupListeners(mainWindowEmitter);
    mainWindowEmitter.addListener(MainWindowEvent.MAIN_CLOSE, () =>
      ipcListenerDestructors.forEach(f => f())
    );
    createMenu();
  }
}

app.on('activate', createMainWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// kick off the main process when electron is ready
(async function () {
  await app.whenReady();
  return createMainWindow();
})();
