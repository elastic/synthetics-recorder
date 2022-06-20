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

import { useCallback, useContext, useState } from 'react';
import { RecorderSteps } from '../../common/types';
import { DRAG_AND_DROP_DATA_TRANSFER_TYPE } from '../common/shared';
import { StepSeparatorDragDropDataTransfer } from '../common/types';
import { DragAndDropContext } from '../contexts/DragAndDropContext';
import { StepsContext } from '../contexts/StepsContext';

export const computeIsDroppable = (
  stepIndex: number,
  actionIndex: number,
  steps: RecorderSteps,
  dragStepIndex?: number
) =>
  /**
   * An action element is droppable when its parent step has > 1 item,
   * it is not the final item in the step, and the step being dragged is
   * either a neighboring step, or the action's own step.
   */
  steps[stepIndex].actions.length > 1 &&
  steps[stepIndex].actions.length !== actionIndex + 1 &&
  (dragStepIndex === undefined || Math.abs(dragStepIndex - stepIndex) <= 1);

type DragEvent = React.DragEventHandler<HTMLDivElement | HTMLSpanElement>;

interface DropProps {
  onDrop?: DragEvent;
  onDragEnter?: DragEvent;
  onDragLeave?: DragEvent;
  onDragOver?: DragEvent;
}
export function useDrop(stepIndex: number, actionIndex: number) {
  const { dragIndex } = useContext(DragAndDropContext);
  const { steps, onDropStep, onSplitStep } = useContext(StepsContext);
  const [dropzoneOver, setDropzeonOver] = useState(false);
  const [enterTarget, setEnterTarget] = useState<EventTarget | undefined>(undefined);

  const splitStepAtAction = useCallback(() => {
    onSplitStep(stepIndex, actionIndex);
  }, [actionIndex, onSplitStep, stepIndex]);

  const isDroppable = computeIsDroppable(stepIndex, actionIndex, steps, dragIndex);

  const onDropActions: DropProps = {};
  if (isDroppable) {
    onDropActions.onDrop = e => {
      const { initiatorIndex } = JSON.parse(
        e.dataTransfer.getData(DRAG_AND_DROP_DATA_TRANSFER_TYPE)
      ) as StepSeparatorDragDropDataTransfer;
      setDropzeonOver(false);
      onDropStep(stepIndex, initiatorIndex, actionIndex);
      e.preventDefault();
    };
    onDropActions.onDragEnter = e => {
      setEnterTarget(e.target);
      setDropzeonOver(true);
      e.preventDefault();
    };
    onDropActions.onDragOver = e => {
      e.preventDefault();
    };
    onDropActions.onDragLeave = e => {
      if (e.target === enterTarget) setDropzeonOver(false);
    };
  }

  return {
    isDragOver: isDroppable && dropzoneOver,
    onDropActions,
    splitStepAtAction,
  };
}
