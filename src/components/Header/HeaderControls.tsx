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

import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import React, { useCallback, useContext } from 'react';
import styled from 'styled-components';
import { RecordingStatus, Setter } from '../../common/types';
import { RecordingContext } from '../../contexts/RecordingContext';
import { StepsContext } from '../../contexts/StepsContext';
import { TestContext } from '../../contexts/TestContext';
import { UrlContext } from '../../contexts/UrlContext';
import { ControlButton } from '../ControlButton';
import { TestButton } from '../TestButton';
import { RecordingStatusIndicator } from './StatusIndicator';
import { UrlField } from './UrlField';

const Header = styled(EuiFlexGroup)`
  background-color: ${props => props.theme.colors.emptyShade};
  border-bottom: ${props => props.theme.border.thin};
  margin: 0px;
  padding: 8px;
`;

const TestButtonDivider = styled(EuiFlexItem)`
  border-right: ${props => props.theme.border.thin};
  padding-right: 16px;
`;

interface IHeaderControls {
  setIsCodeFlyoutVisible: Setter<boolean>;
}

export function HeaderControls({ setIsCodeFlyoutVisible }: IHeaderControls) {
  const { recordingStatus, togglePause, toggleRecording } = useContext(RecordingContext);

  const { url, setUrl } = useContext(UrlContext);

  const { steps } = useContext(StepsContext);

  const {
    isTestInProgress,
    onTest: startTest,
    setIsTestInProgress,
    setResult,
  } = useContext(TestContext);

  const onTest = useCallback(() => {
    setResult(undefined);
    setIsTestInProgress(true);
    startTest();
  }, [setIsTestInProgress, setResult, startTest]);

  return (
    <Header alignItems="center" gutterSize="m">
      {recordingStatus === RecordingStatus.NotRecording && (
        <EuiFlexItem>
          <UrlField
            recordingStatus={recordingStatus}
            setUrl={setUrl}
            toggleRecording={toggleRecording}
            url={url}
          />
        </EuiFlexItem>
      )}
      <EuiFlexItem grow={false}>
        <ControlButton
          aria-label={getPlayControlCopy(recordingStatus, steps.length)}
          color="primary"
          isDisabled={isTestInProgress}
          iconType={recordingStatus === RecordingStatus.Recording ? 'pause' : 'play'}
          fill
          onClick={recordingStatus === RecordingStatus.NotRecording ? toggleRecording : togglePause}
        >
          {getPlayControlCopy(recordingStatus, steps.length)}
        </ControlButton>
      </EuiFlexItem>
      {recordingStatus !== RecordingStatus.NotRecording && (
        <EuiFlexItem grow={false}>
          <ControlButton
            aria-label="Stop recording and clear all recorded actions"
            isDisabled={recordingStatus !== RecordingStatus.Recording}
            color="primary"
            iconType="stop"
            onClick={() => {
              toggleRecording();
            }}
          >
            Stop
          </ControlButton>
        </EuiFlexItem>
      )}
      <EuiFlexItem
        grow={
          recordingStatus === RecordingStatus.Recording ||
          recordingStatus === RecordingStatus.Paused
        }
      >
        <RecordingStatusIndicator status={recordingStatus} />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiFlexGroup gutterSize="m">
          <TestButtonDivider>
            <TestButton
              isDisabled={
                isTestInProgress ||
                steps.length === 0 ||
                recordingStatus !== RecordingStatus.NotRecording
              }
              showTooltip={steps.length === 0}
              onTest={onTest}
            />
          </TestButtonDivider>
          <EuiFlexItem>
            <ControlButton
              isDisabled={steps.length === 0}
              iconType="exportAction"
              fill
              onClick={() => setIsCodeFlyoutVisible(true)}
            >
              Export
            </ControlButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
    </Header>
  );
}

function getPlayControlCopy(status: RecordingStatus, stepCount: number) {
  if (status === RecordingStatus.NotRecording && stepCount > 0) {
    return 'Start over';
  }
  switch (status) {
    case RecordingStatus.NotRecording:
      return 'Start';
    case RecordingStatus.Recording:
      return 'Pause';
    case RecordingStatus.Paused:
      return 'Resume';
    default:
      return '';
  }
}
