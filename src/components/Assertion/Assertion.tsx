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

import { ActionInContext } from "@elastic/synthetics";
import React, { useContext, useState } from "react";
import {
  EuiButton,
  EuiButtonEmpty,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiIcon,
  EuiSpacer,
  EuiText,
} from "@elastic/eui";
import type { Action } from "../../common/types";
import { StepsContext } from "../../contexts/StepsContext";
import { AssertionSelect } from "./Select";

interface IAssertion {
  action: Action;
  actionContext: ActionInContext;
  actionIndex: number;
  close?: () => void;
  onDeleteAction: (stepIndex: number, actionIndex: number) => void;
  stepIndex: number;
}

function updateAction(
  oldAction: ActionInContext,
  command?: string,
  selector?: string,
  value?: string
): ActionInContext {
  const { action } = oldAction;
  return {
    ...oldAction,
    action: { ...action, command, selector, value },
  };
}

export function Assertion({
  action,
  actionContext,
  actionIndex,
  close,
  stepIndex,
}: IAssertion) {
  const { onUpdateAction } = useContext(StepsContext);

  const [command, setCommand] = useState(action.command || "");
  const [selector, setSelector] = useState(action.selector);
  const [value, setValue] = useState(action.value || "");

  const saveAssertion = () => {
    onUpdateAction(
      updateAction(actionContext, command, selector, value),
      stepIndex,
      actionIndex
    );
    if (close) close();
  };

  return (
    <>
      <EuiFlexGroup alignItems="center" gutterSize="s">
        <EuiFlexItem grow={false}>
          <EuiText>
            <h4>Add assertion</h4>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiIcon type="iInCircle" />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer />
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <AssertionSelect
            onChange={e => setCommand(e.target.value)}
            value={command}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow label="Selector">
            <EuiFieldText
              onChange={e => setSelector(e.target.value)}
              value={selector}
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow label="Value">
            <EuiFieldText
              disabled={["innerText", "textContent"].indexOf(command) === -1}
              onChange={e => setValue(e.target.value)}
              value={value}
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer />
      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <EuiButton onClick={saveAssertion}>Save</EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButtonEmpty color="danger" onClick={close}>
            Cancel
          </EuiButtonEmpty>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
}
