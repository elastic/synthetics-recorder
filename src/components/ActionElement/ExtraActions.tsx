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
import React, { useContext, useState } from 'react';
import { RecordingStatus } from '../../common/types';
import { ActionContext } from '../../../common/types';
import { RecordingContext } from '../../contexts/RecordingContext';
import { StepsContext } from '../../contexts/StepsContext';
import { ActionControlButton } from './ControlButton';
import { HeadingText } from './HeadingText';
import { SettingsPopover } from './SettingsPopover';

interface IExtraActions {
  actionIndex: number;
  areControlsVisible: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  actionContext: ActionContext;
  stepIndex: number;
}

export function ExtraActions({
  actionIndex,
  areControlsVisible,
  isOpen,
  setIsOpen,
  actionContext,
  stepIndex,
}: IExtraActions) {
  const [isSettingsPopoverOpen, setIsSettingsPopoverOpen] = useState(false);
  const { onDeleteAction, onSoftDeleteAction, onInsertAction } = useContext(StepsContext);
  const { recordingStatus } = useContext(RecordingContext);
  const settingsHandler = (handler: () => void) => {
    return function () {
      if (isSettingsPopoverOpen) {
        setIsSettingsPopoverOpen(false);
      }
      handler();
    };
  };
  const onEdit = settingsHandler(() => {
    setIsOpen(!isOpen);
  });
  return (
    <EuiFlexGroup alignItems="center" gutterSize="xs" justifyContent="spaceBetween">
      <EuiFlexItem>
        <HeadingText actionContext={actionContext} />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <ActionControlButton
          aria-label="Begin editing this action"
          isDisabled={recordingStatus !== RecordingStatus.NotRecording}
          iconType="pencil"
          isVisible={areControlsVisible}
          onClick={onEdit}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <SettingsPopover
          isAssertion={actionContext.action.isAssert === true}
          isRecording={recordingStatus !== RecordingStatus.NotRecording}
          isVisible={areControlsVisible || isSettingsPopoverOpen}
          onAddAssertion={settingsHandler(() => {
            onInsertAction(
              {
                ...actionContext,
                action: {
                  ...actionContext.action,
                  name: 'assert',
                  selector: actionContext.action.selector || '',
                  command: 'isVisible',
                  value: actionContext.action.value || undefined,
                  signals: [],
                  isAssert: true,
                },
                isOpen: true,
                modified: false,
              },
              stepIndex,
              actionIndex + 1
            );
          })}
          onEdit={onEdit}
          onDelete={settingsHandler(() => {
            onDeleteAction(stepIndex, actionIndex);
          })}
          onSoftDelete={settingsHandler(() => {
            onSoftDeleteAction(stepIndex, actionIndex);
          })}
          isOpen={isSettingsPopoverOpen}
          setIsOpen={setIsSettingsPopoverOpen}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
