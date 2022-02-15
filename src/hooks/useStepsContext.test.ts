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
import type { Step, Steps } from "../common/types";
import { IStepsContext } from "../contexts/StepsContext";
import { useStepsContext } from "./useStepsContext";

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
      [createAction("first-step-1")],
      [createAction("first-step-2"), createAction("second-step-2")],
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
      const insertedAction: ActionInContext = {
        action: {
          name: "inserted-step",
          signals: [{ name: "test-signal" }],
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
      const updatedAction: ActionInContext = {
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
});
