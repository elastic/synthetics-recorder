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

import type { Action /* , Steps */ } from '@elastic/synthetics';
import { RendererProcessIpc } from 'electron-better-ipc';
import React from 'react';
import type { ActionContext, Journey, JourneyType, Steps } from '../../common/types';

export const COMMAND_SELECTOR_OPTIONS = [
  {
    value: 'innerText',
    text: 'Inner Text',
  },
  {
    value: 'textContent',
    text: 'Text content',
  },
  {
    value: 'isHidden',
    text: 'Check Hidden',
  },
  {
    value: 'isVisible',
    text: 'Check Visibility',
  },
  {
    value: 'isChecked',
    text: 'Is Checked',
  },
  {
    value: 'isDisabled',
    text: 'Is Disabled',
  },
  {
    value: 'isEditable',
    text: 'Is Editable',
  },
  {
    value: 'isEnabled',
    text: 'Is Enabled',
  },
];

export const SYNTHETICS_DISCUSS_FORUM_URL = 'https://forms.gle/PzVtYoExfqQ9UMkY6';

export const DRAG_AND_DROP_DATA_TRANSFER_TYPE =
  'application/co.elastic.synthetics-recorder.step-drag';

export const PLAYWRIGHT_ASSERTION_DOCS_LINK = 'https://playwright.dev/docs/assertions/';

export const SMALL_SCREEN_BREAKPOINT = 850;

export async function getCodeFromActions(
  ipc: RendererProcessIpc,
  steps: Steps,
  type: JourneyType
): Promise<string> {
  return await ipc.callMain('actions-to-code', {
    actions: steps.map(({ actions, ...rest }) => ({
      ...rest,
      actions: actions.filter(action => !(action as ActionContext)?.isSoftDeleted),
    })),
    isProject: type === 'project',
  });
}

export function createExternalLinkHandler(
  ipc: RendererProcessIpc,
  url: string
): React.MouseEventHandler<HTMLAnchorElement> {
  return async e => {
    e.preventDefault();
    await ipc.callMain('link-to-external', url);
  };
}

/**
 * Gets code string for failed step in result object.
 * @param steps steps to analyze
 * @param journey journey result data
 * @returns code string
 */
export async function getCodeForFailedResult(
  ipc: RendererProcessIpc,
  steps: Steps,
  journey?: Journey
): Promise<string> {
  if (!journey) return '';

  const failedJourneyStep = journey.steps.find(({ status }) => status === 'failed');

  if (!failedJourneyStep) return '';

  const failedStep = steps.find(
    step => step.actions.length > 0 && step.actions[0].title === failedJourneyStep.name
  );

  if (!failedStep) return '';

  return getCodeFromActions(ipc, [failedStep], journey.type);
}

export function actionTitle(action: Action) {
  switch (action.name) {
    case 'openPage':
      return `Open new page`;
    case 'closePage':
      return `Close page`;
    case 'check':
      return `Check ${action.selector}`;
    case 'uncheck':
      return `Uncheck ${action.selector}`;
    case 'click': {
      if (action.clickCount === 1) return `Click ${action.selector}`;
      if (action.clickCount === 2) return `Double click ${action.selector}`;
      if (action.clickCount === 3) return `Triple click ${action.selector}`;
      return `${action.clickCount}× click`;
    }
    case 'fill':
      return `Fill ${action.selector}`;
    case 'setInputFiles':
      if (action.files?.length === 0) return `Clear selected files`;
      else return `Upload ${action.files?.join(', ')}`;
    case 'navigate':
      return `Go to ${action.url}`;
    case 'press':
      return `Press ${action.key}` + (action.modifiers ? ' with modifiers' : '');
    case 'select':
      return `Select ${action.options?.join(', ')}`;
    case 'assert':
      return `Assert`;
  }
}
