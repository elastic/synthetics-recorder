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
  EuiAccordion,
  EuiFlexItem,
  EuiFlexGroup,
  EuiButtonIcon,
  EuiFieldText,
  EuiToolTip,
} from "@elastic/eui";
import type { Step } from "@elastic/synthetics";
import React, { useContext, useState } from "react";
import styled from "styled-components";
import {
  DRAG_AND_DROP_DATA_TRANSFER_TYPE,
  SMALL_SCREEN_BREAKPOINT,
} from "../common/shared";
import { StepSeparatorDragDropDataTransfer } from "../common/types";
import { DragAndDropContext } from "../contexts/DragAndDropContext";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { useStepResultStatus } from "../hooks/useTestResult";
import { ActionElement } from "./ActionElement/ActionElement";

export const StepSeparatorTopBorder = styled(EuiFlexItem)`
  border-top: ${props => props.theme.border.thin};

  @media (max-width: ${SMALL_SCREEN_BREAKPOINT}px) {
    max-width: 566px;
  }
`;

export const StepSeparatorAccordion = styled(EuiAccordion)`
  .euiAccordion__button {
    width: auto;
    flex-grow: 0;
  }

  .euiAccordion__optionalAction {
    flex-grow: 1;
    flex-shrink: 1;
  }

  div[id^="step-separator-"] {
    overflow: visible;
  }

  margin: 16px;
`;

export const StepSeparatorHeading = styled(EuiFlexItem)`
  font-weight: bold;
`;

function createStepSeparatorDragDropData(
  stepIndex: number
): StepSeparatorDragDropDataTransfer {
  return { initiatorIndex: stepIndex };
}

interface IEditStepNameInput {
  defaultValue?: string;
  onComplete: (value: string | null) => void;
  placeholder: string;
}

function EditStepNameInput({
  defaultValue,
  onComplete,
  placeholder,
}: IEditStepNameInput) {
  const [editValue, setEditValue] = useState(defaultValue ?? "");
  return (
    <EuiFlexGroup
      alignItems="center"
      gutterSize="xs"
      style={{ padding: 4, marginLeft: 4 }}
    >
      <EuiFlexItem>
        <EuiFieldText
          aria-label="Enter a new name for this step"
          onChange={e => setEditValue(e.target.value)}
          onKeyUp={e => {
            console.log("key up event", e);
            switch (e.key) {
              case "Enter":
                onComplete(editValue ?? null);
                break;
              case "Escape":
                onComplete(null);
                break;
            }
          }}
          autoFocus
          placeholder={placeholder}
          value={editValue}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiToolTip content="Save">
          <EuiButtonIcon
            aria-label="Click this button to save the step name"
            iconType="check"
            onClick={() => onComplete(editValue ? editValue : null)}
          />
        </EuiToolTip>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiToolTip content="Cancel">
          <EuiButtonIcon
            aria-label="Cancel edit for this step name"
            iconType="cross"
            onClick={() => onComplete(null)}
          />
        </EuiToolTip>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}

interface IStepSeparator {
  index: number;
  step: Step;
  setStepName: (index: number, name: string) => void;
}

export function StepSeparator({ index, setStepName, step }: IStepSeparator) {
  const testStatus = useStepResultStatus(
    step.actions.length ? step.actions[0].title : undefined
  );
  const { setIsDragInProgress } = useContext(DragAndDropContext);
  const [showEditButton, setShowEditButton] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const { isDraggable } = useDragAndDrop(index);

  const onDragStart:
    | React.DragEventHandler<HTMLDivElement | HTMLSpanElement>
    | undefined = isDraggable
    ? e => {
        setShowEditButton(false);
        setIsDragInProgress(true);
        const dragDataString = JSON.stringify(
          createStepSeparatorDragDropData(index)
        );
        e.dataTransfer.setData(
          DRAG_AND_DROP_DATA_TRANSFER_TYPE,
          dragDataString
        );
        e.dataTransfer.setData("text/plain", dragDataString);
      }
    : undefined;
  const onDragEnd = isDraggable
    ? () => {
        setShowEditButton(true);
        setIsDragInProgress(false);
      }
    : undefined;

  const stepHeadingText = step.name ?? `Step ${index + 1}`;

  return (
    <StepSeparatorAccordion
      className="stepSeparator"
      extraAction={
        <EuiFlexGroup
          alignItems="center"
          gutterSize="s"
          draggable={isDraggable}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          {!isEditingName && (
            <StepSeparatorHeading grow={false}>
              {stepHeadingText}
            </StepSeparatorHeading>
          )}
          {isEditingName && (
            <EditStepNameInput
              placeholder={stepHeadingText}
              defaultValue={step.name}
              onComplete={value => {
                setIsEditingName(false);
                setShowEditButton(true);
                if (value !== null) {
                  setStepName(index, value);
                }
              }}
            />
          )}
          {showEditButton && (
            <EuiFlexItem grow={false}>
              <EuiButtonIcon
                aria-label="Click this to edit the step name"
                iconType="pencil"
                onClick={() => {
                  setIsEditingName(true);
                  setShowEditButton(false);
                }}
              />
            </EuiFlexItem>
          )}
          {!isEditingName && <StepSeparatorTopBorder />}
        </EuiFlexGroup>
      }
      id={`step-separator-${index}`}
      initialIsOpen
    >
      {step.actions.map((s, actionIndex) => (
        <ActionElement
          key={`action-${actionIndex}-for-step-${index}`}
          step={s}
          actionIndex={actionIndex}
          stepIndex={index}
          testStatus={testStatus}
          isLast={actionIndex === step.actions.length - 1}
        />
      ))}
    </StepSeparatorAccordion>
  );
}
