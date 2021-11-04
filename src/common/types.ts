export interface ActionContext {
  action: Action;
  frameUrl: string;
  isMainFrame: boolean;
  modified: boolean;
  pageAlias: string;
  title?: string;
}

export interface Action {
  command: string;
  isAssert: boolean;
  name: string;
  selector: string;
  signals: Record<string, string>[];
  value: string | null;
  // optional
  clickCount?: number;
  files?: string[];
  key?: string;
  modifiers?: string;
  options?: string[];
  text?: string;
  url?: string;
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
