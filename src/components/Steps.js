import React, { useEffect, useState } from "react";
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiPanel,
  EuiSteps,
  EuiSpacer,
} from "@elastic/eui";
import { generateIR } from "../helpers/generator";
const { ipcRenderer: ipc } = window.require("electron-better-ipc");

function actionTitle(action) {
  switch (action.name) {
    case "openPage":
      return `Open new page`;
    case "closePage":
      return `Close page`;
    case "check":
      return `Check ${action.selector}`;
    case "uncheck":
      return `Uncheck ${action.selector}`;
    case "click": {
      if (action.clickCount === 1) return `Click ${action.selector}`;
      if (action.clickCount === 2) return `Double click ${action.selector}`;
      if (action.clickCount === 3) return `Triple click ${action.selector}`;
      return `${action.clickCount}× click`;
    }
    case "fill":
      return `Fill ${action.selector}`;
    case "setInputFiles":
      if (action.files.length === 0) return `Clear selected files`;
      else return `Upload ${action.files.join(", ")}`;
    case "navigate":
      return `Go to ${action.url}`;
    case "press":
      return (
        `Press ${action.key}` + (action.modifiers ? " with modifiers" : "")
      );
    case "select":
      return `Select ${action.options.join(", ")}`;
  }
}

function constructSteps(actionContexts) {
  return generateIR(actionContexts)
    .map((actionContext) => {
      const title = actionTitle(actionContext.action);
      return {
        title,
        children: "",
        status: "incomplete",
      };
    })
    .filter((step) => Boolean(step.title));
}

export function Steps(props) {
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    ipc.answerMain("change", ({ actions }) => {
      const steps = constructSteps(actions);
      setSteps(steps);
    });
  });

  return (
    <EuiPanel color="transparent" hasBorder={true}>
      <EuiText size="s">
        <h4>{steps.length} Recorded Steps</h4>
      </EuiText>
      <EuiSpacer />
      <EuiPanel color="transparent" hasBorder={true}>
        {steps.length > 0 ? (
          <EuiSteps steps={steps} titleSize="xs"></EuiSteps>
        ) : (
          <EuiText size="xs" textAlign="center">
            <div>
              <span>Click on Start recording to get started</span>
            </div>
            <span>with your script</span>
          </EuiText>
        )}
      </EuiPanel>
    </EuiPanel>
  );
}
