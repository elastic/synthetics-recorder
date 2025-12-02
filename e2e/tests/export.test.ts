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
import os from 'os';
import path from 'path';
import * as fs from 'fs/promises';
import { ElectronServiceFactory, env } from '../services';

const electronService = new ElectronServiceFactory();
afterAll(async () => {
  await electronService.terminate();
});

describe('Export', () => {
  it('shows disabled export button when script is not recorded', async () => {
    const electronWindow = await electronService.getWindow();
    const exportButton = electronWindow.locator('[aria-label="export"]');
    await exportButton.waitFor({ state: 'attached' });
    expect(await exportButton.count()).toBe(1);
    expect(await exportButton.isEnabled()).toBeFalsy();
  });

  it('saves a script in filesystem', async () => {
    const app = await electronService.getInstance();
    const filePath = path.join(os.tmpdir(), 'some.journey.test');
    // when clicking `Save` button, saves given file immediately instead of opening save dialog
    // it bypasses native dialog interaction for testing
    const saveDialogMock = async ({ dialog }, filePath) => {
      dialog.showSaveDialog = () => Promise.resolve({ canceled: false, filePath });
    };
    // apply mocking dialog.showSaveDialog to electron app
    await app.evaluate(saveDialogMock, filePath);

    const electronWindow = await electronService.getWindow();
    await electronService.enterTestUrl(env.DEMO_APP_URL);
    await electronService.clickStartRecording();
    await electronService.waitForPageToBeIdle();
    await electronService.clickStopRecording();

    const exportButton = await electronWindow.$(`[aria-label="export"]`);
    expect(exportButton).toBeTruthy();
    await exportButton?.click();
    const saveButton = await electronWindow.$('[aria-label="save-code"]');
    await saveButton?.click();
    // file exists, otherwise throws
    expect(await fs.stat(filePath)).toBeTruthy();
    // cleanup
    await fs.rm(filePath);
  });
});
