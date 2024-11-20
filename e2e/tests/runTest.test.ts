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

import { ElementHandle, Page } from 'playwright-core';
import { ElectronServiceFactory, env } from '../services';

let electronService: ElectronServiceFactory;

beforeEach(() => {
  electronService = new ElectronServiceFactory();
});

afterEach(async () => {
  await electronService.terminate();
});

describe('Run test', () => {
  describe('Test Button', () => {
    it('is disabled when scripts are not recorded', async () => {
      const electronWindow: Page = await electronService.getWindow();

      const testButton = await electronWindow.getByLabel('Test');
      expect(await testButton.count()).toBe(1);
      expect(await testButton.isEnabled()).toBeFalsy();
    });

    it('is disabled during a recording session', async () => {
      const electronWindow = await electronService.getWindow();

      await electronService.enterTestUrl(env.DEMO_APP_URL);
      await electronService.clickStartRecording();
      await electronService.waitForPageToBeIdle();

      const testButton = (await electronWindow.$(`[aria-label="Test"]`)) as ElementHandle;
      expect(testButton).toBeTruthy();
      expect(await testButton.isEnabled()).toBeFalsy();
      await electronService.clickStopRecording();
    });
  });

  describe('Record forms and run tests', () => {
    it('records filling up the form, run tests and shows the result', async () => {
      const electronWindow = await electronService.getWindow();
      await electronService.enterTestUrl(env.DEMO_APP_URL);
      await electronService.clickStartRecording();
      await electronService.waitForPageToBeIdle();

      await electronService.recordClick('text=BuyUSD 12.49 >> button');
      await electronService.recordClick('text=Add to Cart');
      await electronService
        .getRecordingPage()
        .locator('input[name="email"]')
        .fill('hello@example.com');
      await electronService
        .getRecordingPage()
        .locator('input[name="street_address"]')
        .fill('1 High st');
      await electronService.recordClick('text=Place your order');

      await electronService.clickStopRecording();
      await electronService.clickRunTest();

      expect(await electronWindow.$('text=1 success'));
    });
  });
});
