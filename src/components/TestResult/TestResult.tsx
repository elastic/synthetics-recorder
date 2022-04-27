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

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { EuiFlyout, EuiFlyoutBody } from '@elastic/eui';
import { StepsContext } from '../../contexts/StepsContext';
import type { JourneyStep, Result } from '../../../common/types';
import { TestContext } from '../../contexts/TestContext';
import { getCodeFromActions } from '../../common/shared';
import { ResultFlyoutItem } from './ResultFlyoutItem';
import { TestResultFlyoutHeader } from './TestResultFlyoutHeader';
import { CommunicationContext } from '../../contexts/CommunicationContext';

const FLYOUT_TITLE = 'result-flyout-title';

export function TestResult() {
  const { steps } = useContext(StepsContext);
  const { isResultFlyoutVisible, result, setResult, setIsResultFlyoutVisible } =
    useContext(TestContext);
  const { ipc } = useContext(CommunicationContext);
  const [stepCodeToDisplay, setStepCodeToDisplay] = useState('');

  /**
   * This effect will fetch the code for the failed step in the most recent result,
   * if there is a failure.
   */
  useEffect(() => {
    async function fetchCodeForFailure(r: Result) {
      const failedCode = await getCodeFromActions(
        ipc,
        // index of failed step will equal number of successful items
        [steps[r.succeeded]],
        'inline'
      );
      setStepCodeToDisplay(failedCode);
    }

    // skip procedure when there are no failed steps
    if (steps.length && result?.failed) {
      fetchCodeForFailure(result);
    }
  }, [ipc, result, setResult, steps]);

  const maxLineLength = useMemo(
    () => stepCodeToDisplay.split('\n').reduce((prev, cur) => Math.max(prev, cur.length), 0),
    [stepCodeToDisplay]
  );

  // flyout should not show without result data
  if (!isResultFlyoutVisible || !result) return null;

  // flyout should not show if there are no results
  const total = result.succeeded + result.skipped + result.failed;

  if (total === 0) return null;

  return (
    <EuiFlyout
      aria-labelledby={FLYOUT_TITLE}
      onClose={() => setIsResultFlyoutVisible(false)}
      size={result.failed === 0 ? 's' : maxLineLength > 60 ? 'l' : 'm'}
    >
      <TestResultFlyoutHeader id={FLYOUT_TITLE} title="Journey Test Result" />
      <EuiFlyoutBody>
        {result.journey.steps.map((step: JourneyStep, stepIndex: number) => (
          <ResultFlyoutItem
            code={stepCodeToDisplay}
            key={`result-step-${stepIndex}`}
            step={step}
            stepIndex={stepIndex}
          />
        ))}
      </EuiFlyoutBody>
    </EuiFlyout>
  );
}
