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
  EuiToolTip,
} from "@elastic/eui";
import type { Step } from "@elastic/synthetics";
import React, { useContext, useState } from "react";
import styled from "styled-components";
import {
  DRAG_AND_DROP_DATA_TRANSFER_TYPE,
  SMALL_SCREEN_BREAKPOINT,
} from "../../common/shared";
import { StepSeparatorDragDropDataTransfer } from "../../common/types";
import { DragAndDropContext } from "../../contexts/DragAndDropContext";
import { StepsContext } from "../../contexts/StepsContext";
import { useDragAndDrop } from "../../hooks/useDragAndDrop";
import { useStepResultStatus } from "../../hooks/useTestResult";
import { ActionElement } from "../ActionElement/ActionElement";
import { EditStepNameInput } from "./EditStepNameInput";

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

interface IDeleteButtonProps {
  isVisible: boolean;
}

const DeleteButton = styled(EuiButtonIcon)<IDeleteButtonProps>`
  visibility: ${props => (props.isVisible ? "visible" : "hidden")};
`;

interface IControlsWrapper {
  isGrabbing: boolean | null;
}

const ControlsWrapper = styled(EuiFlexGroup)<IControlsWrapper>`
  cursor: ${({ isGrabbing }) =>
    isGrabbing === null ? "default" : isGrabbing ? "grabbing" : "grab"};
`;

function createStepSeparatorDragDropData(
  stepIndex: number
): StepSeparatorDragDropDataTransfer {
  return { initiatorIndex: stepIndex };
}

interface IStepSeparator {
  index: number;
  step: Step;
}

export function StepSeparator({ index, step }: IStepSeparator) {
  const testStatus = useStepResultStatus(
    step.actions.length ? step.actions[0].title : undefined
  );
  const { setDragIndex } = useContext(DragAndDropContext);
  const { onMergeSteps, setStepName } = useContext(StepsContext);
  const [showEditButton, setShowEditButton] = useState(true);
  const [showDeleteButton, setShowDeleteButton] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [canDelete, setCanDelete] = useState(true);
  const { isDraggable } = useDragAndDrop(index);
  const [isGrabbing, setIsGrabbing] = useState<boolean | null>(
    isDraggable === null ? isDraggable : false
  );

  const onDragStart:
    | React.DragEventHandler<HTMLDivElement | HTMLSpanElement>
    | undefined = isDraggable
    ? e => {
        setDragIndex(index);
        setShowDeleteButton(false);
        setShowEditButton(false);
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
        setShowDeleteButton(true);
        setShowEditButton(true);
        setDragIndex(undefined);
        setIsGrabbing(false);
      }
    : undefined;

  const defaultStepName = `Step ${index + 1}`;
  const stepHeadingText = step.name ?? defaultStepName;

  return (
    <div
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <StepSeparatorAccordion
        className="stepSeparator"
        extraAction={
          <ControlsWrapper
            alignItems="center"
            draggable={!!isDraggable}
            gutterSize="s"
            isGrabbing={isGrabbing}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onMouseDown={() => setIsGrabbing(true)}
            onMouseUp={() => setIsGrabbing(false)}
          >
            {!isEditingName && (
              <StepSeparatorHeading id={`step-${index}`} grow={false}>
                {stepHeadingText}
              </StepSeparatorHeading>
            )}
            {isEditingName && (
              <EditStepNameInput
                placeholder={defaultStepName}
                defaultValue={step.name}
                onComplete={(value?: string | null) => {
                  setIsEditingName(false);
                  setShowEditButton(true);
                  if (value !== null) {
                    setStepName(index, value);
                  }
                }}
              />
            )}
            {showEditButton && (
              <EuiFlexItem
                grow={false}
                style={{ visibility: showControls ? "visible" : "hidden" }}
              >
                <EuiToolTip content="Edit step name">
                  <EuiButtonIcon
                    aria-label="Click this to edit the step name"
                    color="text"
                    iconType="pencil"
                    onClick={() => {
                      setIsEditingName(true);
                      setShowEditButton(false);
                    }}
                  />
                </EuiToolTip>
              </EuiFlexItem>
            )}
            {index > 0 && canDelete && showDeleteButton && !isEditingName && (
              <EuiFlexItem grow={false}>
                <EuiToolTip content="Delete this step divider">
                  <DeleteButton
                    aria-label="Click to delete this step"
                    color="text"
                    disabled={!canDelete}
                    iconType="trash"
                    isVisible={showControls}
                    onClick={() => onMergeSteps(index - 1, index)}
                  />
                </EuiToolTip>
              </EuiFlexItem>
            )}
            {!isEditingName && <StepSeparatorTopBorder />}
          </ControlsWrapper>
        }
        id={`step-separator-${index}`}
        initialIsOpen
        onToggle={isOpen => setCanDelete(isOpen)}
      >
        {step.actions.map((actionContext, actionIndex) => (
          <ActionElement
            key={`action-${actionIndex}-for-step-${index}`}
            actionContext={actionContext}
            actionIndex={actionIndex}
            stepIndex={index}
            testStatus={testStatus}
            isLast={actionIndex === step.actions.length - 1}
          />
        ))}
      </StepSeparatorAccordion>
    </div>
  );
}
