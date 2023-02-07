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

import { EventEmitter } from 'events';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import type { RunJourneyOptions } from '../common/types';
import { browserManager } from './browserManager';
import {
  onSetMode,
  onExportScript,
  runJourney,
  recordJourney,
  onOpenExternalLink,
  onGenerateCode,
} from './api';
import { syntheticsManager } from './syntheticsManager';

export enum MainWindowEvent {
  MAIN_CLOSE = 'main-close',
}

/**
 * Sets up IPC listeners for the main process to respond to UI events.
 *
 * @param mainWindowEmitter Allows handlers to respond to app-level events
 * @returns a list of functions that will remove the listeners this function adds.
 *
 * Because the IPC is global, it is important to remove the listeners anytime this function's caller
 * is destroyed or they will leak/block the next window from interacting with top-level app state.
 */
export default function setupListeners(mainWindowEmitter: EventEmitter) {
  mainWindowEmitter.once(MainWindowEvent.MAIN_CLOSE, async () => {
    if (browserManager.isRunning()) {
      await browserManager.closeBrowser();
    }

    if (syntheticsManager.isRunning()) {
      await syntheticsManager.stop();
    }
  });

  ipcMain.handle('record-journey', onRecordJourney);
  ipcMain.handle('run-journey', onRunJourney);
  ipcMain.handle('actions-to-code', onGenerateCode);
  ipcMain.handle('export-script', onExportScript);
  ipcMain.handle('set-mode', onSetMode(browserManager));
  ipcMain.handle('open-external-link', onOpenExternalLink);

  return () => ipcMain.removeAllListeners();
}

async function onRecordJourney(event: IpcMainInvokeEvent, url: string) {
  if (browserManager.isRunning() || syntheticsManager.isRunning()) {
    throw new Error(
      'Cannot start recording a journey, a browser operation is already in progress.'
    );
  }
  await recordJourney(event, url, browserManager);
}

async function onRunJourney(event: IpcMainInvokeEvent, data: RunJourneyOptions) {
  if (browserManager.isRunning() || syntheticsManager.isRunning()) {
    throw new Error('Cannot start testing a journey, a browser operation is already in progress.');
  }
  await runJourney(event, data, syntheticsManager);
}
