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
import { RecordJourneyRequest } from '../common/types';
import { BrowserRequestController } from './BrowserRequestController';

import { error, warn } from 'electron-log';
import { ipcMain } from 'electron-better-ipc';

jest.mock('electron-log', () => ({
  error: jest.fn(),
  warn: jest.fn(),
}));
jest.mock('electron-better-ipc', () => ({
  ipcMain: {
    callRenderer: jest.fn(),
  },
}));

/**
 * Test class with easily managable state for testing
 * async nature of `BrowserRequestController`.
 */
class TestHandler {
  private shouldTerminate: boolean;
  constructor() {
    this.shouldTerminate = false;
  }
  public terminate() {
    this.shouldTerminate = true;
  }
  public isTerminated() {
    return this.shouldTerminate;
  }
}

/**
 * Helper function to hook up a promise that waits on the test class defined above.
 *
 * We can resolve the promise with a call to `testHandler.terminate()`, which will simulate
 * a browser-dependent process resolving.
 */
function createTestPromise(): [TestHandler, Promise<void>] {
  const testHandler = new TestHandler();
  const executionPromise = new Promise<void>(async resolve => {
    while (!testHandler.isTerminated()) {
      await new Promise(r => setTimeout(r, 10));
    }
    resolve();
  });
  return [testHandler, executionPromise];
}

describe('BrowserRequestController', () => {
  let journeyRequest: RecordJourneyRequest;

  beforeEach(() => {
    jest.resetAllMocks();
    journeyRequest = {
      data: {
        url: 'https://www.elastic.co/',
      },
    };
  });

  it('sets the buffer when a new request is issued', async () => {
    const controller = new BrowserRequestController();

    const [testHandler, executionPromise] = createTestPromise();

    const controllerExecution = controller.executeRequest(
      journeyRequest,
      jest.fn() as unknown as BrowserWindow,
      async (_, __) => await executionPromise
    );

    expect(controller.getBuffer()).not.toBeNull();

    testHandler.terminate();

    await controllerExecution;

    expect(controller.getBuffer()).toBeNull();
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('sends warning for record journey request when process already running', async () => {
    const controller = new BrowserRequestController();

    const [testHandler, executionPromise] = createTestPromise();

    const controllerExecution = controller.executeRequest(
      journeyRequest,
      jest.fn() as unknown as BrowserWindow,
      async (_, __) => await executionPromise
    );

    expect(controller.getBuffer()).not.toBeNull();

    // define objects and make a second request before the first is resolved
    const secondRequest = { data: { url: 'anotherurl' } };
    const secondBrowserWindow = jest.fn() as unknown as BrowserWindow;
    controller.executeRequest(secondRequest, secondBrowserWindow, async (_, __) => {
      return;
    });

    // resolve the original request
    testHandler.terminate();

    await controllerExecution;

    expect(controller.getBuffer()).toBeNull();

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      'Cannot start recording a journey, a browser operation is already in progress.'
    );
    expect(ipcMain.callRenderer).toHaveBeenCalledTimes(1);
    expect(ipcMain.callRenderer).toHaveBeenCalledWith(
      secondBrowserWindow,
      'browser-request-failure',
      secondRequest
    );
    expect(error).not.toHaveBeenCalled();
  });

  it('sends warning for test journey request when process already running', async () => {
    const controller = new BrowserRequestController();

    const [testHandler, executionPromise] = createTestPromise();

    const controllerExecution = controller.executeRequest(
      journeyRequest,
      jest.fn() as unknown as BrowserWindow,
      async (_, __) => await executionPromise
    );

    expect(controller.getBuffer()).not.toBeNull();

    // define objects and make a second request before the first is resolved
    const secondRequest = { data: { steps: [], code: '', isSuite: true } };
    const secondBrowserWindow = jest.fn() as unknown as BrowserWindow;
    controller.executeRequest(secondRequest, secondBrowserWindow, async (_, __) => {
      return;
    });

    // resolve the original request
    testHandler.terminate();
    await controllerExecution;

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      'Cannot start testing a journey, a browser operation is already in progress.'
    );
    expect(ipcMain.callRenderer).toHaveBeenCalledTimes(1);
    expect(ipcMain.callRenderer).toHaveBeenCalledWith(
      secondBrowserWindow,
      'browser-request-failure',
      secondRequest
    );
    expect(error).not.toHaveBeenCalled();
  });

  it('logs error and clears the buffer', async () => {
    const controller = new BrowserRequestController();

    const [testHandler, executionPromise] = createTestPromise();

    const controllerExecution = controller.executeRequest(
      journeyRequest,
      jest.fn() as unknown as BrowserWindow,
      async (_, __) => {
        await executionPromise;
        // throw an error before resolving the promise to trigger internal error handling
        throw new Error('test error');
      }
    );
    expect(controller.getBuffer()).not.toBeNull();

    testHandler.terminate();
    await controllerExecution;

    expect(controller.getBuffer()).toBeNull();
    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(new Error('test error'));
  });
});
