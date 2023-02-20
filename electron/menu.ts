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

import type { MenuItemConstructorOptions } from 'electron';
import path from 'path';
import { BrowserWindow, shell } from 'electron';
import isDev from 'electron-is-dev';

export function buildMenu(appName: string): MenuItemConstructorOptions[] {
  const isMac = process.platform === 'darwin';
  const template: MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [isMac ? { role: 'close' } : { role: 'quit' }],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [{ role: 'reload' }, { role: 'forceReload' }],
    },
    {
      role: 'window',
      label: 'Window',
      submenu: [{ role: 'minimize' }, { role: 'zoom' }, { type: 'separator' }, { role: 'front' }],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            await shell.openExternal(
              'https://www.elastic.co/guide/en/observability/current/synthetics-recorder.html'
            );
          },
        },
        {
          label: 'Acknowledgements',
          click: async () => {
            await showNotice();
          },
        },
      ],
    },
  ];

  if (isMac) {
    template.unshift({
      role: 'appMenu',
      label: appName,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services', submenu: [] },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });
  }

  return template;
}

async function showNotice() {
  const parent = BrowserWindow.getFocusedWindow();
  if (parent == null) {
    return;
  }
  const { x, y } = parent.getBounds();
  const child = new BrowserWindow({
    parent,
    title: 'Acknowledgements',
    x: x + 50,
    y: y + 50,
  });
  child.menuBarVisible = false;
  const resourceDir = isDev ? path.join(__dirname, '../../') : process.resourcesPath;
  const pathToNotice = path.join(resourceDir, 'NOTICE.txt');
  child.loadFile(pathToNotice);
  child.once('ready-to-show', () => {
    child.show();
  });
}
