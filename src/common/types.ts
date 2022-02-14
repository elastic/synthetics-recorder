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

export type Step = ActionContext[];
export type Steps = ActionContext[][];

export interface ActionContext {
  action: Action;
  frameUrl: string;
  isMainFrame: boolean;
  pageAlias: string;
  // optional
  committed?: boolean;
  modified?: boolean;
  title?: string;
}

export interface Action {
  name: string;
  signals: Record<string, string | boolean>[];
  // optional
  button?: string;
  command?: string;
  clickCount?: number;
  files?: string[];
  isAssert?: boolean;
  key?: string;
  modifiers?: number;
  options?: string[];
  selector?: string;
  text?: string;
  url?: string;
  value?: string | null;
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

export type ResultCategory = "succeeded" | "failed" | "skipped";

export interface JourneyStep {
  duration: number;
  error?: Error;
  name: string;
  status: ResultCategory;
}

export type JourneyType = "suite" | "inline";

export type AssertionDrawerMode = "create" | "edit";

export type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

export enum RecordingStatus {
  NotRecording = "NOT_RECORDING",
  Recording = "RECORDING",
  Paused = "PAUSED",
}
