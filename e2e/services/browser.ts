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

import { chromium, Browser } from 'playwright-core';
import { env } from '../services';

type ConnectRetryParams = { url: string; timeout: number; interval: number };

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const DEFAULT_TIMEOUT = 10000;
const DEFAULT_INTERVAL = 250;

export class TestBrowserService {
  static #remoteBrowser: Browser | null;

  static async getRemoteBrowser(
    { url, timeout, interval }: ConnectRetryParams = {
      url: `http://localhost:${env.CDP_TEST_PORT}`,
      timeout: DEFAULT_TIMEOUT,
      interval: DEFAULT_INTERVAL,
    }
  ) {
    if (TestBrowserService.#remoteBrowser) {
      return TestBrowserService.#remoteBrowser;
    }

    const startTime = Date.now();
    async function connectLoop() {
      try {
        const remoteChromium = await chromium.connectOverCDP(url);
        TestBrowserService.#remoteBrowser = remoteChromium;
        return remoteChromium;
      } catch (e) {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime > timeout) throw new Error(`Can't connect to a browser at ${url}`);
        await sleep(interval);
        return connectLoop();
      }
    }

    return connectLoop();
  }

  static async getRemoteBrowserContext(connectParams: ConnectRetryParams) {
    const browserContexts = (await TestBrowserService.getRemoteBrowser(connectParams)).contexts();

    if (browserContexts.length > 1) throw new Error('More than one browser context detected.');

    const browserContext = browserContexts[0];
    if (!browserContext) throw new Error('Not connected to a remote browser with contexts.');

    return browserContext;
  }

  static async getRemoteBrowserPage(
    connectParams: ConnectRetryParams = {
      url: `http://localhost:${env.CDP_TEST_PORT}`,
      timeout: DEFAULT_TIMEOUT,
      interval: DEFAULT_INTERVAL,
    }
  ) {
    const browserContext = await TestBrowserService.getRemoteBrowserContext(connectParams);

    const startTime = Date.now();

    while (browserContext.pages().length === 0 || !browserContext.pages()[0]) {
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime > connectParams.timeout) throw new Error("Can't obtain a browser page.");
      await sleep(connectParams.interval);
    }

    return browserContext.pages()[0];
  }

  static async closeRemoteBrowser() {
    // when `start` button is not clicked for the test case, terminate call will hang
    // because the recording browser isn't started but we try to connect to it with loop
    if (TestBrowserService.#remoteBrowser == null) return;
    const ctxs = await TestBrowserService.#remoteBrowser.contexts();
    for (const ctx of ctxs) {
      await ctx.close();
    }
    await TestBrowserService.#remoteBrowser.close();
    // it tries to use previous test's connection if we don't assign null to it
    TestBrowserService.#remoteBrowser = null;
    // with this timeout, it will make sure the browser to be closed before terminating electron (it's an issue to mac).
    await new Promise(r => setTimeout(r, 50));
  }
}
