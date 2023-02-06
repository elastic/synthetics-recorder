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
import { chromium, Browser, BrowserContext } from 'playwright';
import logger from 'electron-log';
import { EXECUTABLE_PATH } from './config';

const IS_TEST_ENV = process.env.NODE_ENV === 'test';
const CDP_TEST_PORT = parseInt(process.env.TEST_PORT ?? '61337') + 1;

export class BrowserManager {
  protected _closingBrowser = false;
  protected _browser: Browser | null = null;
  protected _context: BrowserContext | null = null;

  isRunning() {
    return this._browser != null;
  }

  getContext() {
    return this._context;
  }

  onBrowserClosed() {
    this._browser = null;
    this._context = null;
    this._closingBrowser = false;
  }

  async launchBrowser() {
    const browser = await chromium.launch({
      headless: IS_TEST_ENV,
      executablePath: EXECUTABLE_PATH,
      chromiumSandbox: true,
      args: IS_TEST_ENV ? [`--remote-debugging-port=${CDP_TEST_PORT}`] : [],
    });

    const context = await browser.newContext();
    this._browser = browser;
    this._context = context;

    context.on('page', page => {
      page.on('close', async () => {
        const hasPage = browser.contexts().some(context => context.pages().length > 0);
        if (hasPage) {
          console.log('it has page');
          return;
        }
        await this.closeBrowser();
      });
    });
    return { browser, context };
  }

  async closeBrowser() {
    if (this._browser == null || this._closingBrowser) return;
    this._closingBrowser = true;
    try {
      await this._browser.close();
      this.onBrowserClosed();
    } catch (e) {
      logger.error('Browser close threw an error', e);
    }
  }
}

export const browserManager = new BrowserManager();
