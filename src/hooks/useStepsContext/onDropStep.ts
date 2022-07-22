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

// import { Step } from '@elastic/synthetics';
import { RecorderSteps, Step } from '../../../common/types';
import { Setter } from '../../common/types';

export const onDropStep =
  (steps: RecorderSteps, setSteps: Setter<RecorderSteps>) =>
  /**
   * Used in conjunction with the drag/drop functionality for
   * moving a step separator in the UI to reorganize the bucketing
   * of actions.
   */
  (targetIndex: number, initiatorIndex: number, actionIndex: number) => {
    if (targetIndex < 0 || targetIndex >= steps.length)
      throw Error('Cannot drop step index because it does not exist');
    if (initiatorIndex <= 0 || initiatorIndex >= steps.length)
      throw Error('Cannot drag specified index because it does not exist');

    const targetStep = steps[targetIndex];
    const initiatorStep = steps[initiatorIndex];

    const dropProps = {
      targetStep,
      initiatorStep,
      actionIndex,
      targetIndex,
      initiatorIndex,
      setSteps,
    };
    if (targetIndex < initiatorIndex) {
      dropInPreviousStep(dropProps);
    } else if (targetIndex === initiatorIndex) {
      dropInSameStep(dropProps);
    } else if (targetIndex > initiatorIndex) {
      dropInNextStep(dropProps);
    }
  };

/**
 * Represents the dependenent data to mutate
 * the `Steps` based on the user's drag/drop activity.
 */
interface DropHandlerProps {
  targetStep: Step;
  initiatorStep: Step;
  actionIndex: number;
  targetIndex: number;
  initiatorIndex: number;
  setSteps: Setter<RecorderSteps>;
}

/**
 * The user dragged the initiator step into the previous step.
 *
 * @example
 * The example depends depend on this array:
 *
 * [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
 *
 * Target index: 0
 * Initiator index: 1
 * Action index: 1
 * Output: [[1, 2], [3, 4, 5, 6], [7, 8, 9]]
 *
 * Slice step 0 at idx 1, results in [1, 2]
 * Slice step 0, starting at idx 2...length, results in [3]
 * Merge [3] with step idx 1, [4, 5, 6]
 */
const dropInPreviousStep = ({
  actionIndex,
  initiatorIndex,
  initiatorStep,
  targetIndex,
  setSteps,
  targetStep,
}: DropHandlerProps) =>
  setSteps(oldSteps => [
    ...oldSteps.slice(0, targetIndex),
    {
      actions: targetStep.actions.slice(0, actionIndex + 1),
      name: targetStep.name,
    },
    {
      actions: [
        ...targetStep.actions.slice(actionIndex + 1, targetStep.actions.length),
        ...initiatorStep.actions,
      ],
      name: initiatorStep.name,
    },
    ...oldSteps.slice(initiatorIndex + 1, oldSteps.length),
  ]);

/**
 * The user dragged the separator between actions in the initial step
 *
 * @example
 * The example depends depend on this array:
 *
 * [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
 *
 * Target index: 1
 * Initiator index: 1
 * Action index: 0
 * Output: [[1, 2, 3, 4], [5, 6], [7, 8, 9]]
 */
const dropInSameStep = ({
  actionIndex,
  initiatorIndex,
  initiatorStep,
  setSteps,
  targetStep,
}: Omit<DropHandlerProps, 'targetIndex'>): void =>
  setSteps(oldSteps => [
    ...oldSteps.slice(0, initiatorIndex - 1),
    {
      actions: [
        ...oldSteps[initiatorIndex - 1].actions,
        ...targetStep.actions.slice(0, actionIndex + 1),
      ],
      name: oldSteps[initiatorIndex - 1].name,
    },
    {
      actions: targetStep.actions.slice(actionIndex + 1, targetStep.actions.length),
      name: initiatorStep.name,
    },
    ...oldSteps.slice(initiatorIndex + 1, oldSteps.length),
  ]);

/**
 * The user dragged the separator to the next step.
 *
 * @example
 * The example depends depend on this array:
 *
 * [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
 *
 * Target index: 2
 * Initiator index: 1
 * Action index: 0
 * Output: [[1, 2, 3], [4, 5], [6, 7, 8, 9]]
 */
const dropInNextStep = ({
  actionIndex,
  initiatorIndex,
  initiatorStep,
  targetIndex,
  setSteps,
  targetStep,
}: DropHandlerProps) =>
  setSteps(oldSteps => [
    ...oldSteps.slice(0, initiatorIndex),
    {
      actions: [...initiatorStep.actions, ...targetStep.actions.slice(0, actionIndex + 1)],
      name: initiatorStep.name,
    },
    {
      actions: targetStep.actions.slice(actionIndex + 1, targetStep.actions.length),
      name: targetStep.name,
    },
    ...oldSteps.slice(targetIndex + 1, oldSteps.length),
  ]);
