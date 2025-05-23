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

// fixme: test is flaky
describe.skip('Pause and Resume', () => {
  it('pauses and resumes', async () => {
    const electronWindow = await electronService.getWindow();

    await electronService.enterTestUrl(env.DEMO_APP_URL);
    await electronService.clickStartRecording();
    await electronService.waitForPageToBeIdle();
    await electronWindow.click('text=Pause');

    expect(await electronWindow.getByText('Recording paused')).toBeTruthy();

    expect(await electronWindow.getByText('Resume')).toBeTruthy();
    expect(await electronWindow.getByText('Stop').isDisabled()).toBeTruthy();
    expect(await electronWindow.getByText('Test').isDisabled()).toBeTruthy();

    await electronWindow.click('text=Resume');
    expect(await electronWindow.getByText('Recording', { exact: true })).toBeTruthy();
    await electronService.recordClick('text=BuyUSD 12.49 >> button');
    await electronService.recordClick('text=Add to Cart');
    await electronService.clickStopRecording();

    expect(await electronWindow.getByText('Start over').isEnabled()).toBeTruthy();
    expect(await electronWindow.getByText('Test').isEnabled()).toBeTruthy();
  });
});
