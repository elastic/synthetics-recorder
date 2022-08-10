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

// import type { Step, Steps } from '@elastic/synthetics';

import { actionTitle } from '../common/shared';
import { ActionContext, RecorderSteps, Step, Steps } from '../../common/types';

/**
 * Creates an intermediate representation of the steps Playwright has recorded from
 * user interaction. Each step contains a list of actions to nest in the corresponding
 * test function, and a set of metadata such as `name`.
 * @param steps The steps to format into the custom IR
 * @returns Formatted steps
 */
export function generateIR(steps: Steps): Steps {
  const result: Steps = [];
  const actions: ActionContext[] = [];
  for (const step of steps) {
    for (const actionContext of step.actions) {
      const { action, title } = actionContext;
      // Add title to all actionContexts
      actions.push(title ? actionContext : { ...actionContext, title: actionTitle(action) });
    }
    if (actions.length > 0) {
      result.push({ actions, name: step.name });
    }
  }

  return result;
}

const getActionCount = (prev: number, cur: Step) => prev + cur.actions.length;

function isOpenOrCloseAction(name: string, pageAlias: string) {
  return (name === 'closePage' && pageAlias === 'page') || name === 'openPage';
}

/**
 * Works by taking the actions from the PW recorder and
 * the actions generated/modified by the UI and merges them
 * to display the correct modified actions on the UI
 */
export function generateMergedIR(prevSteps: RecorderSteps, pwInput: Steps): RecorderSteps {
  const nextSteps: Steps = pwInput.map(step => ({
    ...step,
    actions: step.actions.filter(
      ({ action: { name }, frame: { pageAlias } }) => !isOpenOrCloseAction(name, pageAlias)
    ),
  }));
  const prevLength = prevSteps.reduce(getActionCount, 0);
  const nextLength = nextSteps.reduce(getActionCount, 0);
  /**
   * when recorder is started/reset
   */
  if (prevLength === 0 || nextLength === 0) {
    return nextSteps;
  }

  const mergedSteps: RecorderSteps = [];
  let pwActionCount = 0;
  for (const step of prevSteps) {
    const actions: ActionContext[] = [];
    for (const action of step.actions) {
      if (action.action.name === 'assert') {
        /**
         * Keep adding all the assertions added by user as PW
         * does not have any assertion built in
         * We treat the UI as the source of truth
         */
        actions.push(action);
      } else {
        /**
         * If actions are not assert commands, then we need to
         * check if the actions are modified on the UI and add
         * them to the final list
         *
         * Any modified state in the UI is the final state
         */
        const item = action?.modified ? action : nextSteps[0].actions[pwActionCount];
        actions.push(item);
        pwActionCount++;
      }
    }
    mergedSteps.push({ actions });
  }
  /**
   * Append any new Playwright actions to the final step
   */
  const lastStep = mergedSteps[mergedSteps.length - 1];
  nextSteps[0].actions
    .filter((_, index) => index >= pwActionCount)
    .map(action => lastStep.actions.push(action));
  return mergedSteps;
}
