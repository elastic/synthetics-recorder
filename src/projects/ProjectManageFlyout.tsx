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

import React, { useContext, useEffect, useState } from 'react';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiComboBox,
  EuiFieldNumber,
  EuiFieldPassword,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiFormRow,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiTitle,
} from '@elastic/eui';
import { CommunicationContext } from '../contexts/CommunicationContext';

interface Props {
  close: () => void;
  isOpen: boolean;
  projectName: string;
  refreshProjectList: () => void;
}

interface ModalProps {
  close: () => void;
  closeFlyout: () => void;
  projectName: string;
  refreshProjectList: () => void;
}

function DeleteProjectModal({ close, projectName, refreshProjectList, closeFlyout }: ModalProps) {
  const [userInput, setUserInput] = useState('');
  const { electronAPI } = useContext(CommunicationContext);
  return (
    <EuiModal onClose={close}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>Delete {projectName}</EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiFormRow label="Confirm project name">
          <EuiFieldText
            onChange={e => {
              setUserInput(e.target.value);
            }}
          />
        </EuiFormRow>
      </EuiModalBody>
      <EuiModalFooter>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiButton
              disabled={userInput !== projectName}
              color="danger"
              fill
              onClick={() => {
                electronAPI
                  .deleteProject(projectName)
                  .then(() => {
                    refreshProjectList();
                    closeFlyout();
                    close();
                  })
                  .catch(e => {
                    throw e;
                  });
              }}
            >
              Delete project
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={close}>Cancel</EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiModalFooter>
    </EuiModal>
  );
}

export function ProjectManageFlyout({ close, projectName, refreshProjectList }: Props) {
  const [displayModal, setDisplayModal] = useState(false);
  const { electronAPI } = useContext(CommunicationContext);

  useEffect(() => {
    electronAPI.getProjectConfig(projectName).catch((e: any) => {
      throw e;
    });
  }, [electronAPI, projectName]);

  return (
    <React.Fragment>
      <EuiFlyout onClose={close}>
        <EuiFlyoutHeader>
          <EuiTitle>
            <h3>Manage {projectName}</h3>
          </EuiTitle>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <EuiFlexGroup direction="column">
            <EuiFlexItem>
              <EuiFormRow label="Project name">
                <EuiFieldText />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFormRow label="Kibana URL">
                <EuiFieldText />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFormRow label="Frequency">
                <EuiFieldNumber />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFormRow label="API key">
                <EuiFieldPassword />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFormRow label="Locations">
                <EuiComboBox />
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlyoutBody>
        <EuiFlyoutFooter>
          <EuiFlexGroup justifyContent="spaceBetween">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty onClick={close}>Close</EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem />
            <EuiFlexItem grow={false}>
              <EuiButton fill color="danger" onClick={() => setDisplayModal(true)}>
                Delete project
              </EuiButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                fill
                onClick={() => {
                  throw Error('not implemented');
                }}
              >
                Update project
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlyoutFooter>
      </EuiFlyout>
      {displayModal && (
        <DeleteProjectModal
          refreshProjectList={refreshProjectList}
          close={() => setDisplayModal(false)}
          closeFlyout={close}
          projectName={projectName}
        />
      )}
    </React.Fragment>
  );
}
