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

import { _electron, ElectronApplication, Page } from 'playwright';
import { TestBrowserService } from './browser';
import path from 'path';
import { env } from '.';

export class ElectronServiceFactory {
  #instance: ElectronApplication;
  #recordingBrowserPage: Page;

  async getInstance() {
    if (this.#instance) return this.#instance;

    try {
      console.log('launching an electron application');
      this.#instance = await _electron.launch({
        args: [
          path.join(__dirname, '..', '..', 'build', 'electron', 'electron.js'),
          '--no-sandbox',
          '--enable-logging',
        ],
        env: {
          DISPLAY: env.DISPLAY,
          TEST_PORT: env.TEST_PORT ?? '61337',
          PW_DEBUG: 'console',
          NODE_ENV: process.env.NODE_ENV,
        },
      });

      return this.#instance;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      throw e;
    }
  }

  async getWindow() {
    await this.getInstance();
    return this.#instance.firstWindow();
  }

  async closeAllWindows() {
    const instance = await this.getInstance();
    for (const window of instance.windows()) {
      await window.close();
    }
  }

  async terminate() {
    console.log('in terminate function');
    if (!this.#instance) return;
    console.log('got past the falsey check');
    await TestBrowserService.closeRemoteBrowser();
    console.log('got past the remote browser call');
    // for (const window of this.#instance.windows()) {
    //   console.log('closing a window');
    //   await window.close();
    // }
    // await this.#instance.context().close()

    await this.#instance.close();
    console.log('got past the instance close');
    // this.#instance = null;
  }

  async enterTestUrl(testUrl: string) {
    const electronWindow = await this.getWindow();
    return await electronWindow.type('[placeholder="Enter a starting URL"]', testUrl);
  }

  async clickStartRecording() {
    const electronWindow = await this.getWindow();
    await electronWindow.click('text=Start');
    this.#recordingBrowserPage = await TestBrowserService.getRemoteBrowserPage();
    return this.#recordingBrowserPage;
  }

  async recordClick(selector: string) {
    await this.#recordingBrowserPage.click(selector);
    return this.#recordingBrowserPage;
  }

  getRecordingPage() {
    return this.#recordingBrowserPage;
  }

  async clickRunTest() {
    const electronWindow = await this.getWindow();
    await electronWindow.click('text=Test');
  }

  async clickStopRecording() {
    const electronWindow = await this.getWindow();
    await electronWindow.click('text=Stop');
  }

  async clickActionElementSettingsButton(elementSelector: string, buttonSelector: string) {
    const electronWindow = await this.getWindow();
    await electronWindow.hover(elementSelector);
    await electronWindow.click(`[aria-label="Expand the settings menu for this action"]`);
    return electronWindow.click(buttonSelector);
  }

  async waitForPageToBeIdle(timeout = 45000) {
    await this.#recordingBrowserPage.waitForLoadState('networkidle', {
      timeout,
    });
  }

  async navigateRecordingBrowser(url, timeout = 4500) {
    await this.#recordingBrowserPage.goto(url, {
      timeout,
      waitUntil: 'networkidle',
    });
  }

  async closeRecordingBrowser() {
    try {
      await TestBrowserService.closeRemoteBrowser();
    } catch (_e) {}
  }
}
