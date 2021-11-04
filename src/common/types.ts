export interface ActionContext {
  action: Action;
  frameUrl: string;
  isMainFrame: boolean;
  modified: boolean;
  pageAlias: string;
  title?: string;
}

export interface Action {
  clickCount?: number;
  command: string;
  files?: string[];
  key?: string;
  isAssert: boolean;
  modifiers?: string;
  name: string;
  options?: string[];
  selector: string;
  signals: unknown[];
  text?: string;
  url?: string;
  value: string | null;
}

export interface Result {
  failed: number;
  skipped: number;
  succeeded: number;
  journeys: Journey;
}

export interface Journey {
  inline?: JourneyStatus;
  suite?: JourneyStatus;
}

export interface JourneyStatus {
  status: string;
  steps: Array<JourneyStep>;
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
