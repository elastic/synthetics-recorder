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

import { createContext } from "react";
import { COMMAND_SELECTOR_OPTIONS } from "../common/shared";
import type { ActionContext, Setter } from "../common/types";

function notInitialized() {
  throw Error("Assertion context not initialized");
}

interface ShowAssertionDrawerHandlerParams {
  actionIndex: number;
  mode: "create" | "edit";
  previousAction: ActionContext;
  stepIndex: number;
}

export type AssertionDrawerHandler = (
  params: ShowAssertionDrawerHandlerParams
) => void;

interface IAssertionContext {
  action?: ActionContext;
  actionIndex?: number;
  commandValue: string;
  isVisible: boolean;
  mode: "create" | "edit";
  onHideAssertionDrawer: () => void;
  onShowAssertionDrawer: AssertionDrawerHandler;
  selector?: string;
  setAction: Setter<ActionContext | undefined>;
  setActionIndex: Setter<number | undefined>;
  setCommandValue: Setter<string>;
  setIsVisible: Setter<boolean>;
  setMode: Setter<"create" | "edit">;
  setSelector: Setter<string | undefined>;
  setStepIndex: Setter<number | undefined>;
  setValue: Setter<string | undefined>;
  stepIndex?: number;
  value?: string;
}

export const AssertionContext = createContext<IAssertionContext>({
  commandValue: COMMAND_SELECTOR_OPTIONS[0].value,
  isVisible: false,
  mode: "create",
  onHideAssertionDrawer: notInitialized,
  onShowAssertionDrawer: notInitialized,
  setAction: notInitialized,
  setActionIndex: notInitialized,
  setCommandValue: notInitialized,
  setIsVisible: notInitialized,
  setMode: notInitialized,
  setSelector: notInitialized,
  setStepIndex: notInitialized,
  setValue: notInitialized,
});
