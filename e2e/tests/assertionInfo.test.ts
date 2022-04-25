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

import { ElectronServiceFactory, env } from '../services';

const electronService = new ElectronServiceFactory();

afterEach(async () => {
  await electronService.terminate();
});

describe('Assertion Info Popover', () => {
  it('creates a link to playwright docs on assertion info popover', async () => {
    const electronWindow = await electronService.getWindow();
    await electronService.enterTestUrl(env.DEMO_APP_URL);
    await electronService.clickStartRecording();
    await electronService.waitForPageToBeIdle();
    await electronService.clickStopRecording();
    await electronService.clickActionElementSettingsButton(
      'id=action-element-0-0',
      'text=Add assertion'
    );
    await electronWindow.click(
      `[aria-label="Shows a popover with more information about Playwright assertions."]`
    );

    expect(
      await electronWindow.$(
        "text=You can add assertions to validate your page's content matches your expectations."
      )
    ).toBeTruthy();
    expect(await electronWindow.$('text=Read more')).toBeTruthy();
  });
});
