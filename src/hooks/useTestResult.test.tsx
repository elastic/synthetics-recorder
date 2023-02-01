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
import { renderHook } from '@testing-library/react-hooks';
import { useStepResultStatus } from './useTestResult';
import { TestContextWrapper } from '../helpers/test/render';

describe('useStepResultStatus', () => {
  const wrapper = ({ children }: { children?: React.ReactNode }) => {
    return (
      <TestContextWrapper
        component={children}
        contextOverrides={{
          test: {
            result: {
              failed: 1,
              skipped: 1,
              succeeded: 1,
              journey: {
                status: 'failed',
                type: 'inline',
                steps: [
                  { duration: 10, name: 'Step 1', status: 'succeeded' },
                  { duration: 10, name: 'Step 2', status: 'failed' },
                  { duration: 10, name: 'Step 3', status: 'skipped' },
                ],
              },
            },
          },
        }}
      />
    );
    // return <TestContext.Provider value={testContext}>{children}</TestContext.Provider>;
  };

  it('should return undefined if result is not available', () => {
    const { result } = renderHook(() => useStepResultStatus(), { wrapper });
    expect(result.current).toBeUndefined();
  });

  it('should return the status of a step if step name is provided', () => {
    const { result } = renderHook(() => useStepResultStatus(undefined, 'Step 1'), { wrapper });
    expect(result.current).toBe('succeeded');
  });

  it('should return the status of a step if step title is provided', () => {
    const { result } = renderHook(() => useStepResultStatus('Step 2'), { wrapper });
    expect(result.current).toBe('failed');
  });

  it('should return undefined if the step name and title are not found', () => {
    const { result } = renderHook(() => useStepResultStatus('Step 4'), { wrapper });
    expect(result.current).toBeUndefined();
  });

  it('should return undefined if result is undefined', () => {
    const { result } = renderHook(() => useStepResultStatus('Step 4'), {
      wrapper: ({ children }) => <TestContextWrapper component={children} />,
    });
    expect(result.current).toBe(undefined);
  });
});
