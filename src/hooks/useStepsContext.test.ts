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
import type { ActionInContext, Step, Steps } from '@elastic/synthetics';
import { act, renderHook, RenderHookResult } from '@testing-library/react-hooks';
import { IStepsContext } from '../contexts/StepsContext';
import { useStepsContext } from './useStepsContext';

function createAction(name: string, overrides?: Partial<ActionInContext>): ActionInContext {
  return {
    action: {
      name,
      signals: [],
    },
    frameUrl: 'https://www.elastic.co',
    isMainFrame: true,
    pageAlias: 'pageAlias',
    ...(overrides ?? {}),
  };
}

describe('useStepsContext', () => {
  let defaultResult: RenderHookResult<unknown, IStepsContext>;
  let defaultSteps: Steps;

  beforeEach(async () => {
    defaultSteps = [
      { actions: [createAction('first-step-1')] },
      {
        actions: [createAction('first-step-2'), createAction('second-step-2')],
      },
    ];

    defaultResult = renderHook(() => useStepsContext());

    act(() => {
      defaultResult.result.current.setSteps(defaultSteps);
    });
  });

  describe('onStepDetailChange', () => {
    it('updates the targeted step', () => {
      const testStep: Step = { actions: [createAction('new-action')] };

      act(() => {
        defaultResult.result.current.onStepDetailChange(testStep, 1);
      });

      const { steps } = defaultResult.result.current;

      expect(steps[0].actions).toEqual(defaultSteps[0].actions);
      expect(steps[1]).toEqual(testStep);
      expect(steps).toHaveLength(2);
    });
  });

  describe('onDeleteAction', () => {
    it('deletes the targeted action', () => {
      act(() => {
        defaultResult.result.current.onDeleteAction(1, 1);
      });

      const { steps } = defaultResult.result.current;

      expect(steps).toHaveLength(2);
      expect(steps[0]).toEqual(defaultSteps[0]);
      expect(steps[1].actions).toHaveLength(1);
      expect(steps[1].actions[0]).toEqual(defaultSteps[1].actions[0]);
    });
  });

  describe('onDeleteStep', () => {
    it('deletes the targeted step', () => {
      act(() => {
        defaultResult.result.current.onDeleteStep(1);
      });

      const { steps } = defaultResult.result.current;

      expect(steps).toHaveLength(1);
      expect(steps[0]).toEqual(defaultSteps[0]);
    });
  });

  describe('onInsertAction', () => {
    it('adds the given action at the expected index', () => {
      const insertedAction = createAction('inserted-step');

      act(() => {
        defaultResult.result.current.onInsertAction(insertedAction, 1, 2);
      });

      const { steps } = defaultResult.result.current;

      expect(steps).toHaveLength(2);
      expect(steps[0]).toEqual(defaultSteps[0]);
      expect(steps[1].actions).toHaveLength(3);
      expect(steps[1].actions[2]).toEqual(insertedAction);
    });
  });

  describe('onUpdateAction', () => {
    it('updates the targeted action', () => {
      const updatedAction: ActionInContext = createAction('updated-action');

      act(() => {
        defaultResult.result.current.onUpdateAction(updatedAction, 0, 0);
      });

      const { steps } = defaultResult.result.current;

      expect(steps).toHaveLength(2);
      expect(steps[0].actions).toHaveLength(1);
      expect(steps[1].actions).toHaveLength(2);
      expect(steps[0].actions[0]).toEqual(updatedAction);
      expect(steps[1]).toEqual(defaultSteps[1]);
    });
  });

  describe('onMergeSteps', () => {
    const mergeSteps: Steps = [
      {
        actions: [createAction('first-step-1')],
      },
      {
        actions: [createAction('second-step-1')],
      },
      {
        actions: [createAction('third-step-1')],
      },
    ];

    it('merges two steps and inserts them at the first index', () => {
      const { result } = renderHook(() => useStepsContext());
      act(() => {
        result.current.setSteps(mergeSteps);
      });
      act(() => {
        result.current.onMergeSteps(0, 1);
      });
      const { steps } = result.current;
      expect(steps).toHaveLength(2);
      expect(steps[0]).toEqual({
        actions: [createAction('first-step-1'), createAction('second-step-1')],
      });
      expect(steps[1]).toEqual({
        actions: [
          {
            action: {
              name: 'third-step-1',
              signals: [],
            },
            frameUrl: 'https://www.elastic.co',
            isMainFrame: true,
            pageAlias: 'pageAlias',
          },
        ],
      });
    });
  });

  describe('onRearrangeSteps', () => {
    it('rearranges steps to correct indexes', () => {
      act(() => {
        defaultResult.result.current.onRearrangeSteps(0, 1);
      });

      const { steps } = defaultResult.result.current;

      expect(steps).toHaveLength(2);
      expect(steps[0].actions).toHaveLength(2);
      expect(steps[0].actions.map(({ action: { name } }) => name)).toEqual([
        'first-step-2',
        'second-step-2',
      ]);
      expect(steps[1].actions).toHaveLength(1);
      expect(steps[1].actions[0].action.name).toBe('first-step-1');
    });
  });

  describe('onSplitStep', () => {
    const splitSteps: Steps = [
      { actions: [createAction('first-step-1'), createAction('first-step-2')] },
      {
        actions: [
          createAction('second-step-1'),
          createAction('second-step-2'),
          createAction('second-step-3'),
          createAction('second-step-4'),
        ],
      },
      { actions: [createAction('third-step-1'), createAction('third-step-2')] },
    ];

    it('throws error when `actionIndex` is 0', () => {
      const result = renderHook(() => useStepsContext());
      expect(() => result.result.current.onSplitStep(0, 0)).toThrowError(
        'Cannot remove all actions from a step.'
      );
    });

    it('throws error when step has only one action', () => {
      const { result } = renderHook(() => useStepsContext());

      act(() => {
        result.current.setSteps([{ actions: [createAction('name')] }]);
      });

      expect(() => result.current.onSplitStep(0, 1)).toThrowError(
        'Cannot split step with only one action'
      );
    });

    it('splits the target step at the head of the list', () => {
      const result = renderHook(() => useStepsContext());

      act(() => {
        result.result.current.setSteps(splitSteps);
      });
      act(() => {
        result.result.current.onSplitStep(0, 1);
      });

      const { steps } = result.result.current;
      expect(steps).toHaveLength(4);
      expect(steps[0].actions).toEqual([createAction('first-step-1')]);
      expect(steps[1].actions).toEqual([createAction('first-step-2')]);
    });
    it('splits the target step at the tail of the list', () => {
      const result = renderHook(() => useStepsContext());

      act(() => {
        result.result.current.setSteps(splitSteps);
      });
      act(() => {
        result.result.current.onSplitStep(2, 1);
      });

      const { steps } = result.result.current;
      expect(steps).toHaveLength(4);
      expect(steps[2].actions).toEqual([createAction('third-step-1')]);
      expect(steps[3].actions).toEqual([createAction('third-step-2')]);
    });

    it('throws an error if the step index is greater than the steps list length', () => {
      const result = renderHook(() => useStepsContext());

      act(() => {
        result.result.current.setSteps(splitSteps);
      });
      act(() => {
        expect(() => result.result.current.onSplitStep(23, 1)).toThrowError(
          'Step index cannot exceed steps length.'
        );
      });
    });

    it('splits the target step into two separate steps', () => {
      const result = renderHook(() => useStepsContext());

      act(() => {
        result.result.current.setSteps(splitSteps);
      });
      act(() => {
        result.result.current.onSplitStep(1, 2);
      });
      const { steps } = result.result.current;
      expect(steps).toHaveLength(4);
      expect(steps[0].actions).toEqual([
        createAction('first-step-1'),
        createAction('first-step-2'),
      ]);
      expect(steps[1].actions).toEqual([
        createAction('second-step-1'),
        createAction('second-step-2'),
      ]);
      expect(steps[2].actions).toEqual([
        createAction('second-step-3'),
        createAction('second-step-4'),
      ]);
      expect(steps[3].actions).toEqual([
        createAction('third-step-1'),
        createAction('third-step-2'),
      ]);
    });
  });
});
