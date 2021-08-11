import React, { useState } from "react";
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiText,
  EuiCodeBlock,
  EuiButton,
  EuiPanel,
} from "@elastic/eui";
import { Steps } from "./Steps";

const { ipcRenderer: ipc } = window.require("electron-better-ipc");

export function Snippet(props) {
  const [isRecording, setIsRecording] = useState(false);

  const onRecord = async () => {
    if (isRecording) {
      setIsRecording(false);
      // Stop browser process
      ipc.send("stop");
      return;
    }
    setIsRecording(true);
    const actions = await ipc.callMain("record-journey", { url: props.url });
    setIsRecording(false);
    props.onUpdateActions(actions);
  };

  return (
    <EuiPanel hasBorder={true} color="transparent">
      <EuiFlexGroup alignItems="baseline">
        <EuiFlexItem>
          <EuiText size="s">
            <p>Get started with your script</p>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiButton iconType="play" color="secondary" onClick={onRecord}>
            {isRecording ? "Stop Recording" : "Start Recording"}
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer />

      <EuiFlexItem>
        <Steps onUpdateActions={props.onUpdateActions} />
      </EuiFlexItem>
      <EuiSpacer />
    </EuiPanel>
  );
}
