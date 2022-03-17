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

import type { ActionInContext, Step, Steps } from "@elastic/synthetics";
import { useState } from "react";
import type { IStepsContext } from "../contexts/StepsContext";

export function useStepsContext(): IStepsContext {
  const [steps, setSteps] = useState<Steps>([]);
  const onStepDetailChange = (updatedStep: Step, indexToUpdate: number) => {
    setSteps(
      steps.map((currentStep, iterIndex) =>
        // if the `currentStep` is at the `indexToUpdate`, return `updatedStep` instead of stale object
        iterIndex === indexToUpdate ? updatedStep : currentStep
      )
    );
  };
  return {
    steps,
    setSteps,
    onDeleteAction: (targetStepIdx, indexToDelete) => {
      setSteps(steps =>
        steps.map((step, currentStepIndex) => {
          if (currentStepIndex !== targetStepIdx) return step;

          step.actions.splice(indexToDelete, 1);

          return { ...step, actions: [...step.actions] };
        })
      );
    },
    onDeleteStep: stepIndex => {
      setSteps([...steps.slice(0, stepIndex), ...steps.slice(stepIndex + 1)]);
    },
    onInsertAction: (action, targetStepIdx, indexToInsert) => {
      setSteps(
        steps.map((step, currentStepIndex) => {
          if (currentStepIndex !== targetStepIdx) return step;

          step.actions.splice(indexToInsert, 0, action);

          return { name: step.name, actions: [...step.actions] };
        })
      );
    },
    onMergeSteps: (indexToInsert, indexToRemove) => {
      setSteps(oldSteps => {
        oldSteps[indexToInsert] = {
          name:
            oldSteps[indexToInsert].name ??
            oldSteps[indexToRemove].name ??
            undefined,
          actions: [
            ...steps[indexToInsert].actions,
            ...steps[indexToRemove].actions,
          ],
        };
        oldSteps.splice(indexToRemove, 1);
        return oldSteps;
      });
    },
    onRearrangeSteps: (indexA, indexB) => {
      setSteps(oldSteps => {
        const placeholder = steps[indexA];
        oldSteps[indexA] = oldSteps[indexB];
        oldSteps[indexB] = placeholder;
        return oldSteps;
      });
    },
    onSplitStep: (stepIndex, actionIndex) => {
      if (actionIndex === 0) {
        throw Error(`Cannot remove all actions from a step.`);
      }
      if (steps.length <= stepIndex) {
        throw Error("Step index cannot exceed steps length.");
      }
      const stepToSplit = steps[stepIndex];
      if (stepToSplit.actions.length <= 1) {
        throw Error("Cannot split step with only one action.");
      }
      const reducedStepActions = stepToSplit.actions.slice(0, actionIndex);
      const insertedStepActions = stepToSplit.actions.slice(actionIndex);

      setSteps([
        ...steps.slice(0, stepIndex),
        { name: stepToSplit.name, actions: reducedStepActions },
        { actions: insertedStepActions },
        ...steps.slice(stepIndex + 1, steps.length),
      ]);
    },
    onStepDetailChange,
    onUpdateAction: (
      action: ActionInContext,
      stepIndex: number,
      actionIndex: number
    ) => {
      const step = steps[stepIndex];
      onStepDetailChange(
        {
          actions: [
            ...step.actions.slice(0, actionIndex),
            action,
            ...step.actions.slice(actionIndex + 1, step.actions.length),
          ],
          name: step.name,
        },
        stepIndex
      );
    },
  };
}
