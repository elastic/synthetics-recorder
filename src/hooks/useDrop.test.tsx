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

import React from 'react';
import { act, renderHook } from '@testing-library/react-hooks';
import { createSteps } from '../../common/helper/test/createAction';
import { TestContextWrapper } from '../helpers/test/render';
import { computeIsDroppable, useDrop } from './useDrop';

describe('useDrop', () => {
  describe(useDrop.name, () => {
    it('should update the isDragOver state when the dragIndex changes', () => {
      const steps = createSteps([['Step 1', 'Step 2'], ['Step 3'], ['Step 4', 'Step 5']]);
      const { result } = renderHook(() => useDrop(0, 0), {
        wrapper: ({
          children,
          dragIndex,
        }: {
          children?: React.ReactNode;
          dragIndex: number | undefined;
        }) => (
          <TestContextWrapper
            component={children}
            contextOverrides={{
              dragAndDrop: {
                dragIndex,
              },
              steps: {
                steps,
              },
            }}
          />
        ),
        initialProps: { dragIndex: undefined },
      });

      expect(result.current.isDragOver).toBe(false);
    });

    it('calls `onSplitStep`', async () => {
      const steps = createSteps([['Step 1', 'Step 2'], ['Step 3'], ['Step 4', 'Step 5']]);
      const onSplitStep = jest.fn();
      const { rerender, result } = renderHook(() => useDrop(0, 0), {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <TestContextWrapper
            component={children}
            contextOverrides={{
              steps: {
                steps,
                onSplitStep,
              },
            }}
          />
        ),
      });

      act(() => result.current.splitStepAtAction());

      rerender();

      expect(onSplitStep).toHaveBeenCalled();
    });
  });

  describe(computeIsDroppable.name, () => {
    it(`is not droppable if there is no action in front or behind`, () => {
      expect(computeIsDroppable(0, 0, createSteps([['action-1'], ['action-2']]))).toBe(false);
    });

    it(`is not droppable if the targeted action is the final item in the step`, () => {
      expect(
        computeIsDroppable(0, 3, createSteps([['action-1', 'action-2', 'action-3', 'action-4']]))
      ).toBe(false);
    });

    it('is droppable if there is an action behind', () => {
      expect(
        computeIsDroppable(0, 2, createSteps([['action-1', 'action-2', 'action-3', 'action-4']]))
      ).toBe(true);
    });

    it('is not droppable if the dragged step is more than one step away', () => {
      expect(
        computeIsDroppable(
          0,
          0,
          createSteps([
            ['a0', 'a1', 'a2'],
            ['a3', 'a4', 'a5'],
            ['a6', 'a7'],
          ]),
          2
        )
      ).toBe(false);
    });
  });
});
