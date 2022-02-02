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

import { EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import React, { useContext, useState } from "react";
import { ActionContext, RecordingStatus, Setter } from "../../common/types";
import { RecordingContext } from "../../contexts/RecordingContext";
import { StepsContext } from "../../contexts/StepsContext";
import { ActionControlButton } from "./ControlButton";
import { HeadingText } from "./HeadingText";
import { SettingsPopover } from "./SettingsPopover";

interface IExtraActions {
  actionIndex: number;
  areControlsVisible: boolean;
  isOpen: boolean;
  setIsOpen: Setter<boolean>;
  step: ActionContext;
  stepIndex: number;
}

export function ExtraActions({
  actionIndex,
  areControlsVisible,
  isOpen,
  setIsOpen,
  step,
  stepIndex,
}: IExtraActions) {
  const [isSettingsPopoverOpen, setIsSettingsPopoverOpen] = useState(false);
  const { onDeleteAction, onInsertAction } = useContext(StepsContext);
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
    <EuiFlexGroup
      alignItems="center"
      gutterSize="xs"
      justifyContent="spaceBetween"
    >
      <EuiFlexItem>
        <HeadingText actionContext={step} />
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
          isRecording={recordingStatus !== RecordingStatus.NotRecording}
          isVisible={areControlsVisible || isSettingsPopoverOpen}
          onAddAssertion={settingsHandler(() => {
            onInsertAction(
              {
                ...step,
                action: {
                  ...step.action,
                  name: "assert",
                  selector: step.action.selector || "",
                  command: "isVisible",
                  value: step.action.value || null,
                  signals: [],
                  isAssert: true,
                },
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
          isOpen={isSettingsPopoverOpen}
          setIsOpen={setIsSettingsPopoverOpen}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
