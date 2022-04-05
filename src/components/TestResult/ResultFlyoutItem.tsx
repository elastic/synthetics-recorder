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

import { EuiText } from '@elastic/eui';
import React from 'react';
import type { JourneyStep } from '../../common/types';
import { ResultBody } from './ResultBody';
import { ResultErrorBody } from './ResultErrorBody';
import { ResultTitle } from './ResultTitle';

export interface IResultFlyoutItem {
  code: string;
  step: JourneyStep;
  stepIndex: number;
}

export function ResultFlyoutItem({ code, step, stepIndex }: IResultFlyoutItem) {
  const { actionTitles, status, error, duration } = step;

  const durationElement = <EuiText size="s">{Math.round(duration / 1000)}s</EuiText>;

  return (
    <ResultTitle durationElement={durationElement} titleText={`Step ${stepIndex + 1}`}>
      {error ? (
        <ResultErrorBody
          actionTitles={actionTitles ?? []}
          code={code}
          errorMessage={error?.message}
          resultCategory={status}
          stepIndex={stepIndex}
          stepName={step.name}
        />
      ) : (
        <ResultBody actionTitles={actionTitles ?? []} resultCategory={status} />
      )}
    </ResultTitle>
  );
}
