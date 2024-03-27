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
import type { Server } from 'http';
import { ElectronServiceFactory, env } from '../services';
import { createTestHttpServer } from './testServer';

let electronService: ElectronServiceFactory;
let server: Server;
let url: string;

beforeAll(async () => {
  const { server: s, port } = await createTestHttpServer();
  server = s;
  url = `http://localhost:${port}`;
});

afterAll(async () => {
  await new Promise(resolve => server.close(resolve));
});

function getCoordinates({
  x,
  y,
  width,
  height,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  return [x + width / 2, y + height / 2];
}

describe('Step Divider', () => {
  beforeEach(async () => {
    electronService = new ElectronServiceFactory();
  });
  afterEach(async () => {
    await electronService.terminate();
  });

  it('creates a step and drags to a new position', async () => {
    const electronWindow = await electronService.getWindow();
    await electronService.enterTestUrl(env.DEMO_APP_URL);
    await electronService.clickStartRecording();
    await electronService.waitForPageToBeIdle();
    await electronService.navigateRecordingBrowser(url);
    await electronService.recordClick('Hello Elastic Synthetics Recorder');

    const page = await electronService.getWindow();
    await page.getByText('Hello Elastic Synthetics').waitFor();
    await electronService.clickStopRecording();

    const divider = await electronWindow.locator('id=insert-divider-0-1');
    await divider.click();
    const step = await electronWindow.locator('id=step-1');
    await step.hover();
    await electronWindow.mouse.down();
    await electronWindow.mouse.move(100, 100, { steps: 5 });
    const dropZone = await (await electronWindow.locator('id=action-element-1-0')).boundingBox();
    if (!dropZone) expect(dropZone).not.toBeNull();
    else {
      const [dzx, dzy] = getCoordinates(dropZone);
      await electronWindow.mouse.move(dzx, dzy, { steps: 5 });
      await electronWindow.mouse.up();
      /**
       * There was originally only one action in this step, so the targeted insert button would only be
       * rendered if Playwright successfully dragged the step separator over drop zone and released it.
       */
      expect(await electronWindow.$('id=insert-divider-0-1')).toBeTruthy();
    }
  });

  it('deletes a step', async () => {
    const electronWindow = await electronService.getWindow();
    await electronService.enterTestUrl(env.DEMO_APP_URL);
    await electronService.clickStartRecording();
    await electronService.waitForPageToBeIdle();
    await electronService.navigateRecordingBrowser(url);
    await electronService.waitForPageToBeIdle();
    await electronService.recordClick('Hello Elastic Synthetics Recorder');

    const page = await electronService.getWindow();
    await page.getByText('Hello Elastic Synthetics').waitFor();
    await electronService.clickStopRecording();

    const divider = await electronWindow.locator('id=insert-divider-0-1');
    await divider.click();
    const step = await electronWindow.locator('id=step-1');
    await step.hover();
    const elems = await electronWindow.$$('[data-test-subj="step-div"]');
    expect(elems.length).toEqual(2);
    const isVisible = await electronWindow.locator('text=Step 2').isVisible();
    expect(isVisible).toBeTruthy();

    await electronWindow.locator('[aria-label="Delete step"]').nth(0).click();
    const stepCounts = await electronWindow.locator('[data-test-subj="step-div"]').count();
    expect(stepCounts).toEqual(1);
  });
});
