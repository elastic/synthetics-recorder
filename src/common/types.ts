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

export type StepStatus = 'succeeded' | 'failed' | 'skipped';

export type ResultCategory = StepStatus | 'running';

export interface JourneyStep {
  duration: number;
  error?: Error;
  actionTitles?: string[];
  name: string;
  status: StepStatus;
}

export type JourneyType = 'suite' | 'inline';

export type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

export enum RecordingStatus {
  NotRecording = 'NOT_RECORDING',
  Recording = 'RECORDING',
  Paused = 'PAUSED',
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
    name: string;
    status: 'succeeded' | 'failed';
  };
}
interface StepEndEvent {
  event: 'step/end';
  data: JourneyStep;
}

interface ResultOverride {
  event: 'override';
  data: Result | undefined;
}

export type TestEvent = JourneyStartEvent | JourneyEndEvent | StepEndEvent | ResultOverride;
