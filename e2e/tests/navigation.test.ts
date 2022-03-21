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

import type { Server } from "http";
import { ElectronServiceFactory, env } from "../services";
import { createTestHttpServer } from "./testServer";

const electronService = new ElectronServiceFactory();

let server: Server;
let hostname: string;
let port: number;
let url: string;

beforeEach(() => {
  const { server: s, hostname: h, port: p } = createTestHttpServer();
  server = s;
  hostname = h;
  port = p;
  url = `http://${hostname}:${port}`;
});

afterEach(async () => {
  await electronService.terminate();
  server.close();
});

describe("Navigation", () => {
  it("records chromium's opened pages", async () => {
    const electronWindow = await electronService.getWindow();

    await electronService.enterTestUrl(env.DEMO_APP_URL);

    await electronService.clickStartRecording();
    await electronService.waitForPageToBeIdle();
    await electronService.navigateRecordingBrowser(url);

    expect(await electronWindow.$("text=Step 1")).toBeTruthy();
    expect(await electronWindow.$("text=Step 2")).toBeTruthy();
    expect(
      await electronWindow.$(`text=navigate ${env.DEMO_APP_URL}`)
    ).toBeTruthy();
    expect(await electronWindow.$(`text=navigate ${url}`)).toBeTruthy();
  });
});
