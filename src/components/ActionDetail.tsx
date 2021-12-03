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

import React, { ChangeEventHandler, useContext, useState } from "react";
import {
  EuiButton,
  EuiButtonEmpty,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiPanel,
  EuiSpacer,
  EuiText,
} from "@elastic/eui";
import { StepsContext } from "../contexts/StepsContext";
import type { ActionContext } from "../common/types";

function createUpdatedAction(
  field: string,
  value: string,
  context: ActionContext
) {
  return {
    ...context,
    action: { ...context.action, [field]: value },
    modified: true,
  };
}

interface IActionDetail {
  actionContext: ActionContext;
  actionIndex: number;
  stepIndex: number;
  close?: () => void;
}

export function ActionDetail({
  actionContext,
  actionIndex,
  close,
  stepIndex,
}: IActionDetail) {
  const { actions, onStepDetailChange } = useContext(StepsContext);
  const onActionContextChange = (
    updatedAction: ActionContext,
    updatedActionIndex: number
  ) => {
    onStepDetailChange(
      actions[stepIndex].map((actionToUpdate, index) =>
        index === updatedActionIndex ? updatedAction : actionToUpdate
      ),
      stepIndex
    );
  };
  const { action } = actionContext;
  const [selector, setSelector] = useState(action.selector || "");
  const [text, setText] = useState(action.text || "");
  const [url, setUrl] = useState(action.url || "");

  const onSelectorChange = (value: string) => {
    if (!value) return;
    setSelector(value);
    onActionContextChange(
      createUpdatedAction("selector", value, actionContext),
      actionIndex
    );
  };
  const onTextChange = (value: string) => {
    if (!value) return;
    setText(value);
    onActionContextChange(
      createUpdatedAction("text", value, actionContext),
      actionIndex
    );
  };
  const onURLChange = (value: string) => {
    if (!value) return;
    setUrl(value);
    onActionContextChange(
      createUpdatedAction("url", value, actionContext),
      actionIndex
    );
  };

  if (action.text !== text && typeof action.text !== "undefined") {
    setText(action.text);
  }

  return (
    <EuiPanel hasShadow={false} paddingSize="none">
      <EuiText>
        <h4>Edit action</h4>
      </EuiText>
      <EuiSpacer />
      <EuiFlexGroup alignItems="baseline">
        {url && (
          <EuiFlexItem>
            <FormControl
              name={action.name}
              onChange={e => setUrl(e.target.value)}
              value={url}
            />
          </EuiFlexItem>
        )}
        {selector && !action.isAssert && (
          <EuiFlexItem>
            <FormControl
              name={action.name}
              onChange={e => setSelector(e.target.value)}
              value={selector}
            />
          </EuiFlexItem>
        )}
        {text && (
          <EuiFlexItem>
            <FormControl
              label="Value"
              name={action.name}
              noPrepend
              onChange={e => setText(e.target.value)}
              value={text}
            />
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
      <EuiSpacer />
      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <EuiButton
            onClick={() => {
              if (url) {
                onURLChange(url);
              } else if (selector && !action.isAssert) {
                onSelectorChange(selector);
              } else if (text) {
                onTextChange(text);
              }
              if (close) {
                close();
              }
            }}
          >
            Save
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButtonEmpty
            color="danger"
            onClick={() => {
              if (close) close();
            }}
          >
            Cancel
          </EuiButtonEmpty>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
}

function FormControl({
  label,
  name,
  noPrepend,
  onChange,
  value,
}: {
  label?: string;
  name: string;
  noPrepend?: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
  value: string;
}) {
  return (
    <EuiFormRow label={label ?? "Command"}>
      <EuiFieldText
        onChange={onChange}
        prepend={noPrepend === true ? undefined : name}
        value={value}
      />
    </EuiFormRow>
  );
}
