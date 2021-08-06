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
  const [url, setUrl] = useState("");

  async function onRecord() {
    const journeyCode = await ipc.callMain("record-journey", {
      url,
      isSuite: props.type === "suite",
    });
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
            value={url}
            onChange={(e) => handleChange(e.target.value)}
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
