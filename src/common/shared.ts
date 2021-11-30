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

import React from "react";
import type { ActionContext, JourneyType, Setter } from "./types";

const { ipcRenderer: ipc } = window.require("electron-better-ipc");

export const COMMAND_SELECTOR_OPTIONS = [
  {
    value: "textContent",
    text: "Text content",
  },
  {
    value: "isVisible",
    text: "Check Visibility",
  },
  {
    value: "isHidden",
    text: "Check Hidden",
  },
];

export function performSelectorLookup(
  onSelectorChange: Setter<string | undefined>
) {
  return async () => {
    const selector = await ipc.callMain("set-mode", "inspecting");
    if (selector) {
      onSelectorChange(selector);
      await ipc.callMain("set-mode", "recording");
    }
  };
}

export async function getCodeFromActions(
  actions: ActionContext[][],
  type: JourneyType
) {
  return await ipc.callMain("actions-to-code", {
    actions: actions.flat(),
    isSuite: type === "suite",
  });
}

export function createExternalLinkHandler(
  url: string
): React.MouseEventHandler<HTMLAnchorElement> {
  return async e => {
    e.preventDefault();
    await ipc.callMain("link-to-external", url);
  };
}
