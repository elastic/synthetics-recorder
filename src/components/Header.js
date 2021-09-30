import React, { useContext } from "react";
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiText,
  EuiFieldText,
  EuiIcon,
  EuiSelect,
} from "@elastic/eui";
import { RecordingContext } from "../contexts/RecordingContext";
import { StepsContext } from "../contexts/StepsContext";
const { ipcRenderer: ipc } = window.require("electron-better-ipc");

export function Header(props) {
  const { actions } = useContext(StepsContext);
  const { isRecording, toggleRecording } = useContext(RecordingContext);

  const getCodeFromActions = async () => {
    return await ipc.callMain("actions-to-code", {
      actions: actions.flat(),
      isSuite: props.type == "suite",
    });
  };
  const onSave = async () => {
    const code = await getCodeFromActions();
    await ipc.callMain("save-file", code);
  };
  const onTest = async () => {
    const code = await getCodeFromActions();
    const result = await ipc.callMain("run-journey", {
      code,
      isSuite: props.type === "suite",
    });
    props.onTestRun(result);
  };
  const onUrlFieldKeyUp = async e => {
    if (e?.key == "Enter" && !isRecording) {
      await toggleRecording();
    }
  };

  return (
    <>
      <EuiFlexGroup alignItems="center" style={{ paddingTop: 10 }}>
        <EuiFlexItem grow={false}>
          <EuiIcon type="logoElastic" size="xl"></EuiIcon>
        </EuiFlexItem>
        <EuiText>
          <h1>Elastic Synthetics Recorder </h1>
        </EuiText>
        <EuiFlexItem></EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer />
      <EuiSpacer />
      <EuiFlexGroup wrap>
        <EuiFlexItem style={{ minWidth: 550 }}>
          <EuiFieldText
            placeholder="Enter URL to test"
            value={props.url}
            onKeyUp={onUrlFieldKeyUp}
            onChange={e => props.onUrlChange(e.target.value)}
            fullWidth
          />
        </EuiFlexItem>
        <EuiFlexItem style={{ minWidth: 250 }}>
          <EuiFlexGroup gutterSize="m">
            <EuiFlexItem grow={false}>
              <EuiButton
                aria-label="Perform a test run the journey you have defined"
                fill
                onClick={onTest}
                color="primary"
              >
                Test
              </EuiButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton fill onClick={onSave} color="secondary">
                Save and download
              </EuiButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiSelect
                aria-label="Choose the type of journey"
                options={[
                  { value: "inline", text: "Inline" },
                  { value: "suite", text: "Suite" },
                ]}
                value={props.type}
                onChange={e => props.onJourneyType(e.target.value)}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
}
