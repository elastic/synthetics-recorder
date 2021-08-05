import React, { useState } from "react";
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiText,
  EuiFieldText,
} from "@elastic/eui";
const { ipcRenderer: ipc } = window.require("electron-better-ipc");

export function Header(props) {
  const [url, setUrl] = useState("");

  async function onRecord() {
    const journeyCode = await ipc.callMain("record-journey", { url });
    props.onSaveSnippetCode(journeyCode);
  }

  function onStop() {
    ipc.send("stop");
  }

  function handleChange(value) {
    setUrl(value);
  }

  return (
    <>
      <EuiText>
        <h2>Elastic Synthetics Recorder </h2>
      </EuiText>
      <EuiSpacer />
      <EuiSpacer />
      <EuiFlexGroup>
        <EuiFlexItem grow={2}>
          <EuiFieldText
            placeholder="Enter URL to test"
            value={url}
            onChange={(e) => handleChange(e.target.value)}
            fullWidth
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFlexGroup gutterSize="m">
            <EuiFlexItem>
              <EuiButton fill onClick={onRecord} color="primary">
                Record
              </EuiButton>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiButton fill onClick={onStop} color="danger">
                Stop
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
}
