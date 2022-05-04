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

import { BrowserWindow } from 'electron';
import { ipcMain as ipc } from 'electron-better-ipc';
import logger from 'electron-log';
import type { ClientBrowserRequest, RecordJourneyRequest } from '../common/types';
import { isTestJourneyRequest } from '../src/common/shared';

const isRecordJourneyRequest = (req: any): req is RecordJourneyRequest => !!req?.data?.url;

export class BrowserRequestController {
  private buffer: ClientBrowserRequest | null;

  constructor() {
    this.buffer = null;
  }

  public async executeRequest<T>(
    req: ClientBrowserRequest,
    browserWindow: BrowserWindow,
    execution: (req: ClientBrowserRequest, browserWindow: BrowserWindow) => Promise<T>
  ): Promise<T | undefined> {
    const isRecordingRequest = isRecordJourneyRequest(req);
    const isTestRequest = isTestJourneyRequest(req);
    if (!this.canRunRequest()) {
      if (isRecordingRequest) {
        logger.warn(
          'Cannot start recording a journey, a browser operation is already in progress.'
        );
      } else if (isTestRequest) {
        logger.warn('Cannot start testing a journey, a browser operation is already in progress.');
      }
      // drop any requests we receive while a browser is running
      return ipc.callRenderer(browserWindow, 'browser-request-failure', req);
    }

    this.buffer = req;

    try {
      return await execution(req, browserWindow);
    } catch (e) {
      logger.error(e);
    } finally {
      this.clearBuffer();
    }
  }

  private canRunRequest() {
    return this.buffer === null;
  }

  private clearBuffer() {
    this.buffer = null;
  }

  public getBuffer() {
    return this.buffer;
  }
}
