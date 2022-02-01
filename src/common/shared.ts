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

import { RendererProcessIpc } from "electron-better-ipc";
import React from "react";
import type {
  ActionContext,
  Journey,
  JourneyType,
  Setter,
  Steps,
} from "./types";

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
  ipc: RendererProcessIpc,
  onSelectorChange: Setter<string | undefined>
) {
  return async () => {
    const selector = await ipc.callMain("set-mode", "inspecting");
    if (typeof selector === "string" && selector.length) {
      onSelectorChange(selector);
      await ipc.callMain("set-mode", "recording");
    }
  };
}

export async function getCodeFromActions(
  ipc: RendererProcessIpc,
  actions: Steps,
  type: JourneyType
): Promise<string> {
  return await ipc.callMain("actions-to-code", {
    actions: actions.flat(),
    isSuite: type === "suite",
  });
}

export function createExternalLinkHandler(
  ipc: RendererProcessIpc,
  url: string
): React.MouseEventHandler<HTMLAnchorElement> {
  return async e => {
    e.preventDefault();
    await ipc.callMain("link-to-external", url);
  };
}

export function updateAction(
  steps: Steps,
  value: string,
  stepIndex: number,
  actionIndex: number
): Steps {
  return steps.map((step, sidx) => {
    if (sidx !== stepIndex) return step;
    return step.map((ac, aidx) => {
      if (aidx !== actionIndex) return ac;
      const { action, ...rest } = ac;
      return { action: { ...action, value }, ...rest };
    });
  });
}

/**
 * Gets code string for failed step in result object.
 * @param steps steps to analyze
 * @param journey journey result data
 * @returns code string
 */
export async function getCodeForFailedResult(
  ipc: RendererProcessIpc,
  steps: ActionContext[][],
  journey?: Journey
): Promise<string> {
  if (!journey) return "";

  const failedJourneyStep = journey.steps.find(
    ({ status }) => status === "failed"
  );

  if (typeof failedJourneyStep === "undefined") return "";

  const failedStep = steps.find(
    step => step.length > 0 && step[0].title === failedJourneyStep.name
  );

  if (typeof failedStep === "undefined") return "";

  return getCodeFromActions(ipc, [failedStep], journey.type);
}
