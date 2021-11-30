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

import { chromium, Browser } from "playwright";

type ConnectRetryParams = { url?: string; timeout?: number; interval?: number };

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export class TestBrowserService {
  static #remoteBrowser: Browser;

  static async getRemoteBrowser(
    {
      url = "http://localhost:61338",
      timeout = 3000,
      interval = 250,
    }: ConnectRetryParams = {
      url: "http://localhost:61338",
      timeout: 3000,
      interval: 250,
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
        if (elapsedTime > timeout)
          throw new Error(`Can't connect to a browser at ${url}`);
        await sleep(interval);
        return connectLoop();
      }
    }

    return connectLoop();
  }

  static async getRemoteBrowserContext(connectParams?: ConnectRetryParams) {
    const browserContexts = (
      await TestBrowserService.getRemoteBrowser(connectParams)
    ).contexts();

    if (browserContexts.length > 1)
      throw new Error("More than one browser context detected.");

    const browserContext = browserContexts[0];
    if (!browserContext)
      throw new Error("Not connected to a remote browser with contexts.");

    return browserContext;
  }

  static async getRemoteBrowserPage(connectParams?: ConnectRetryParams) {
    const browserContext = await TestBrowserService.getRemoteBrowserContext(
      connectParams
    );

    while (browserContext.pages().length === 0 || !browserContext.pages()[0]) {
      await sleep(100);
    }

    return browserContext.pages()[0];
  }

  static async closeRemoteBrowser(connectParams?: ConnectRetryParams) {
    const browser = await TestBrowserService.getRemoteBrowser(connectParams);
    await browser.close();
  }
}
