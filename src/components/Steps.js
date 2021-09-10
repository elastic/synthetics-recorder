import React, { useEffect, useState } from "react";
import {
  EuiText,
  EuiPanel,
  EuiSpacer,
  EuiFlexItem,
  EuiButton,
  EuiFlexGroup,
} from "@elastic/eui";
import { generateIR } from "../helpers/generator";
import { StepAccordions } from "./StepDetails";
const { ipcRenderer: ipc } = window.require("electron-better-ipc");

export function Steps(props) {
  const [isRecording, setIsRecording] = useState(false);
  const [actions, setActions] = useState([]);

  useEffect(() => {
    ipc.answerMain("change", ({ actions }) => {
      setActions((prevActions) => {
        const currentActions = generateIR(actions);
        return generateMergedIR(prevActions, currentActions);
      });
    });
  }, []);

  const onRecord = async () => {
    if (isRecording) {
      setIsRecording(false);
      // Stop browser process
      ipc.send("stop");
      return;
    }
    setIsRecording(true);
    await ipc.callMain("record-journey", { url: props.url });
    setIsRecording(false);
  };

  const generateMergedIR = (prevActions, currActions) => {
    const flatPrevActions = prevActions.flat();
    const flatCurrActions = currActions.flat();
    if (
      flatCurrActions.length === 0 ||
      flatPrevActions.length === 0 ||
      flatPrevActions.length < flatCurrActions.length
    ) {
      props.onUpdateActions(currActions);
      return currActions;
    }

    const mergedActions = [];
    for (let i = 0; i < flatPrevActions.length; i++) {
      const { action } = flatPrevActions[i];
      if (action.name === "assert") {
        mergedActions.push(flatPrevActions[i]);
      }
      flatCurrActions[i] && mergedActions.push(flatCurrActions[i]);
    }
    // console.log("Merged", JSON.stringify(mergedActions, null, 2));
    props.onUpdateActions(mergedActions);
    return generateIR(mergedActions);
  };

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
    <EuiPanel hasBorder={true} color="transparent">
      <EuiFlexGroup alignItems="baseline">
        <EuiFlexItem>
          <EuiText size="m">
            <strong>{actions.length} Recorded Steps</strong>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiButton iconType="play" color="secondary" onClick={onRecord}>
            {isRecording ? "Stop Recording" : "Start Recording"}
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer />
      <EuiPanel color="transparent" hasBorder={true} grow={true}>
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
