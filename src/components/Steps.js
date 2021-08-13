import React, { useEffect, useState } from "react";
import { EuiText, EuiPanel, EuiSpacer } from "@elastic/eui";
import { generateIR } from "../helpers/generator";
import { StepAccordions } from "./StepDetails";
const { ipcRenderer: ipc } = window.require("electron-better-ipc");

export function Steps(props) {
  const [actions, setActions] = useState([]);

  useEffect(() => {
    ipc.answerMain("change", ({ actions }) => {
      (actions.length > 0) & setActions(() => generateIR(actions));
    });
  }, []);

  const onStepDetailChange = (step, stepIndex) => {
    actions[stepIndex] = step;
    setActions(() => actions);
    props.onUpdateActions(actions);
  };

  const onStepDelete = (stepIndex) => {
    const newActions = [
      ...actions.slice(0, stepIndex),
      ...actions.slice(stepIndex + 1),
    ];
    setActions(() => newActions);
    props.onUpdateActions(newActions);
  };

  return (
    <EuiPanel color="transparent" hasBorder={true}>
      <EuiText size="s">
        <strong>{actions.length} Recorded Steps</strong>
      </EuiText>
      <EuiSpacer />
      <EuiPanel color="transparent" hasBorder={true}>
        {actions.length > 0 ? (
          <StepAccordions
            steps={actions}
            onStepDetailChange={onStepDetailChange}
            onStepDelete={onStepDelete}
          />
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
