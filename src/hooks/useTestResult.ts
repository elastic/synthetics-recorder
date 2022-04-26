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

import { useContext, useEffect, useState } from 'react';
import { ResultCategory } from '../common/types';
import { TestContext } from '../contexts/TestContext';

/**
 * Today test results are limited to the resolution of step-level.
 *
 * As such, we can simply check a step's status and apply that to its
 * constitutent actions.
 * @param stepTitle The default step title, the title of the first action
 * @param stepName The name of the step
 * @returns The status of the step, if available
 */
export function useStepResultStatus(
  stepTitle?: string,
  stepName?: string
): ResultCategory | undefined {
  const { result } = useContext(TestContext);
  const [statuses, setStatuses] = useState<Record<string, ResultCategory>>({});

  useEffect(() => {
    if (!result) {
      setStatuses({});
    } else {
      // make a map with key:stepname, val:status
      setStatuses(
        result.journey.steps.reduce((prev, { name, status }) => {
          return { ...prev, [name]: status };
        }, {})
      );
    }
  }, [result, setStatuses]);

  if (stepName && statuses[stepName]) return statuses[stepName];
  if (!stepTitle || !statuses[stepTitle]) return undefined;

  return statuses[stepTitle];
}
