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
import type { ActionContext, Journey, JourneyType, Setter } from "./types";

const { ipcRenderer: ipc } = window.require("electron-better-ipc");

export const COMMAND_SELECTOR_OPTIONS = [
  {
    value: "innerText",
    text: "Inner Text",
  },
  {
    value: "textContent",
    text: "Text content",
  },
  {
    value: "isHidden",
    text: "Check Hidden",
  },
  {
    value: "isVisible",
    text: "Check Visibility",
  },
  {
    value: "isChecked",
    text: "Is Checked",
  },
  {
    value: "isDisabled",
    text: "Is Disabled",
  },
  {
    value: "isEditable",
    text: "Is Editable",
  },
  {
    value: "isEnabled",
    text: "Is Enabled",
  },
];

export const SYNTHETICS_DISCUSS_FORUM_URL =
  "https://forms.gle/PzVtYoExfqQ9UMkY6";

export const SMALL_SCREEN_BREAKPOINT = 850;

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

export function updateAction(
  steps: ActionContext[][],
  value: string,
  stepIndex: number,
  actionIndex: number
): ActionContext[][] {
  return steps.map((step, sidx) => {
    if (sidx !== stepIndex) return step;
    return step.map((ac, aidx) => {
      if (aidx !== actionIndex) return ac;
      const { action, ...rest } = ac;
      return { action: { ...action, value }, ...rest };
    });
  });
}

export async function getCodeForResult(
  steps: ActionContext[][],
  journey: Journey | undefined
): Promise<string> {
  if (!journey) return "";
  const journeyStepNames = new Set(journey.steps.map(({ name }) => name));

  return await getCodeFromActions(
    steps.filter(
      step =>
        step !== null &&
        step.length > 0 &&
        step[0].title &&
        journeyStepNames.has(step[0].title)
    ),
    journey.type
  );
}
