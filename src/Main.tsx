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

import React, { useCallback, useContext, useEffect, useState } from 'react';
import { EuiButtonEmpty, EuiLoadingLogo, EuiPageTemplate, EuiProvider } from '@elastic/eui';
import { ProjectsList } from './projects';
import { CommunicationContext } from './contexts/CommunicationContext';
import { NewProjectFlyout } from './projects/NewProjectFlyout';
import createCache from '@emotion/cache';
import App from './App';

/**
 * This is the prescribed workaround to some internal EUI issues that occur
 * when EUI component styles load before the global styles. For more information, see
 * https://elastic.github.io/eui/#/utilities/provider#global-styles.
 */
const cache = createCache({
  key: 'elastic-synthetics-recorder-projects',
  container: document.querySelector<HTMLElement>('meta[name="global-style-insert"]') ?? undefined,
});

export default function ProjectMain() {
  const { electronAPI } = useContext(CommunicationContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [projectCreated, setProjectCreated] = useState(false);
  const [recording, setRecording] = useState(false);
  useEffect(() => {
    if (projectCreated) {
      setTimeout(() => setProjectCreated(false), 7_000);
    }
  }, [projectCreated]);
  const createProject = useCallback(
    async (projectName: string, kibanaUrl: string, apiKey: string) => {
      setIsLoading(true);
      if (isCreateProjectOpen) {
        setIsCreateProjectOpen(false);
      }
      if (projectCreated) {
        setProjectCreated(false);
      }
      try {
        const result = await electronAPI.makeProject(
          JSON.stringify({ projectName, kibanaUrl, apiKey })
        );
        setIsLoading(false);
        if (result === 'created') {
          setProjectCreated(true);
        }
      } catch (e) {
        setIsLoading(false);
      }
    },
    [electronAPI, isCreateProjectOpen, projectCreated]
  );

  const cancel = useCallback(() => {
    setRecording(false);
  }, []);

  if (recording) return <App cancel={cancel} />;

  return (
    <EuiProvider cache={cache} colorMode="light">
      <EuiPageTemplate restrictWidth="900px">
        <EuiPageTemplate.Header
          pageTitle="Project Management"
          iconType="logoElastic"
          rightSideItems={[
            <EuiButtonEmpty
              key="create-new-project"
              onClick={() => {
                if (!isCreateProjectOpen) {
                  setIsCreateProjectOpen(true);
                }
              }}
            >
              Create New Project
            </EuiButtonEmpty>,
            <EuiButtonEmpty
              key="record-new-script"
              onClick={() => {
                if (!recording) {
                  setRecording(true);
                }
              }}
            >
              {recording ? 'Cancel recording' : 'Record script'}
            </EuiButtonEmpty>,
          ]}
        ></EuiPageTemplate.Header>
        <EuiPageTemplate.Section>
          <ProjectsList projectCreated={projectCreated} />
          {isLoading && <EuiLoadingLogo size="xl" />}
          {projectCreated && <div>Project Created!</div>}
        </EuiPageTemplate.Section>
      </EuiPageTemplate>
      <NewProjectFlyout
        createProject={createProject}
        isOpen={isCreateProjectOpen}
        setIsOpen={setIsCreateProjectOpen}
      />
    </EuiProvider>
  );
}
