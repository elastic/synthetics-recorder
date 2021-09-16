import React, { useEffect, useState, useContext } from "react";
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
import { RecordingContext } from "../contexts/RecordingContext";
import { StepsContext } from "../contexts/StepsContext";
const { ipcRenderer: ipc } = window.require("electron-better-ipc");

export function Steps(props) {
  const { actions, setActions } = useContext(StepsContext);
  const { toggleRecording, isRecording, isPaused, togglePause } =
    useContext(RecordingContext);

  useEffect(() => {
    ipc.answerMain("change", ({ actions }) => {
      setActions((prevActions) => {
        const currentActions = generateIR(actions);
        return generateMergedIR(prevActions, currentActions);
      });
    });
  }, []);

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
    props.onUpdateActions(mergedActions);
    return generateIR(mergedActions);
  };

  const onStepDetailChange = (step, stepIndex) => {
    const newActions = actions.map((a, ind) => (ind === stepIndex ? step : a));
    setActions(newActions);
    props.onUpdateActions(newActions);
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
    <>
      <EuiFlexGroup alignItems="baseline">
        <EuiFlexItem>
          <EuiText size="m">
            <strong>{actions.length} Recorded Steps</strong>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            iconType={isRecording ? "stop" : "play"}
            onClick={toggleRecording}
          >
            {isRecording ? "Stop" : "Start"}
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            disabled={!isRecording}
            iconType="pause"
            onClick={togglePause}
          >
            {isPaused ? "Resume" : "Pause"}
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer />
      <EuiFlexItem>
        <EuiPanel color="transparent" hasBorder={true} borderRadius="none">
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
      </EuiFlexItem>
    </>
  );
}
