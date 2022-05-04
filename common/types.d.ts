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

import type { ActionInContext, Steps } from '@elastic/synthetics';

export type ActionContext = ActionInContext & { isOpen?: boolean };
export type StepStatus = 'succeeded' | 'failed' | 'skipped';
export type JourneyType = 'suite' | 'inline';

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
  isSuite: boolean;
};
export type GenerateCodeOptions = {
  actions: Steps;
  isSuite: boolean;
};

export interface RecordJourneyRequest {
  data: {
    url: string;
  };
}

export interface TestJourneyRequest {
  data: RunJourneyOptions;
}

export type ClientBrowserRequest = RecordJourneyRequest | TestJourneyRequest;
