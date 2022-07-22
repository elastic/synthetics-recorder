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

// import type { Step } from '@elastic/synthetics';
import { createContext } from 'react';
import type { Setter } from '../common/types';
import type { ActionContext, RecorderSteps, Step } from '../../common/types';

function notImplemented() {
  throw Error('Step context not initialized');
}

export interface IStepsContext {
  /**
   * Represents the actions and assertions that the user has recorded.
   */
  steps: RecorderSteps;
  /**
   * Updates the steps.
   */
  setSteps: Setter<RecorderSteps>;
  /**
   * Sets the name of the step at the given index.
   */
  setStepName: (stepIndex: number, name?: string) => void;
  /**
   * Deletes the action at the `actionIndex` in the given step.
   *
   * This should only be called when the user is not recording.
   */
  onDeleteAction: (stepIndex: number, actionIndex: number) => void;
  /**
   * Marks an action for omission from display and code generation.
   */
  onSoftDeleteAction: (stepIndex: number, actionIndex: number) => void;
  /**
   * Deletes the step at `stepIndex`.
   */
  onDeleteStep: (stepIndex: number) => void;
  /**
   * Inserts the `action` to the given step at `actionIndex`.
   */
  onInsertAction: (action: ActionContext, stepIndex: number, actionIndex: number) => void;
  /**
   * Handles the mutation on a drag/drop.
   */
  onDropStep: (targetIndex: number, initiatorIndex: number, actionIndex: number) => void;
  /**
   * Merges two steps and replaces the first index with the merged result.
   */
  onMergeSteps: (indexToInsert: number, indexToRemove: number) => void;
  /**
   * Will rearrange the step list by moving one step to the other's location.
   */
  onRearrangeSteps: (indexA: number, indexB: number) => void;
  /**
   * Used to set the state of an action open/closed in the UI.
   */
  onSetActionIsOpen: (stepIndex: number, actionIndex: number, isOpen: boolean) => void;
  /**
   * Creates a new step, composed of the previous step's actions starting at the given index.
   */
  onSplitStep: (stepIndex: number, actionIndex: number) => void;
  /**
   * Overwrites the action at the given step -> action index.
   */
  onUpdateAction: (action: ActionContext, stepIndex: number, actionIndex: number) => void;
  /**
   * Overwrites the step at `stepIndex` with `step`.
   */
  onStepDetailChange: (step: Step, stepIndex: number) => void;
}

export const StepsContext = createContext<IStepsContext>({
  steps: [],
  setSteps: notImplemented,
  setStepName: notImplemented,
  onDeleteAction: notImplemented,
  onSoftDeleteAction: notImplemented,
  onDeleteStep: notImplemented,
  onDropStep: notImplemented,
  onInsertAction: notImplemented,
  onMergeSteps: notImplemented,
  onRearrangeSteps: notImplemented,
  onSetActionIsOpen: notImplemented,
  onSplitStep: notImplemented,
  onStepDetailChange: notImplemented,
  onUpdateAction: notImplemented,
});
