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

import React, { useContext, useState } from 'react';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { StepsContext } from '../../contexts/StepsContext';
import { FormControl } from './FormControl';
import { ActionContext } from '../../../common/types';
import { actionTitle } from '../../common/shared';

function createUpdatedAction(fields: IActionUpdateFields, context: ActionContext) {
  const action = {
    ...context.action,
    url: fields.url,
    selector: fields.selector,
    text: fields.text,
  };
  const actionContext = {
    ...context,
    action,
    modified: true,
    isOpen: false,
  };
  const title = actionTitle(actionContext.action);
  return title ? { ...actionContext, title } : actionContext;
}
interface IActionUpdateFields {
  url: string;
  selector: string;
  text?: string;
}
interface IActionDetail {
  actionContext: ActionContext;
  actionIndex: number;
  stepIndex: number;
  close?: () => void;
}

export function ActionDetail({ actionContext, actionIndex, stepIndex, close }: IActionDetail) {
  const { onUpdateAction } = useContext(StepsContext);
  const { action } = actionContext;
  const [selector, setSelector] = useState(action.selector || '');
  const [text, setText] = useState(action.text);
  const [url, setUrl] = useState(action.url || '');
  const updateAction = () => {
    const updatedAction = createUpdatedAction(
      {
        url,
        selector,
        text,
      },
      actionContext
    );
    onUpdateAction(updatedAction, stepIndex, actionIndex);
  };

  return (
    <EuiPanel hasBorder={false} hasShadow={false} paddingSize="none">
      <EuiText>
        <h4>Edit action</h4>
      </EuiText>
      <EuiSpacer />
      <EuiFlexGroup alignItems="baseline">
        {url && (
          <EuiFlexItem>
            <FormControl
              data-test-subj={`edit-url-${stepIndex}-${actionIndex}`}
              name={action.name}
              onChange={e => setUrl(e.target.value)}
              value={url}
            />
          </EuiFlexItem>
        )}
        {selector && !action.isAssert && (
          <EuiFlexItem>
            <FormControl
              data-test-subj={`edit-selector-${stepIndex}-${actionIndex}`}
              name={action.name}
              onChange={e => setSelector(e.target.value)}
              value={selector}
            />
          </EuiFlexItem>
        )}
        {text != null && (
          <EuiFlexItem>
            <FormControl
              data-test-subj={`edit-text-${stepIndex}-${actionIndex}`}
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
            data-test-subj={`save-action-${stepIndex}-${actionIndex}`}
            onClick={updateAction}
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
