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

import React, { useState } from 'react';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSpacer,
} from '@elastic/eui';
import { AssertionSelect } from './Select';
import { AssertionInfo } from './AssertionInfo';
import { ActionContext } from '../../../common/types';
import { actionTitle } from '../../common/shared';

interface IAssertion {
  actionContext: ActionContext;
  actionIndex: number;
  close?: () => void;
  onDeleteAction: (stepIndex: number, actionIndex: number) => void;
  saveAssertion: (updatedAction: ActionContext) => void;
  stepIndex: number;
}

function updateAction(
  oldAction: ActionContext,
  command?: string,
  selector?: string,
  value?: string
): ActionContext {
  const { action } = oldAction;
  const title = actionTitle(action);
  return {
    ...oldAction,
    action: { ...action, command, selector, value },
    isOpen: false,
    title: title ? title : oldAction?.title,
  };
}

export function Assertion({
  actionContext,
  actionIndex,
  close,
  saveAssertion,
  stepIndex,
}: IAssertion) {
  const { action } = actionContext;

  const [command, setCommand] = useState(action.command || '');
  const [selector, setSelector] = useState(action.selector);
  const [value, setValue] = useState(action.value || '');

  return (
    <>
      <EuiFlexGroup alignItems="center" gutterSize="s">
        <EuiFlexItem grow={false}>
          <EuiFlexGroup alignItems="center" gutterSize="s">
            <EuiFlexItem grow={false}>
              <h4>Add assertion</h4>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <AssertionInfo />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer />
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <AssertionSelect onChange={e => setCommand(e.target.value)} value={command} />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow label="Selector">
            <EuiFieldText
              aria-label="Assertion selector"
              id={`assert-selector-${stepIndex}-${actionIndex}`}
              onChange={e => setSelector(e.target.value)}
              value={selector}
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow label="Value">
            <EuiFieldText
              aria-label="Assertion value"
              disabled={['innerText', 'textContent'].indexOf(command) === -1}
              onChange={e => setValue(e.target.value)}
              value={value}
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer />
      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <EuiButton
            data-test-subj={`save-${stepIndex}-${actionIndex}`}
            onClick={() => {
              saveAssertion(updateAction(actionContext, command, selector, value));
            }}
          >
            Save
          </EuiButton>
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
