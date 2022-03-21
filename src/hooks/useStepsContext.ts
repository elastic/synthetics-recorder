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

const stepString: Steps = [
  {
    actions: [
      {
        pageAlias: "page",
        isMainFrame: true,
        frameUrl: "https://www.google.com/?gws_rd=ssl",
        committed: true,
        action: {
          name: "navigate",
          url: "https://www.google.com/?gws_rd=ssl",
          signals: [],
        },
        title: "Go to https://www.google.com/?gws_rd=ssl",
      },
      {
        pageAlias: "page",
        isMainFrame: true,
        frameUrl: "https://www.google.com/?gws_rd=ssl",
        action: {
          name: "click",
          selector: '[aria-label="Search"]',
          signals: [],
          button: "left",
          modifiers: 0,
          clickCount: 1,
        },
        committed: true,
        title: 'Click [aria-label="Search"]',
      },
    ],
  },
  {
    actions: [
      {
        pageAlias: "page",
        isMainFrame: true,
        frameUrl: "https://www.google.com/?gws_rd=ssl",
        action: {
          name: "click",
          selector: '[aria-label="Search"]',
          signals: [],
          button: "left",
          modifiers: 0,
          clickCount: 1,
        },
        committed: true,
        title: 'Click [aria-label="Search"]',
      },
    ],
  },
  {
    actions: [
      {
        pageAlias: "page",
        isMainFrame: true,
        frameUrl: "https://www.google.com/?gws_rd=ssl",
        action: {
          name: "fill",
          selector: '[aria-label="Search"]',
          signals: [],
          text: "hello world",
        },
        committed: true,
        title: 'Fill [aria-label="Search"]',
      },
    ],
  },
  {
    actions: [
      {
        pageAlias: "page",
        isMainFrame: true,
        frameUrl: "https://www.google.com/?gws_rd=ssl",
        action: {
          name: "press",
          selector: '[aria-label="Search"]',
          signals: [
            {
              name: "navigation",
              url: "https://www.google.com/search?q=hello+world&source=hp&ei=1fIDYvyEG_-uptQPrLSEmAQ&iflsig=AHkkrS4AAAAAYgQA5eT8f1OHn_SvvMjxkKLVQV0-YGXt&ved=0ahUKEwi8w-WAjPP1AhV_l4kEHSwaAUMQ4dUDCAo&uact=5&oq=hello+world&gs_lcp=Cgdnd3Mtd2l6EAMyCAgAEIAEELEDMgsIABCABBCxAxCDATIICC4QgAQQsQMyBQguEIAEMgsIABCABBCxAxCDATIICAAQgAQQsQMyCAgAEIAEELEDMgUIABCABDIICAAQgAQQsQMyCAgAEIAEELEDOg4IABCPARDqAhCMAxDlAjoOCC4QjwEQ6gIQjAMQ5QI6DgguEIAEELEDEMcBEKMCOgsILhCABBDHARCvAToRCC4QgAQQsQMQgwEQxwEQowI6DgguEIAEELEDEMcBENEDOgsILhCxAxDHARCjAjoICC4QsQMQgwE6CwguEIAEELEDEIMBOhEILhCABBCxAxCDARDHARDRAzoLCAAQgAQQsQMQyQM6CggAELEDEIMBEApQlQhYvBFgtxJoAXAAeACAAVqIAawGkgECMTGYAQCgAQGwAQo&sclient=gws-wiz",
            },
            {
              name: "navigation",
              url: "https://www.google.com/search?q=hello+world&source=hp&ei=1fIDYvyEG_-uptQPrLSEmAQ&iflsig=AHkkrS4AAAAAYgQA5eT8f1OHn_SvvMjxkKLVQV0-YGXt&ved=0ahUKEwi8w-WAjPP1AhV_l4kEHSwaAUMQ4dUDCAo&uact=5&oq=hello+world&gs_lcp=Cgdnd3Mtd2l6EAMyCAgAEIAEELEDMgsIABCABBCxAxCDATIICC4QgAQQsQMyBQguEIAEMgsIABCABBCxAxCDATIICAAQgAQQsQMyCAgAEIAEELEDMgUIABCABDIICAAQgAQQsQMyCAgAEIAEELEDOg4IABCPARDqAhCMAxDlAjoOCC4QjwEQ6gIQjAMQ5QI6DgguEIAEELEDEMcBEKMCOgsILhCABBDHARCvAToRCC4QgAQQsQMQgwEQxwEQowI6DgguEIAEELEDEMcBENEDOgsILhCxAxDHARCjAjoICC4QsQMQgwE6CwguEIAEELEDEIMBOhEILhCABBCxAxCDARDHARDRAzoLCAAQgAQQsQMQyQM6CggAELEDEIMBEApQlQhYvBFgtxJoAXAAeACAAVqIAawGkgECMTGYAQCgAQGwAQo&sclient=gws-wiz",
              isAsync: true,
            },
          ],
          key: "Enter",
          modifiers: 0,
        },
        committed: true,
        title: "Press Enter",
      },
    ],
  },
  {
    actions: [
      {
        pageAlias: "page",
        isMainFrame: true,
        frameUrl:
          "https://www.google.com/search?q=hello+world&source=hp&ei=1fIDYvyEG_-uptQPrLSEmAQ&iflsig=AHkkrS4AAAAAYgQA5eT8f1OHn_SvvMjxkKLVQV0-YGXt&ved=0ahUKEwi8w-WAjPP1AhV_l4kEHSwaAUMQ4dUDCAo&uact=5&oq=hello+world&gs_lcp=Cgdnd3Mtd2l6EAMyCAgAEIAEELEDMgsIABCABBCxAxCDATIICC4QgAQQsQMyBQguEIAEMgsIABCABBCxAxCDATIICAAQgAQQsQMyCAgAEIAEELEDMgUIABCABDIICAAQgAQQsQMyCAgAEIAEELEDOg4IABCPARDqAhCMAxDlAjoOCC4QjwEQ6gIQjAMQ5QI6DgguEIAEELEDEMcBEKMCOgsILhCABBDHARCvAToRCC4QgAQQsQMQgwEQxwEQowI6DgguEIAEELEDEMcBENEDOgsILhCxAxDHARCjAjoICC4QsQMQgwE6CwguEIAEELEDEIMBOhEILhCABBCxAxCDARDHARDRAzoLCAAQgAQQsQMQyQM6CggAELEDEIMBEApQlQhYvBFgtxJoAXAAeACAAVqIAawGkgECMTGYAQCgAQGwAQo&sclient=gws-wiz",
        action: {
          name: "click",
          selector: 'text=/.*"Hello, World!" program - Wikipedia.*/',
          signals: [
            {
              name: "navigation",
              url: "https://en.wikipedia.org/wiki/%22Hello,_World!%22_program",
            },
          ],
          button: "left",
          modifiers: 0,
          clickCount: 1,
        },
        committed: true,
        title: 'Click text=/.*"Hello, World!" program - Wikipedia.*/',
      },
    ],
  },
  {
    actions: [
      {
        pageAlias: "page",
        isMainFrame: true,
        frameUrl: "https://en.wikipedia.org/wiki/%22Hello,_World!%22_program",
        action: {
          name: "click",
          selector: 'li:has-text("Main page")',
          signals: [],
          button: "left",
          modifiers: 0,
          clickCount: 1,
        },
        committed: true,
        title: 'Click li:has-text("Main page")',
      },
    ],
  },
  {
    actions: [
      {
        pageAlias: "page",
        isMainFrame: true,
        frameUrl: "https://en.wikipedia.org/wiki/%22Hello,_World!%22_program",
        action: {
          name: "click",
          selector: "text=Main page",
          signals: [
            {
              name: "navigation",
              url: "https://en.wikipedia.org/wiki/Main_Page",
            },
          ],
          button: "left",
          modifiers: 0,
          clickCount: 1,
        },
        committed: true,
        title: "Click text=Main page",
      },
    ],
  },
  {
    actions: [
      {
        pageAlias: "page",
        isMainFrame: true,
        frameUrl: "https://en.wikipedia.org/wiki/Main_Page",
        action: {
          name: "click",
          selector: "text=Apollo 5",
          signals: [
            {
              name: "navigation",
              url: "https://en.wikipedia.org/wiki/Apollo_5",
            },
          ],
          button: "left",
          modifiers: 0,
          clickCount: 1,
        },
        committed: true,
        title: "Click text=Apollo 5",
      },
    ],
  },
  {
    actions: [
      {
        pageAlias: "page",
        isMainFrame: true,
        frameUrl: "https://en.wikipedia.org/wiki/Apollo_5",
        action: {
          name: "click",
          selector:
            "text=Apollo 5 (launched January 22, 1968), also known as AS-204, was the uncrewed fir >> a",
          signals: [
            {
              name: "navigation",
              url: "https://en.wikipedia.org/wiki/Apollo_Lunar_Module",
            },
          ],
          button: "left",
          modifiers: 0,
          clickCount: 1,
        },
        committed: true,
        title:
          "Click text=Apollo 5 (launched January 22, 1968), also known as AS-204, was the uncrewed fir >> a",
      },
    ],
  },
  {
    actions: [
      {
        pageAlias: "page",
        isMainFrame: true,
        frameUrl: "https://en.wikipedia.org/wiki/Lunar_lander",
        action: {
          name: "click",
          selector: 'a:has-text("spacecraft")',
          signals: [
            {
              name: "navigation",
              url: "https://en.wikipedia.org/wiki/Lander_(spacecraft)",
            },
          ],
          button: "left",
          modifiers: 0,
          clickCount: 1,
        },
        committed: true,
        title: 'Click a:has-text("spacecraft")',
      },
    ],
  },
  {
    actions: [
      {
        pageAlias: "page",
        isMainFrame: true,
        frameUrl: "https://en.wikipedia.org/wiki/Lander_(spacecraft)",
        action: {
          name: "click",
          selector: "text=hard landing",
          signals: [
            {
              name: "navigation",
              url: "https://en.wikipedia.org/wiki/Hard_landing",
            },
          ],
          button: "left",
          modifiers: 0,
          clickCount: 1,
        },
        committed: true,
        title: "Click text=hard landing",
      },
    ],
  },
  {
    actions: [
      {
        pageAlias: "page",
        isMainFrame: true,
        frameUrl: "https://en.wikipedia.org/wiki/Hard_landing",
        action: {
          name: "click",
          selector: "text=flight",
          signals: [
            {
              name: "navigation",
              url: "https://en.wikipedia.org/wiki/Flight",
            },
          ],
          button: "left",
          modifiers: 0,
          clickCount: 1,
        },
        committed: true,
        title: "Click text=flight",
      },
    ],
  },
  {
    actions: [
      {
        pageAlias: "page",
        isMainFrame: true,
        frameUrl: "https://en.wikipedia.org/wiki/Flight",
        action: {
          name: "click",
          selector: "text=planetary surface",
          signals: [
            {
              name: "navigation",
              url: "https://en.wikipedia.org/wiki/Planetary_surface",
            },
          ],
          button: "left",
          modifiers: 0,
          clickCount: 1,
        },
        title: "Click text=planetary surface",
      },
    ],
  },
];

export function useStepsContext(): IStepsContext {
  const [steps, setSteps] = useState<Steps>([]);
  const setStepName = useCallback((idx: number, name: string) => {
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
              name: initiatorStep.name,
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
