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

import { IpcRendererEvent } from 'electron';
import { useCallback, useContext, useEffect, useReducer, useState } from 'react';
import { getCodeFromActions, getCodeForFailedResult } from '../common/shared';
import { CommunicationContext } from '../contexts/CommunicationContext';
import type { RecorderSteps, Result, TestEvent } from '../../common/types';
import type { ITestContext } from '../contexts/TestContext';
import { resultReducer } from '../helpers/resultReducer';

export function useSyntheticsTest(steps: RecorderSteps): ITestContext {
  const [result, dispatch] = useReducer(resultReducer, undefined);
  const [isResultFlyoutVisible, setIsResultFlyoutVisible] = useState(false);
  const [codeBlocks, setCodeBlocks] = useState('');
  const [isTestInProgress, setIsTestInProgress] = useState(false);
  const { ipc } = useContext(CommunicationContext);

  const setResult = useCallback((data: Result | undefined) => {
    dispatch({
      event: 'override',
      data,
    });
  }, []);

  /**
   * The absence of steps with a truthy result indicates the result value
   * is stale, and should be destroyed.
   */
  useEffect(() => {
    if (steps.length === 0 && result) {
      setResult(undefined);
    }
  }, [steps.length, result, setResult]);

  const onTest = useCallback(
    async function () {
      const code = await getCodeFromActions(ipc, steps, 'inline');
      if (!isTestInProgress) {
        // destroy stale state
        dispatch({ data: undefined, event: 'override' });
        const onTestEvent = (_event: IpcRendererEvent, data: TestEvent) => {
          dispatch(data);
        };

        ipc.on('test-event', onTestEvent);

        try {
          const promise = ipc.callMain('run-journey', {
            steps,
            code,
            isProject: false,
          });
          setIsTestInProgress(true);
          setIsResultFlyoutVisible(true);
          await promise;
        } catch (e: unknown) {
          // eslint-disable-next-line no-console
          console.error(e);
        } finally {
          ipc.removeListener('test-event', onTestEvent);
          setIsTestInProgress(false);
        }
      }
    },
    [ipc, isTestInProgress, steps]
  );

  useEffect(() => {
    if (result?.journey.status === 'failed') {
      getCodeForFailedResult(ipc, steps, result?.journey).then(code => setCodeBlocks(code));
    }
  }, [ipc, result?.journey, steps]);

  return {
    codeBlocks,
    isResultFlyoutVisible,
    isTestInProgress,
    result,
    onTest,
    setCodeBlocks,
    setIsResultFlyoutVisible,
    setIsTestInProgress,
    setResult,
  };
}
