import React, { useState } from "react";
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
  const onSave = async () => {
    await ipc.callMain("save-file", props.code);
  };
  const onTest = async () => {
    const syntheticsOutput = await ipc.callMain("run-journey", {
      code: props.code,
      isSuite: props.type === "suite",
    });
    props.onTestRun(syntheticsOutput);
  };

  return (
    <>
      <EuiFlexGroup alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiIcon type="logoElastic" size="xl"></EuiIcon>
        </EuiFlexItem>
        <EuiText>
          <h2>Elastic Synthetics Recorder </h2>
        </EuiText>
        <EuiFlexItem></EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer />
      <EuiSpacer />
      <EuiFlexGroup>
        <EuiFlexItem grow={2}>
          <EuiFieldText
            placeholder="Enter URL to test"
            value={props.url}
            onChange={(e) => props.onUrlChange(e.target.value)}
            fullWidth
          />
        </EuiFlexItem>
        <EuiFlexItem grow={2}>
          <EuiFlexGroup gutterSize="m">
            <EuiFlexItem>
              <EuiSelect
                options={[
                  { value: "inline", text: "Inline" },
                  { value: "suite", text: "Suite" },
                ]}
                value={props.type}
                onChange={(e) => props.onJourneyType(e.target.value)}
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton fill onClick={onTest} color="primary">
                Test
              </EuiButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton fill onClick={onSave} color="secondary">
                Save
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
}
