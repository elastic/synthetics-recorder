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

import { useContext } from 'react';
import { RecorderSteps } from '../../common/types';
import { StepsContext } from '../contexts/StepsContext';

export function canDrag(stepIndex: number, steps: RecorderSteps): boolean | null {
  if (stepIndex === 0) return null;
  /**
   * A step heading is draggable if there's _somewhere_ for it to go between the preceeding
   * step and the next step. This means there needs to be two successive actions for the
   * step heading to place itself when dragging.
   *
   * Example:
   * In [a1], [a2], [a3], no steps are draggable, because we can't put the selector "between" these three actions.
   * [a1, a2], [a3], [a4], `stepIndex` 1 is draggable, because it can go "between" `a1` and `a2`
   *
   * The first step is never draggable, because the list must start with a step heading.
   */
  return (
    (steps[stepIndex - 1].actions.length <= 1 &&
      steps[stepIndex].actions.length <= 1 &&
      steps[stepIndex + 1]?.actions &&
      steps[stepIndex + 1].actions.length <= 1) === false
  );
}

interface UseDragAndDropResult {
  isDraggable: boolean | null;
}

export function useDragAndDrop(stepIndex: number): UseDragAndDropResult {
  const { steps } = useContext(StepsContext);

  return { isDraggable: canDrag(stepIndex, steps) };
}
