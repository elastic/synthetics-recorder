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

import { EuiButtonIcon, EuiFlexItem, EuiToolTip } from '@elastic/eui';
// import { Step } from '@elastic/synthetics';
import type { Step } from '../../../common/types';
import React, { useContext, useState } from 'react';
import { DRAG_AND_DROP_DATA_TRANSFER_TYPE } from '../../common/shared';
import { StepSeparatorDragDropDataTransfer } from '../../common/types';
import { DragAndDropContext } from '../../contexts/DragAndDropContext';
import { StepsContext } from '../../contexts/StepsContext';
import { EditStepNameInput } from './EditStepNameInput';
import {
  ControlsWrapper,
  DeleteButton,
  StepSeparatorHeading,
  StepSeparatorTopBorder,
} from './styles';

interface ISeparatorActions {
  canDelete: boolean;
  index: number;
  isDraggable: boolean | null;
  showControls: boolean;
  step: Step;
}

type DragHandler = React.DragEventHandler<HTMLDivElement | HTMLSpanElement>;

interface IDragProps {
  onDragStart?: DragHandler;
  onDragEnd?: DragHandler;
}

function createStepSeparatorDragDropData(stepIndex: number): StepSeparatorDragDropDataTransfer {
  return { initiatorIndex: stepIndex };
}

export function SeparatorActions({
  canDelete,
  index,
  isDraggable,
  showControls,
  step,
}: ISeparatorActions) {
  const [isGrabbing, setIsGrabbing] = useState<boolean | null>(
    isDraggable === null ? isDraggable : false
  );
  const { setDragIndex } = useContext(DragAndDropContext);
  const { onMergeSteps, setStepName } = useContext(StepsContext);
  const [showEditButton, setShowEditButton] = useState(true);
  const [showDeleteButton, setShowDeleteButton] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const dragParams: IDragProps = {};
  if (isDraggable) {
    dragParams.onDragStart = e => {
      setDragIndex(index);
      setShowDeleteButton(false);
      setShowEditButton(false);
      const dragDataString = JSON.stringify(createStepSeparatorDragDropData(index));
      e.dataTransfer.setData(DRAG_AND_DROP_DATA_TRANSFER_TYPE, dragDataString);
      e.dataTransfer.setData('text/plain', dragDataString);
    };
    dragParams.onDragEnd = () => {
      setShowDeleteButton(true);
      setShowEditButton(true);
      setDragIndex(undefined);
      setIsGrabbing(false);
    };
  }
  const defaultStepName = `Step ${index + 1}`;
  const stepHeadingText = step.name ?? defaultStepName;
  return (
    <ControlsWrapper
      alignItems="center"
      draggable={!!isDraggable}
      gutterSize="s"
      isGrabbing={isGrabbing}
      onMouseDown={() => setIsGrabbing(true)}
      onMouseUp={() => setIsGrabbing(false)}
      {...dragParams}
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
        <EuiFlexItem grow={false} style={{ visibility: showControls ? 'visible' : 'hidden' }}>
          <EuiToolTip content="Edit step name">
            <EuiButtonIcon
              aria-label="Rename step"
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
              aria-label="Delete step"
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
  );
}
