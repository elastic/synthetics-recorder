import React, { useEffect, useContext } from "react";
import {
  EuiText,
  EuiPanel,
  EuiSpacer,
  EuiFlexItem,
  EuiButton,
  EuiFlexGroup,
} from "@elastic/eui";
import { generateIR, generateMergedIR } from "../helpers/generator";
import { StepAccordions } from "./StepList/StepDetails";
import { RecordingContext } from "../contexts/RecordingContext";
import { StepsContext } from "../contexts/StepsContext";
const { ipcRenderer: ipc } = window.require("electron-better-ipc");

export function Steps() {
  const { actions, setActions } = useContext(StepsContext);
  const { toggleRecording, isRecording, isPaused, togglePause } =
    useContext(RecordingContext);

  const onStepDetailChange = (step, stepIndex) => {
    const newActions = actions.map((a, ind) => (ind === stepIndex ? step : a));
    setActions(newActions);
  };

  const onStepDelete = stepIndex => {
    const newActions = [
      ...actions.slice(0, stepIndex),
      ...actions.slice(stepIndex + 1),
    ];
    setActions(newActions);
  };

  useEffect(() => {
    const updateActions = (_, pwActions) => {
      setActions(prevActionContexts => {
        const currActionsContexts = generateIR(pwActions);
        return generateMergedIR(prevActionContexts, currActionsContexts);
      });
    };
    ipc.on("change", updateActions);

    return () => {
      ipc.off("change", updateActions);
    };
  }, []);

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
            aria-label="Toggle script recording on/off"
            iconType={isRecording ? "stop" : "play"}
            onClick={toggleRecording}
          >
            {isRecording ? "Stop" : "Start"}
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            aria-label="Toggle script recording pause/record"
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
