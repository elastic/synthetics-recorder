/**
 * MIT License
 *
 * Copyright (c) 2021-present, Elastic NV
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

import { useCallback, useState } from "react";
import { COMMAND_SELECTOR_OPTIONS } from "../common/shared";
import type { ActionContext, AssertionDrawerMode } from "../common/types";

export function useAssertionDrawer() {
  const [commandValue, setCommandValue] = useState(
    COMMAND_SELECTOR_OPTIONS[0].value
  );
  const [action, setAction] = useState<ActionContext | undefined>();
  const [actionIndex, setActionIndex] = useState<number | undefined>();
  const [isVisible, setIsVisible] = useState(false);
  const [selector, setSelector] = useState<string | undefined>();
  const [stepIndex, setStepIndex] = useState<number | undefined>();
  const [mode, setMode] = useState<AssertionDrawerMode>("create");
  const [value, setValue] = useState<string | undefined>();

  const onShowAssertionDrawer = useCallback(
    function ({ previousAction, actionIndex: aidx, stepIndex: sidx, mode: m }) {
      setSelector(previousAction.action.selector);
      if (previousAction.action.command) {
        setCommandValue(previousAction.action.command);
      }
      setValue(previousAction.action.value ?? "");
      setStepIndex(sidx);
      setActionIndex(aidx);
      setAction(previousAction);
      setIsVisible(true);
      setMode(m);
    },
    [
      setStepIndex,
      setActionIndex,
      setAction,
      setIsVisible,
      setSelector,
      setMode,
    ]
  );

  const onHideAssertionDrawer = useCallback(
    function () {
      setIsVisible(false);
    },
    [setIsVisible]
  );

  return {
    action,
    actionIndex,
    commandValue,
    isVisible,
    mode,
    onHideAssertionDrawer,
    onShowAssertionDrawer,
    selector,
    setAction,
    setActionIndex,
    setMode,
    setStepIndex,
    setValue,
    setCommandValue,
    setIsVisible,
    setSelector,
    stepIndex,
    value,
  };
}
