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
import React, { useCallback, useContext, useState } from "react";
import { RecordingStatus, Setter } from "../../common/types";
import { RecordingContext } from "../../contexts/RecordingContext";
import { StepsContext } from "../../contexts/StepsContext";
import { TestContext } from "../../contexts/TestContext";
import { UrlContext } from "../../contexts/UrlContext";
import { ControlButton } from "../ControlButton";
import { SaveCodeButton } from "../ExportScriptButton";
import { StartOverWarningModal } from "../StartOverWarningModal";
import { TestButton } from "../TestButton";
import { RecordingStatusIndicator } from "./StatusIndicator";

export interface IHeaderControls {
  setIsCodeFlyoutVisible: Setter<boolean>;
}

export function HeaderControls({ setIsCodeFlyoutVisible }: IHeaderControls) {
  const { euiTheme } = useEuiTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { urlRef } = useContext(UrlContext);

  const { abortSession, recordingStatus, togglePause, toggleRecording } =
    useContext(RecordingContext);

  const { actions: stepActions } = useContext(StepsContext);

  const { onTest } = useContext(TestContext);

  const startOver = useCallback(async () => {
    await abortSession();
    setIsModalVisible(false);
    if (urlRef) urlRef.current?.focus();
  }, [abortSession, urlRef]);

  return (
    <>
      <EuiFlexGroup
        alignItems="center"
        gutterSize="m"
        style={{
          backgroundColor: euiTheme.colors.lightestShade,
          borderBottom: euiTheme.border.thin,
          margin: 0,
          padding: 8,
        }}
      >
        <EuiFlexItem grow={false}>
          <ControlButton
            aria-label="Toggle the script recorder between recording and paused"
            color="primary"
            iconType={
              recordingStatus === RecordingStatus.Recording ? "pause" : "play"
            }
            fill
            onClick={
              recordingStatus === RecordingStatus.NotRecording
                ? toggleRecording
                : togglePause
            }
          >
            {getPlayControlCopy(recordingStatus)}
          </ControlButton>
        </EuiFlexItem>
        {recordingStatus !== RecordingStatus.NotRecording && (
          <EuiFlexItem grow={false}>
            <ControlButton
              aria-label="Stop recording and clear all recorded actions"
              disabled={recordingStatus !== RecordingStatus.Recording}
              color="primary"
              iconType="refresh"
              onClick={() => {
                if (!isModalVisible) {
                  setIsModalVisible(true);
                }
              }}
            >
              Start over
            </ControlButton>
          </EuiFlexItem>
        )}
        <EuiFlexItem>
          <RecordingStatusIndicator status={recordingStatus} />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFlexGroup gutterSize="m">
            <EuiFlexItem>
              <TestButton disabled={stepActions.length === 0} onTest={onTest} />
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
                onClick={function () {
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

      {isModalVisible && (
        <StartOverWarningModal
          close={() => setIsModalVisible(false)}
          startOver={startOver}
          stepCount={stepActions.length}
        />
      )}
    </>
  );
}

function getPlayControlCopy(status: RecordingStatus) {
  switch (status) {
    case RecordingStatus.NotRecording:
      return "Start recording";
    case RecordingStatus.Recording:
      return "Pause";
    case RecordingStatus.Paused:
      return "Resume";
    default:
      return "";
  }
}
