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

import type { /* Step, Steps, */ Action } from '@elastic/synthetics';

export type Step = {
  actions: ActionInContext[];
  name?: string;
};

export type Steps = Step[];

export type ActionInContext = {
  frame: FrameDescription;
  action: Action;
  committed?: boolean;
  modified?: boolean;
  title?: string;
};

// from playwright-core
export type FrameDescription = {
  pageAlias: string;
  isMainFrame?: boolean;
  url: string;
  name?: string;
  selectorsChain?: string[];
};
export interface ActionContext extends ActionInContext {
  isOpen?: boolean;
  isSoftDeleted?: boolean;
}
export interface RecorderStep extends Step {
  actions: ActionContext[];
}
export type RecorderSteps = RecorderStep[];
export type StepStatus = 'succeeded' | 'failed' | 'skipped';
export type JourneyType = 'project' | 'inline';

export interface JourneyStep {
  duration: number;
  error?: Error;
  actionTitles?: string[];
  name: string;
  status: StepStatus;
}

interface JourneyStartEvent {
  event: 'journey/start';
  data: {
    name: string;
  };
}

interface JourneyEndEvent {
  event: 'journey/end';
  data: {
    name?: string;
    status: 'succeeded' | 'failed';
    error?: Error;
  };
}
export interface StepEndEvent {
  event: 'step/end';
  data: JourneyStep;
}

export interface Result {
  failed: number;
  skipped: number;
  succeeded: number;
  journey: Journey;
}

export interface Journey {
  status: string;
  steps: Array<JourneyStep>;
  type: JourneyType;
}

interface ResultOverride {
  event: 'override';
  data: Result | undefined;
}

export type TestEvent = JourneyStartEvent | JourneyEndEvent | StepEndEvent | ResultOverride;
export type RecordJourneyOptions = { url: string };
export type RunJourneyOptions = {
  steps: Steps;
  code: string;
  isProject: boolean;
};
export type GenerateCodeOptions = {
  actions: Steps;
  isProject: boolean;
};
