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

import { Action /* Step */ } from '@elastic/synthetics';
import { ActionContext, FrameDescription, RecorderSteps, Step } from '../../types';

type OptionalActionContext = Omit<ActionContext, 'action' | 'frame'>;
type ActionContextOverride = OptionalActionContext & {
  frame?: Partial<FrameDescription>;
  action?: Partial<Action>;
};
type CreateStepActionOverride = OptionalActionContext & {
  frame?: Partial<FrameDescription>;
  action: Partial<Action> & { name: string };
};

export const createAction = (name: string, overrides?: ActionContextOverride): ActionContext => {
  const baseAction = {
    frame: {
      url: 'https://www.elastic.co',
      isMainFrame: true,
      committed: true,
      pageAlias: 'page',
    },
  };
  return overrides
    ? {
        ...overrides,
        action: {
          name,
          signals: [],
          url: 'https://www.elastic.co',
          ...overrides.action,
        },
        frame: {
          ...baseAction.frame,
          ...overrides.frame,
        },
      }
    : {
        ...baseAction,
        action: {
          name,
          signals: [],
        },
      };
};

export const createStepWithOverrides = (
  actions: CreateStepActionOverride[],
  name?: string
): Step => ({
  actions: actions.map(a => createAction(a.action.name, a)),
  name,
});

export const createStep = (actionNames: string[]): Step => ({
  actions: actionNames.map(name => createAction(name)),
});

export const createStepsWithOverrides = (steps: CreateStepActionOverride[][]): RecorderSteps =>
  steps.map(s => createStepWithOverrides(s));

export const createSteps = (stepList: string[][]) =>
  stepList.map(stepParams => createStep(stepParams));
