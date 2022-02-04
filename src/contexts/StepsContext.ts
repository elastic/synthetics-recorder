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

import { createContext } from "react";
import type { ActionContext, Setter, Step, Steps } from "../common/types";

function notImplemented() {
  throw Error("Step context not initialized");
}

export interface IStepsContext {
  /**
   * Represents the actions and assertions that the user has recorded.
   */
  steps: Steps;
  /**
   * Updates the steps.
   */
  setSteps: Setter<Steps>;
  /**
   * Deletes the action at the `actionIndex` in the given step.
   */
  onDeleteAction: (stepIndex: number, actionIndex: number) => void;
  onDeleteStep: (stepIndex: number) => void;
  /**
   * Inserts the `action` to the given step at `actionIndex`.
   */
  onInsertAction: (
    action: ActionContext,
    stepIndex: number,
    actionIndex: number
  ) => void;
  /**
   * Merges two steps and replaces the first index with them.
   */
  onMergeSteps: (indexA: number, indexB: number) => void;
  /**
   * Creates a new step, composed of the previous step's actions starting at the given index.
   */
  onSplitStep: (stepIndex: number, actionIndex: number) => void;
  onUpdateAction: (
    action: ActionContext,
    stepIndex: number,
    actionIndex: number
  ) => void;
  /**
   * Overwrites the step at `stepIndex` with `step`.
   */
  onStepDetailChange: (step: Step, stepIndex: number) => void;
}

export const StepsContext = createContext<IStepsContext>({
  steps: [],
  setSteps: notImplemented,
  onDeleteAction: notImplemented,
  onDeleteStep: notImplemented,
  onInsertAction: notImplemented,
  onMergeSteps: notImplemented,
  onSplitStep: notImplemented,
  onStepDetailChange: notImplemented,
  onUpdateAction: notImplemented,
});
