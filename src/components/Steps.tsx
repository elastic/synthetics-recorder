import { useContext } from "react";
import { EuiCode, EuiEmptyPrompt, EuiSpacer, EuiTitle } from "@elastic/eui";

import { StepAccordions } from "./StepList/StepDetails";
import { StepsContext } from "../contexts/StepsContext";
import type { ActionContext } from "../common/types";

export function Steps() {
  const { actions, setActions } = useContext(StepsContext);

  const onStepDetailChange = (step: ActionContext[], stepIndex: number) => {
    const newActions = actions.map((a, ind) => (ind === stepIndex ? step : a));
    setActions(newActions);
  };

  const onStepDelete = (stepIndex: number) => {
    const newActions = [
      ...actions.slice(0, stepIndex),
      ...actions.slice(stepIndex + 1),
    ];
    setActions(newActions);
  };

  if (actions.length === 0) {
    return (
      <EuiEmptyPrompt
        aria-label="This empty prompt indicates that you have not recorded any journey steps yet."
        title={<h3>No steps recorded yet</h3>}
        body={
          <p>
            Click on <EuiCode>Start recording</EuiCode> to get started with your
            script.
          </p>
        }
      />
    );
  }

  return (
    <>
      <EuiTitle size="s">
        <h2>
          {actions.length}&nbsp;
          {actions.length === 1 ? "Recorded Step" : "Recorded Steps"}
        </h2>
      </EuiTitle>
      <EuiSpacer />
      <StepAccordions
        steps={actions}
        onStepDetailChange={onStepDetailChange}
        onStepDelete={onStepDelete}
      />
    </>
  );
}
