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

import { _electron, ElectronApplication, Page } from 'playwright-core';
import { TestBrowserService } from './browser';
import path from 'path';
import { env } from '.';

export class ElectronServiceFactory {
  #instance: ElectronApplication;
  #recordingBrowserPage: Page;

  async getInstance() {
    if (this.#instance) return this.#instance;

    console.log('node env:', process.env.NODE_ENV);
    try {
      this.#instance = await _electron.launch({
        args: [
          path.join(__dirname, '..', '..', 'build', 'electron', 'electron.js'),
          '--no-sandbox',
          '--enable-logging',
        ],
        env: {
          DISPLAY: env.DISPLAY,
          /* we are casting this as a string to satisfy the `launch` params requirement,
           * but there are cases where it is important that this value is undefined rather than
           * any other value, and we can't control this interface.
           */
          TEST_PORT: env.TEST_PORT as string,
          NODE_ENV: process.env.NODE_ENV ?? '',
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
    const instance = await this.getInstance();
    const window = await instance.firstWindow();
    await window.waitForLoadState('networkidle');
    return window;
  }

  async terminate() {
    if (!this.#instance) return;
    await TestBrowserService.closeRemoteBrowser();
    await this.#instance.close();
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
    await this.#recordingBrowserPage.locator(selector).click();
    return this.#recordingBrowserPage;
  }

  getRecordingPage() {
    return this.#recordingBrowserPage;
  }

  async clickRunTest() {
    const electronWindow = await this.getWindow();
    const testButton = await electronWindow.getByLabel('Test');
    if ((await testButton.count()) !== 1)
      throw Error('There should be only one element labeled `Test`');
    await testButton.click();
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
