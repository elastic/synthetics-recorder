/*
MIT License

Copyright (c) 2021-present, Elastic NV

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  useEuiTheme,
} from "@elastic/eui";
import React, { useContext } from "react";
import { RecordingStatus, Setter } from "../../common/types";
import { RecordingContext } from "../../contexts/RecordingContext";
import { TestContext } from "../../contexts/TestContext";
import { ControlButton } from "../ControlButton";
import { SaveCodeButton } from "../ExportScriptButton";
import { TestButton } from "../TestButton";
import { RecordingStatusIndicator } from "./StatusIndicator";

interface IHeaderControls {
  hasActions: boolean;
  setIsCodeFlyoutVisible: Setter<boolean>;
}

export function HeaderControls({
  hasActions: disabled,
  setIsCodeFlyoutVisible,
}: IHeaderControls) {
  const { euiTheme } = useEuiTheme();
  const { recordingStatus, toggleRecording } = useContext(RecordingContext);
  const { onTest } = useContext(TestContext);
  return (
    <EuiFlexGroup
      alignItems="center"
      gutterSize="m"
      style={{
        backgroundColor: euiTheme.colors.lightestShade,
        borderBottom: euiTheme.border.thin,
        margin: "0px 0px 4px 0px",
        padding: 8,
      }}
    >
      <EuiFlexItem grow={false}>
        <ControlButton
          aria-label="Toggle script recording on/off"
          color="primary"
          iconType={
            recordingStatus === RecordingStatus.Recording ? "stop" : "play"
          }
          onClick={toggleRecording}
        >
          {recordingStatus === RecordingStatus.Recording
            ? "Stop"
            : "Start recording"}
        </ControlButton>
      </EuiFlexItem>
      <EuiFlexItem>
        <RecordingStatusIndicator status={recordingStatus} />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiFlexGroup gutterSize="m">
          <EuiFlexItem>
            <TestButton disabled={disabled} onTest={onTest} />
          </EuiFlexItem>
          <EuiFlexItem
            style={{
              borderRight: euiTheme.border.thin,
              paddingRight: 16,
            }}
          >
            <EuiButton
              color="text"
              iconType="editorCodeBlock"
              onClick={async function () {
                setIsCodeFlyoutVisible(true);
              }}
            >
              View code
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem>
            <SaveCodeButton />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
