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

import {
  EuiButton,
  EuiButtonEmpty,
  EuiFieldPassword,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiFormRow,
  EuiTitle,
} from '@elastic/eui';
import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<boolean>;
  createProject: (projectName: string, kibanaUrl: string, apiKey: string) => Promise<void>;
}

export function NewProjectFlyout({ isOpen, setIsOpen, createProject }: Props) {
  const [projectName, setProjectName] = useState('');
  const [kibanaUrl, setKibanaUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  return isOpen ? (
    <EuiFlyout onClose={() => setIsOpen(false)}>
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h2 id="create-project-flyout-title">Create a new project</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiFormRow
          error={!projectName ? "Project name can't be empty" : null}
          label="Project Name"
        >
          <EuiFieldText onBlur={e => setProjectName(e.target.value)} />
        </EuiFormRow>
        <EuiFormRow label="Kibana URL">
          <EuiFieldText name="kibanaUrl" onBlur={e => setKibanaUrl(e.target.value)} />
        </EuiFormRow>
        <EuiFormRow label="API key">
          <EuiFieldPassword name="apiKey" onBlur={e => setApiKey(e.target.value)} />
        </EuiFormRow>
      </EuiFlyoutBody>
      <EuiFlyoutFooter>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={() => setIsOpen(false)} iconType="cross">
              Cancel
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              disabled={!projectName || !kibanaUrl || !apiKey}
              onClick={() => {
                if (!projectName || !setKibanaUrl || !setApiKey) {
                  return;
                }
                createProject(projectName, kibanaUrl, apiKey);
              }}
            >
              Create Project
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </EuiFlyout>
  ) : null;
}
