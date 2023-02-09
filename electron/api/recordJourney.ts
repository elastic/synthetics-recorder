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
import path from 'path';
import { EventEmitter, once } from 'events';
import { existsSync } from 'fs';
import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
import type { BrowserContext } from 'playwright-core';
import logger from 'electron-log';
import { ActionInContext } from '../../common/types';
import { BrowserManager } from '../browserManager';

export async function recordJourney(
  _event: IpcMainInvokeEvent,
  url: string,
  browserManager: BrowserManager
) {
  const browserWindow = BrowserWindow.getFocusedWindow()!;
  try {
    const { browser, context } = await browserManager.launchBrowser();
    const actionListener = new EventEmitter();

    ipcMain.handleOnce('stop-recording', async () => {
      actionListener.removeListener('actions', actionsHandler);
      await browserManager.closeBrowser();
    });

    // Listen to actions from Playwright recording session
    const actionsHandler = (actions: ActionInContext[]) => {
      browserWindow.webContents.send('actions-generated', actions);
    };
    actionListener.on('actions', actionsHandler);

    // _enableRecorder is private method, not defined in BrowserContext type
    await (context as any)._enableRecorder({
      launchOptions: {},
      contextOptions: {},
      mode: 'recording',
      showRecorder: false,
      actionListener,
    });
    await openPage(context, url);
    await once(browser, 'disconnected');
  } catch (e) {
    logger.error(e);
  } finally {
    ipcMain.removeHandler('stop-recording');
  }
}

async function openPage(context: BrowserContext, url: string) {
  const page = await context.newPage();
  if (url) {
    if (existsSync(url)) url = 'file://' + path.resolve(url);
    else if (!url.startsWith('http') && !url.startsWith('file://') && !url.startsWith('about:'))
      url = 'http://' + url;
    await page.goto(url);
  }
  return page;
}
