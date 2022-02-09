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

import { useState } from "react";
import type { ActionContext, Step, Steps } from "../common/types";
import type { IStepsContext } from "../contexts/StepsContext";

const stepString: Steps = [
  [
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
  ],
  [
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
  [
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
  [
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
  [
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
  [
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
  [
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
  [
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
  [
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
  [
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
  [
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
  [
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
  [
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
];

export function useStepsContext(): IStepsContext {
  const [steps, setSteps] = useState<Steps>(stepString);
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

          step.splice(indexToDelete, 1);

          return [...step];
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

          step.splice(indexToInsert, 0, action);

          return [...step];
        })
      );
    },
    onMergeSteps: (indexToInsert, indexToRemove) => {
      setSteps(oldSteps => {
        oldSteps[indexToInsert] = [
          ...steps[indexToInsert],
          ...steps[indexToRemove],
        ];
        oldSteps.splice(indexToRemove, 1);
        return oldSteps;
      });
    },
    onRearrangeSteps: (indexA, indexB) => {
      setSteps(oldSteps => {
        const placeholder = [...steps[indexA]];
        oldSteps[indexA] = oldSteps[indexB];
        oldSteps[indexB] = placeholder;
        return oldSteps;
      });
    },
    onSplitStep: (stepIndex, actionIndex) => {
      if (actionIndex === 0)
        throw Error(
          `Split procedure received action index ${actionIndex}. Cannot remove all actions from a step.`
        );
      const stepToSplit = steps[stepIndex];
      if (stepToSplit.length <= 1) {
        throw Error("Cannot split step with only one action.");
      }
      const reducedStep = stepToSplit.slice(0, actionIndex);
      const insertedStep = stepToSplit.slice(actionIndex);

      let tail: Steps = [];
      if (steps.length > stepIndex + 1) {
        tail = steps.slice(stepIndex + 1, steps.length);
      }
      setSteps([
        ...steps.slice(0, stepIndex),
        reducedStep,
        insertedStep,
        ...tail,
      ]);
    },
    onStepDetailChange,
    onUpdateAction: (
      action: ActionContext,
      stepIndex: number,
      actionIndex: number
    ) => {
      const step = steps[stepIndex];
      onStepDetailChange(
        [
          ...step.slice(0, actionIndex),
          action,
          ...step.slice(actionIndex + 1, step.length),
        ],
        stepIndex
      );
    },
  };
}
