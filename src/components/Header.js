import React from "react";
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
const { ipcRenderer: ipc } = window.require("electron-better-ipc");

export function Header(props) {
  const getCodeFromActions = async () => {
    const code = await ipc.callMain("actions-to-code", {
      actions: props.currentActions,
      isSuite: props.type == "suite",
    });
    return code;
  };

  const onSave = async () => {
    const code = await getCodeFromActions();
    await ipc.callMain("save-file", code);
  };
  const onTest = async () => {
    const code = await getCodeFromActions();
    const syntheticsOutput = await ipc.callMain("run-journey", {
      code,
      isSuite: props.type === "suite",
    });
    props.onTestRun(syntheticsOutput);
  };

  return (
    <>
      <EuiFlexGroup alignItems="center" style={{ paddingTop: 10 }}>
        <EuiFlexItem grow={false}>
          <EuiIcon type="logoElastic" size="xl"></EuiIcon>
        </EuiFlexItem>
        <EuiText>
          <h3>Elastic Synthetics Recorder </h3>
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
            onChange={(e) => props.onUrlChange(e.target.value)}
            fullWidth
          />
        </EuiFlexItem>
        <EuiFlexItem style={{ minWidth: 250 }}>
          <EuiFlexGroup gutterSize="m">
            <EuiFlexItem grow={false}>
              <EuiButton fill onClick={onTest} color="primary">
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
                options={[
                  { value: "inline", text: "Inline" },
                  { value: "suite", text: "Suite" },
                ]}
                value={props.type}
                onChange={(e) => props.onJourneyType(e.target.value)}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
}
