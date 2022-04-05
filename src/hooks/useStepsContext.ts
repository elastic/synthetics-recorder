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
import { useCallback, useState } from "react";
import type { IStepsContext } from "../contexts/StepsContext";

export function useStepsContext(): IStepsContext {
  const [steps, setSteps] = useState<Steps>([]);
  const setStepName = useCallback((idx: number, name?: string) => {
    setSteps(oldSteps => {
      return oldSteps.map((step, i) => {
        if (idx !== i) return step;
        step.name = name;
        return step;
      });
    });
  }, []);
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
    setStepName,
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
    onMergeSteps: (indexToInsert, indexToRemove) =>
      setSteps(oldSteps => [
        ...oldSteps.slice(0, indexToInsert),
        {
          name: oldSteps[indexToInsert].name ?? undefined,
          actions: [
            ...steps[indexToInsert].actions,
            ...steps[indexToRemove].actions,
          ],
        },
        ...oldSteps.slice(indexToRemove + 1, oldSteps.length),
      ]),
    onRearrangeSteps: (indexA, indexB) => {
      setSteps(oldSteps => {
        const placeholder = steps[indexA];
        oldSteps[indexA] = oldSteps[indexB];
        oldSteps[indexB] = placeholder;
        return oldSteps;
      });
    },
    /**
     * Used in conjunction with the drag/drop functionality for
     * moving a step separator in the UI to reorganize the bucketing
     * of actions.
     *
     * @example
     * The examples below depend on this array:
     *
     * [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
     *
     *
     * Example 1:
     * Target index: 0
     * Initiator index: 1
     * Action index: 1
     * Output: [[1, 2], [3, 4, 5, 6], [7, 8, 9]]
     *
     * Slice step 0 at idx 1, results in [1, 2]
     * Slice step 0, starting at idx 2...length, results in [3]
     * Merge [3] with step idx 1, [4, 5, 6]
     *
     * Example 2:
     * Target index: 1
     * Initiator index: 1
     * Action index: 0
     * Output: [[1, 2, 3, 4], [5, 6], [7, 8, 9]]
     *
     * Example 3:
     * Target index: 2
     * Initiator index: 1
     * Action index: 0
     * Output: [[1, 2, 3], [4, 5], [6, 7, 8, 9]]
     */
    onDropStep: (targetIndex, initiatorIndex, actionIndex) => {
      if (targetIndex < 0 || targetIndex >= steps.length)
        // TODO: improve error message
        throw Error("Invalid index for drag and drop step merge procedure");
      if (initiatorIndex <= 0 || initiatorIndex >= steps.length)
        // TODO: improve error message
        throw Error("Cannot drag/drop from specified index");

      const targetStep = steps[targetIndex];
      const initiatorStep = steps[initiatorIndex];

      // corresponds to example 1 above
      if (targetIndex < initiatorIndex) {
        const newTargetStep = targetStep.actions.slice(0, actionIndex + 1);
        const toMerge = targetStep.actions.slice(
          actionIndex + 1,
          targetStep.actions.length
        );
        const newInitiator = [...toMerge, ...initiatorStep.actions];
        setSteps(oldSteps => [
          ...oldSteps.slice(0, targetIndex),
          { actions: newTargetStep, name: targetStep.name },
          { actions: newInitiator, name: initiatorStep.name },
          ...oldSteps.slice(initiatorIndex + 1, oldSteps.length),
        ]);
      }
      // corresponds to example 2 above
      else if (targetIndex === initiatorIndex) {
        setSteps(oldSteps => {
          return [
            ...oldSteps.slice(0, initiatorIndex - 1),
            {
              actions: [
                ...oldSteps[initiatorIndex - 1].actions,
                ...targetStep.actions.slice(0, actionIndex + 1),
              ],
              name: oldSteps[initiatorIndex - 1].name,
            },
            {
              actions: targetStep.actions.slice(
                actionIndex + 1,
                targetStep.actions.length
              ),
              name: initiatorStep.name,
            },
            ...oldSteps.slice(initiatorIndex + 1, oldSteps.length),
          ];
        });
      }
      // corresponds to example 3 above
      else {
        setSteps(oldSteps => [
          ...oldSteps.slice(0, initiatorIndex),
          {
            actions: [
              ...initiatorStep.actions,
              ...targetStep.actions.slice(0, actionIndex + 1),
            ],
            name: initiatorStep.name,
          },
          {
            actions: targetStep.actions.slice(
              actionIndex + 1,
              targetStep.actions.length
            ),
            name: targetStep.name,
          },
          ...oldSteps.slice(targetIndex + 1, oldSteps.length),
        ]);
      }
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
