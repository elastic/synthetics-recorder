import React from "react";
import type { ActionContext, JourneyType, Setter } from "./types";

const { ipcRenderer: ipc } = window.require("electron-better-ipc");

export const COMMAND_SELECTOR_OPTIONS = [
  {
    value: "isHidden",
    text: "Check Hidden",
  },
  {
    value: "isVisible",
    text: "Check Visibility",
  },
  {
    value: "innerText",
    text: "Inner Text",
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
  {
    value: "textContent",
    text: "Text content",
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
