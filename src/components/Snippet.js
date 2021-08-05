import React from "react";
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiText,
  EuiCodeBlock,
  EuiButton,
} from "@elastic/eui";

const { ipcRenderer: ipc } = window.require("electron-better-ipc");

export function Snippet(props) {
  const onTest = async () => {
    const syntheticsOutput = await ipc.callMain("run-journey", props.code);
    props.onTestRun(syntheticsOutput);
  };

  const onSave = async () => {
    await ipc.callMain("save-file", props.code);
  };

  return (
    <>
      <EuiText>
        <h3>Generated Test Snippet </h3>
      </EuiText>
      <EuiSpacer />
      <EuiFlexItem>
        <EuiCodeBlock
          language="js"
          fontSize="m"
          paddingSize="m"
          overflowHeight={200}
          style={{ minHeight: 120 }}
        >
          {props.code}
        </EuiCodeBlock>
      </EuiFlexItem>
      <EuiSpacer />
      <EuiFlexGroup gutterSize="s">
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
    </>
  );
}
