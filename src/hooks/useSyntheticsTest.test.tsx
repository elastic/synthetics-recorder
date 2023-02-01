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

/**
 * These tests can be improved with the implementation for some tests to the
 * `onTest` callback this hook returns. It is complicated to test using mocks
 * because it relies on waiting for events in the backend to complete, and
 * performs several state updates during the callback, such as setting the
 * `isTestInProgress` flag to on and back to off again.
 *
 * Unit-level tests for this functionality aren't strictly necessary, as it
 * is one of the key things covered in our e2e tests.
 */

import React from 'react';
import { act, renderHook } from '@testing-library/react-hooks';
import { RendererProcessIpc } from 'electron-better-ipc';
import { getMockIpc } from '../helpers/test/ipc';
import { TestContextWrapper } from '../helpers/test/render';
import { useSyntheticsTest } from './useSyntheticsTest';
import { RecorderSteps, Result } from '../../common/types';
import { createSteps } from '../../common/helper/test/createAction';
import * as communicationHelpers from '../common/shared';

describe('useSyntheticsTest', () => {
  let ipc: RendererProcessIpc;

  beforeEach(() => {
    ipc = getMockIpc();
  });

  const wrapper = ({ children }: { children?: React.ReactNode }) => (
    <TestContextWrapper component={children} contextOverrides={{ communication: { ipc } }} />
  );

  it('should initiailize the test context with the correct state', () => {
    const { result } = renderHook(() => useSyntheticsTest([]), {
      wrapper,
    });
    const context = result.current;
    expect(context.codeBlocks).toBe('');
    expect(context.isResultFlyoutVisible).toBe(false);
    expect(context.isTestInProgress).toBe(false);
  });

  it(`can use \`setResult\` to update the hook's state when there are > 0 steps`, () => {
    const resultMock: Result = {
      failed: 0,
      skipped: 0,
      succeeded: 1,
      journey: {
        status: 'succeeded',
        steps: [
          {
            duration: 1203,
            name: 'first',
            status: 'succeeded',
          },
        ],
        type: 'inline',
      },
    };
    const response = renderHook(() => useSyntheticsTest(createSteps([['step 1']])), {
      wrapper,
    });
    const { setResult } = response.result.current;
    act(() => setResult(resultMock));
    response.rerender();
    expect(response.result.current.result).toEqual(resultMock);
  });

  it('will set result to `undefined` if there are no steps', () => {
    const resultMock: Result = {
      failed: 0,
      skipped: 0,
      succeeded: 1,
      journey: {
        status: 'succeeded',
        steps: [
          {
            duration: 1203,
            name: 'first',
            status: 'succeeded',
          },
        ],
        type: 'inline',
      },
    };
    const response = renderHook((steps: RecorderSteps) => useSyntheticsTest(steps), {
      initialProps: createSteps([['step1']]),
      wrapper,
    });
    const { setResult } = response.result.current;
    act(() => setResult(resultMock));
    response.rerender([]);
    expect(response.result.current.result).toEqual(undefined);
  });

  it('will return the rendered code for a failed step in the result', async () => {
    const mockCodeBlocks = `import lib from 'lib';`;
    const getCodeSpy = jest.spyOn(communicationHelpers, 'getCodeForFailedResult');
    getCodeSpy.mockImplementation(async () => mockCodeBlocks);

    const resultMock: Result = {
      failed: 0,
      skipped: 0,
      succeeded: 1,
      journey: {
        status: 'failed',
        steps: [
          {
            duration: 1203,
            name: 'first',
            status: 'failed',
          },
        ],
        type: 'inline',
      },
    };
    const initialProps = createSteps([['step1']]);
    const response = renderHook((steps: RecorderSteps) => useSyntheticsTest(steps), {
      initialProps,
      wrapper,
    });
    const { setResult } = response.result.current;
    act(() => setResult(resultMock));

    response.rerender(initialProps);

    await response.waitForNextUpdate();

    expect(response.result.current.codeBlocks).toBe(mockCodeBlocks);
  });
});
