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

import { Page } from 'playwright';
import { ElectronServiceFactory, env } from '../services';

const electronService = new ElectronServiceFactory();

afterEach(async () => {
  await electronService.terminate();
});

const ACTION_URL = 'https://e2e-test-action-edit.org';
const ACTION_OPTION = 'innerText';
const ASSERTION_SELECTOR = 'test-assertion-selector';
const ASSERTION_VALUE = 'test-assertion-value';

async function addAssertion() {
  await electronService.enterTestUrl(env.DEMO_APP_URL);
  await electronService.clickStartRecording();
  await electronService.waitForPageToBeIdle();
  await electronService.clickStopRecording();
  await electronService.clickActionElementSettingsButton(
    'id=action-element-0-0',
    'text=Add assertion'
  );
}

async function editAssertion(electronWindow: Page) {
  await electronWindow.click('id=action-element-0-1');
  await electronWindow.hover('id=action-element-0-1');
  await electronWindow.selectOption(`[aria-label="Assertion type select"]`, ACTION_OPTION);
  await electronWindow.fill(`[aria-label="Assertion selector"]`, ASSERTION_SELECTOR);
  await electronWindow.fill(`[aria-label="Assertion value"]`, ASSERTION_VALUE);
  await electronWindow.click(`[data-test-subj="save-0-1"]`);
  // make sure state has been updated by checking the action header's content
  await electronWindow.waitForSelector(`#action-element-0-1 >> div:has-text("Inner Text")`, {
    timeout: 2000,
  });
}

async function editAction(electronWindow: Page) {
  await electronService.clickActionElementSettingsButton(
    'id=action-element-0-0',
    `[data-test-subj="edit-action"]`
  );
  await electronWindow.fill(`[data-test-subj="edit-url-0-0"]`, ACTION_URL);
  await electronWindow.click(`[data-test-subj="save-action-0-0"]`);
  // make sure state has been updated by checking the ation header's content
  await electronWindow.waitForSelector(`id=action-element-0-0 >> div:has-text("${ACTION_URL}")`, {
    timeout: 2000,
  });
}

describe('Assertion and Action values', () => {
  it('includes updated action/assertion values in code output', async () => {
    const electronWindow = await electronService.getWindow();
    await addAssertion();
    await editAssertion(electronWindow);
    await editAction(electronWindow);

    // open export flyout
    await electronWindow.click('text=Export');
    // get inner text of code to export
    const innerText = await (await electronWindow.$('id=export-code-block')).innerText();

    /**
     * The outputted code should contain the updated values we have supplied in the edit steps above.
     */
    expect(innerText).toContain(
      `expect(await page.${ACTION_OPTION}('${ASSERTION_SELECTOR}')).toMatch('${ASSERTION_VALUE}');`
    );
    expect(innerText).toContain(`await page.goto('${ACTION_URL}');`);
  });
});
