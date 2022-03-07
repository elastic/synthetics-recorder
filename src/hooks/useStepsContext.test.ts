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
import { ActionInContext } from "@elastic/synthetics";
import {
  act,
  renderHook,
  RenderHookResult,
} from "@testing-library/react-hooks";
import type { ActionContext, Step, Steps } from "../common/types";
import { IStepsContext } from "../contexts/StepsContext";
import { useStepsContext } from "./useStepsContext";

// copied from upstream branch, do not merge this but delete and reference
// original function after rebasing
function createAction(
  name: string,
  overrides?: Partial<ActionInContext>
): ActionInContext {
  return {
    action: {
      name,
      signals: [],
    },
    frameUrl: "https://www.elastic.co",
    isMainFrame: true,
    pageAlias: "pageAlias",
    ...(overrides ?? {}),
  };
}

describe("useStepsContext", () => {
  let defaultResult: RenderHookResult<unknown, IStepsContext>;
  let defaultSteps: Steps;

  beforeEach(async () => {
    defaultSteps = [
      [
        {
          action: {
            name: "first-step-1",
            signals: [],
          },
          frameUrl: "https://www.elastic.co",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
      ],
      [
        {
          action: {
            name: "first-step-2",
            signals: [],
          },
          frameUrl: "https://www.elastic.co",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
        {
          action: {
            name: "second-step-2",
            signals: [],
          },
          frameUrl: "https://www.elastic.co",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
      ],
    ];

    defaultResult = renderHook(() => useStepsContext());

    act(() => {
      defaultResult.result.current.setSteps(defaultSteps);
    });
  });

  describe("onStepDetailChange", () => {
    it("updates the targeted step", () => {
      const testStep: Step = [
        {
          action: { name: "new-action", signals: [] },
          frameUrl: "https://www.wikipedia.org",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
      ];

      act(() => {
        defaultResult.result.current.onStepDetailChange(testStep, 1);
      });

      const { steps } = defaultResult.result.current;

      expect(steps[0]).toEqual(defaultSteps[0]);
      expect(steps[1]).toEqual(testStep);
      expect(steps).toHaveLength(2);
    });
  });

  describe("onDeleteAction", () => {
    it("deletes the targeted action", () => {
      act(() => {
        defaultResult.result.current.onDeleteAction(1, 1);
      });

      const { steps } = defaultResult.result.current;

      expect(steps).toHaveLength(2);
      expect(steps[0]).toEqual(defaultSteps[0]);
      expect(steps[1]).toHaveLength(1);
      expect(steps[1][0]).toEqual(defaultSteps[1][0]);
    });
  });

  describe("onDeleteStep", () => {
    it("deletes the targeted step", () => {
      act(() => {
        defaultResult.result.current.onDeleteStep(1);
      });

      const { steps } = defaultResult.result.current;

      expect(steps).toHaveLength(1);
      expect(steps[0]).toEqual(defaultSteps[0]);
    });
  });

  describe("onInsertAction", () => {
    it("adds the given action at the expected index", () => {
      const insertedAction = {
        action: {
          name: "inserted-step",
          signals: [{ "test-signal": true }],
        },
        frameUrl: "https://www.elastic.co",
        isMainFrame: false,
        pageAlias: "page-alias-string",
      };

      act(() => {
        defaultResult.result.current.onInsertAction(insertedAction, 1, 2);
      });

      const { steps } = defaultResult.result.current;

      expect(steps).toHaveLength(2);
      expect(steps[0]).toEqual(defaultSteps[0]);
      expect(steps[1]).toHaveLength(3);
      expect(steps[1][2]).toEqual(insertedAction);
    });
  });

  describe("onUpdateAction", () => {
    it("updates the targeted action", () => {
      const updatedAction: ActionContext = {
        action: {
          isAssert: true,
          name: "updated-action",
          signals: [],
        },
        frameUrl: "https://www.elastic.co",
        isMainFrame: true,
        pageAlias: "pageAlias",
      };

      act(() => {
        defaultResult.result.current.onUpdateAction(updatedAction, 0, 0);
      });

      const { steps } = defaultResult.result.current;

      expect(steps).toHaveLength(2);
      expect(steps[0]).toHaveLength(1);
      expect(steps[1]).toHaveLength(2);
      expect(steps[0][0]).toEqual(updatedAction);
      expect(steps[1]).toEqual(defaultSteps[1]);
    });
  });

  describe("onMergeSteps", () => {
    const mergeSteps = [
      [
        {
          action: {
            name: "first-step-1",
            signals: [],
          },
          frameUrl: "https://www.elastic.co",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
      ],
      [
        {
          action: {
            name: "second-step-1",
            signals: [],
          },
          frameUrl: "https://www.elastic.co",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
      ],
      [
        {
          action: {
            name: "third-step-1",
            signals: [],
          },
          frameUrl: "https://www.elastic.co",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
      ],
    ];

    it("merges two steps and inserts them at the first index", () => {
      const { result } = renderHook(() => useStepsContext());
      act(() => {
        result.current.setSteps(mergeSteps);
      });
      act(() => {
        result.current.onMergeSteps(0, 1);
      });
      const { steps } = result.current;
      expect(steps).toHaveLength(2);
      expect(steps[0]).toEqual([
        {
          action: {
            name: "first-step-1",
            signals: [],
          },
          frameUrl: "https://www.elastic.co",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
        {
          action: {
            name: "second-step-1",
            signals: [],
          },
          frameUrl: "https://www.elastic.co",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
      ]);
      expect(steps[1]).toEqual([
        {
          action: {
            name: "third-step-1",
            signals: [],
          },
          frameUrl: "https://www.elastic.co",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
      ]);
    });
  });

  describe("onRearrangeSteps", () => {
    it("rearranges steps to correct indexes", () => {
      act(() => {
        defaultResult.result.current.onRearrangeSteps(0, 1);
      });

      const { steps } = defaultResult.result.current;

      expect(steps).toHaveLength(2);
      expect(steps[0]).toHaveLength(2);
      expect(steps[0].map(({ action: { name } }) => name)).toEqual([
        "first-step-2",
        "second-step-2",
      ]);
      expect(steps[1]).toHaveLength(1);
      expect(steps[1][0].action.name).toBe("first-step-1");
    });
  });

  describe("onDropStep", () => {
    let dropSteps: Steps;

    beforeEach(() => {
      dropSteps = [
        [
          createAction("step-0-action-0"),
          createAction("step-0-action-1"),
          createAction("step-0-action-2"),
        ],
        [
          createAction("step-1-action-0"),
          createAction("step-1-action-1"),
          createAction("step-1-action-2"),
        ],
        [
          createAction("step-2-action-0"),
          createAction("step-2-action-1"),
          createAction("step-2-action-2"),
        ],
      ];
    });

    const mapActionName = (a: ActionContext, _: number) => a.action.name;

    it("throws an error if target index is less than 0", () => {
      expect(() =>
        defaultResult.result.current.onDropStep(-1, 0, 1)
      ).toThrowError();
    });

    it("throws an error if target index does not exist in the list", () => {
      expect(() =>
        defaultResult.result.current.onDropStep(50, 0, 1)
      ).toThrowError();
    });

    it("throws an error if the initiator index is less than or equal to 0", () => {
      expect(() =>
        defaultResult.result.current.onDropStep(0, 0, 3)
      ).toThrowError();
    });

    it("throws an error if the initiator index does not exist in the list", () => {
      expect(() =>
        defaultResult.result.current.onDropStep(0, 50, 2)
      ).toThrowError();
    });

    it("performs merge with previous step data", () => {
      act(() => {
        defaultResult.result.current.setSteps(dropSteps);
      });
      act(() => {
        defaultResult.result.current.onDropStep(0, 1, 1);
      });
      const { steps } = defaultResult.result.current;
      expect(steps[0]).toHaveLength(2);
      expect(steps[1]).toHaveLength(4);
      expect(steps[2]).toHaveLength(3);
      expect(steps[0].map(mapActionName)).toEqual([
        "step-0-action-0",
        "step-0-action-1",
      ]);
      expect(steps[1].map(mapActionName)).toEqual([
        "step-0-action-2",
        "step-1-action-0",
        "step-1-action-1",
        "step-1-action-2",
      ]);
    });

    it("performs merge with next step data", () => {
      act(() => {
        defaultResult.result.current.setSteps(dropSteps);
      });
      act(() => {
        defaultResult.result.current.onDropStep(2, 1, 0);
      });
      const { steps } = defaultResult.result.current;
      expect(steps[0]).toHaveLength(3);
      expect(steps[1]).toHaveLength(4);
      expect(steps[2]).toHaveLength(2);
      expect(steps[1].map(mapActionName)).toEqual([
        "step-1-action-0",
        "step-1-action-1",
        "step-1-action-2",
        "step-2-action-0",
      ]);
      expect(steps[2].map(mapActionName)).toEqual([
        "step-2-action-1",
        "step-2-action-2",
      ]);
    });

    it("performs a split when dragging step over itself", () => {
      act(() => {
        defaultResult.result.current.setSteps(dropSteps);
      });
      act(() => {
        defaultResult.result.current.onDropStep(1, 1, 0);
      });
      const { steps } = defaultResult.result.current;
      expect(steps[0]).toHaveLength(4);
      expect(steps[1]).toHaveLength(2);
      expect(steps[2]).toHaveLength(3);
      expect(steps[0].map(mapActionName)).toEqual([
        "step-0-action-0",
        "step-0-action-1",
        "step-0-action-2",
        "step-1-action-0",
      ]);
      expect(steps[1].map(mapActionName)).toEqual([
        "step-1-action-1",
        "step-1-action-2",
      ]);
    });
  });

  describe("onSplitStep", () => {
    const splitSteps = [
      [
        {
          action: {
            name: "first-step-1",
            signals: [],
          },
          frameUrl: "https://www.elastic.co",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
        {
          action: {
            name: "first-step-2",
            signals: [],
          },
          frameUrl: "https://www.elastic.co",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
      ],
      [
        {
          action: {
            name: "second-step-1",
            signals: [],
          },
          frameUrl: "https://www.elastic.co",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
        {
          action: {
            name: "second-step-2",
            signals: [],
          },
          frameUrl: "https://www.elastic.co",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
        {
          action: {
            name: "second-step-3",
            signals: [],
          },
          frameUrl: "Https://www.elastic.co",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
        {
          action: {
            name: "second-step-4",
            signals: [],
          },
          frameUrl: "Https://www.elastic.co",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
      ],
      [
        {
          action: {
            name: "third-step-1",
            signals: [],
          },
          frameUrl: "https://www.elastic.co",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
        {
          action: {
            name: "third-step-2",
            signals: [],
          },
          frameUrl: "https://www.elastic.co",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
      ],
    ];

    it("throws error when `actionIndex` is 0", () => {
      const result = renderHook(() => useStepsContext());
      expect(() => result.result.current.onSplitStep(0, 0)).toThrowError(
        "Split procedure received action index 0. Cannot remove all actions from a step"
      );
    });

    it("throws error when step has only one action", () => {
      const { result } = renderHook(() => useStepsContext());

      act(() => {
        result.current.setSteps([
          [
            {
              action: {
                name: "name",
                signals: [],
              },
              frameUrl: "https://www.elastic.co",
              isMainFrame: true,
              pageAlias: "pageAlias",
            },
          ],
        ]);
      });

      expect(() => result.current.onSplitStep(0, 1)).toThrowError(
        "Cannot split step with only one action"
      );
    });

    it("splits the target step at the head of the list", () => {
      const result = renderHook(() => useStepsContext());

      act(() => {
        result.result.current.setSteps(splitSteps);
      });
      act(() => {
        result.result.current.onSplitStep(0, 1);
      });

      const { steps } = result.result.current;
      expect(steps).toHaveLength(4);
      expect(steps[0]).toEqual([
        {
          action: {
            name: "first-step-1",
            signals: [],
          },
          frameUrl: "https://www.elastic.co",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
      ]);
      expect(steps[1]).toEqual([
        {
          action: {
            name: "first-step-2",
            signals: [],
          },
          frameUrl: "https://www.elastic.co",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
      ]);
    });
    it("splits the target step at the tail of the list", () => {
      const result = renderHook(() => useStepsContext());

      act(() => {
        result.result.current.setSteps(splitSteps);
      });
      act(() => {
        result.result.current.onSplitStep(2, 1);
      });

      const { steps } = result.result.current;
      expect(steps).toHaveLength(4);
      expect(steps[2]).toEqual([
        {
          action: {
            name: "third-step-1",
            signals: [],
          },
          frameUrl: "https://www.elastic.co",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
      ]);
      expect(steps[3]).toEqual([
        {
          action: {
            name: "third-step-2",
            signals: [],
          },
          frameUrl: "https://www.elastic.co",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
      ]);
    });
    it("splits the target step into two separate steps", () => {
      const result = renderHook(() => useStepsContext());

      act(() => {
        result.result.current.setSteps(splitSteps);
      });
      act(() => {
        result.result.current.onSplitStep(1, 2);
      });
      const { steps } = result.result.current;
      expect(steps).toHaveLength(4);
      expect(steps[0]).toEqual([
        {
          action: {
            name: "first-step-1",
            signals: [],
          },
          frameUrl: "https://www.elastic.co",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
        {
          action: {
            name: "first-step-2",
            signals: [],
          },
          frameUrl: "https://www.elastic.co",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
      ]);
      expect(steps[1]).toEqual([
        {
          action: {
            name: "second-step-1",
            signals: [],
          },
          frameUrl: "https://www.elastic.co",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
        {
          action: {
            name: "second-step-2",
            signals: [],
          },
          frameUrl: "https://www.elastic.co",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
      ]);
      expect(steps[2]).toEqual([
        {
          action: {
            name: "second-step-3",
            signals: [],
          },
          frameUrl: "Https://www.elastic.co",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
        {
          action: {
            name: "second-step-4",
            signals: [],
          },
          frameUrl: "Https://www.elastic.co",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
      ]);
      expect(steps[3]).toEqual([
        {
          action: {
            name: "third-step-1",
            signals: [],
          },
          frameUrl: "https://www.elastic.co",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
        {
          action: {
            name: "third-step-2",
            signals: [],
          },
          frameUrl: "https://www.elastic.co",
          isMainFrame: true,
          pageAlias: "pageAlias",
        },
      ]);
    });
  });
});
