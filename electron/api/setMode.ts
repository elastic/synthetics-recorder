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
import { IpcMainInvokeEvent } from 'electron';
import { BrowserManager } from '../browserManager';

export function onSetMode(browserManager: BrowserManager) {
  return async function (_event: IpcMainInvokeEvent, mode: string) {
    const browserContext = browserManager.getContext();
    if (!browserContext) return;
    const page = browserContext.pages()[0];
    if (!page) return;
    await page.mainFrame().evaluate(
      ([mode]) => {
        // `__pw_setMode` is a private function
        (window as any).__pw_setMode(mode);
      },
      [mode]
    );
    if (mode !== 'inspecting') return;
    // TODO: see if deleting code below doesn't have any affects
    // const [selector] = await once(actionListener, 'selector');
    // return selector;
  };
}
