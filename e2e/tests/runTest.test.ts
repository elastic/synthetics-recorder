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

      const testButton = electronWindow.locator('[aria-label="Test"]');
      await testButton.waitFor({ state: 'attached' });
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

      // Wait for the result flyout to appear
      const flyoutHeader = electronWindow.getByRole('heading', { name: 'Journey Test Result' });
      await flyoutHeader.waitFor({ state: 'visible', timeout: 60000 });
      expect(await flyoutHeader.isVisible()).toBe(true);
    });

    it('records multiple steps and shows each step result in the flyout', async () => {
      const electronWindow = await electronService.getWindow();
      await electronService.enterTestUrl(env.DEMO_APP_URL);
      await electronService.clickStartRecording();
      await electronService.waitForPageToBeIdle();

      // Step 1: Click on a product
      await electronService.recordClick('text=BuyUSD 12.49 >> button');

      // Wait for action to be recorded
      await electronWindow.getByText('click').first().waitFor({ state: 'visible' });

      // Stop recording to add step dividers
      await electronService.clickStopRecording();

      // Insert a step divider after the first action to create Step 2
      const divider = electronWindow.locator('id=insert-divider-0-1');
      await divider.waitFor({ state: 'visible' });
      await divider.click();

      // Verify we now have 2 steps
      const stepDivCount = await electronWindow.locator('[data-test-subj="step-div"]').count();
      expect(stepDivCount).toBe(2);

      // Run the test
      await electronService.clickRunTest();

      // Wait for the result flyout to appear with increased timeout for test execution
      const flyoutHeader = electronWindow.getByRole('heading', { name: 'Journey Test Result' });
      await flyoutHeader.waitFor({ state: 'visible', timeout: 120000 });

      // Verify the flyout is visible
      expect(await flyoutHeader.isVisible()).toBe(true);

      // Check that step 1 result is shown (format is "1: step name")
      const step1Result = electronWindow.getByText(/^1:/).first();
      await step1Result.waitFor({ state: 'visible', timeout: 30000 });
      expect(await step1Result.isVisible()).toBe(true);

      // Check that step 2 result is shown
      const step2Result = electronWindow.getByText(/^2:/).first();
      await step2Result.waitFor({ state: 'visible', timeout: 30000 });
      expect(await step2Result.isVisible()).toBe(true);
    });
  });
});
