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
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiListGroup,
  EuiListGroupItem,
  EuiProgress,
  EuiTitle,
  EuiTreeView,
} from '@elastic/eui';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { CommunicationContext } from '../contexts/CommunicationContext';
import { FileViewer } from './FileViewer';
import { ProjectManageFlyout } from './ProjectManageFlyout';
import { StatusViewer } from './StatusViewer';

function finalDirName(dir: string) {
  return dir.split('/').pop();
}

function mapToTreeArray(obj: any, parent?: string): any {
  const res = [];
  for (const key in obj) {
    // files
    if (Array.isArray(obj[key])) {
      obj[key].forEach((file: string) => {
        res.push({
          label: finalDirName(file),
          'aria-label': key,
          id: parent ? `${parent}/${file}` : file,
          icon: <EuiIcon type="document" />,
        });
      });
    } else if (typeof obj[key] === 'object') {
      const name = finalDirName(key);
      const isExpanded = name?.[0] !== '.';
      res.push({
        label: name,
        id: key,
        icon: <EuiIcon type="folderClosed" />,
        iconWhenExpanded: <EuiIcon type="folderOpen" />,
        isExpanded,
        children: mapToTreeArray(obj[key], key),
      });
    } else {
      res.push({
        label: key,
        id: key,
        'aria-label': key,
        isExpanded: true,
        icon: <EuiIcon type="document" />,
      });
    }
  }
  return res;
}

interface Props {
  projectCreated: boolean;
}

export function ProjectsList({ projectCreated }: Props) {
  const { electronAPI } = useContext(CommunicationContext);
  const [proj, setProj] = useState<string[] | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | undefined>(undefined);
  const [projectTree, setProjectTree] = useState<any>(undefined);
  const [selectedFile, setSelectedFile] = useState<string | undefined>(undefined);
  const [selectedFileFullPath, setSelectedFileFullPath] = useState<string | undefined>(undefined);
  const [fileContents, setFileContents] = useState<string | undefined>(undefined);
  const [isPushing, setIsPushing] = useState(false);
  const [showPushSuccess, setShowPushSuccess] = useState(false);
  const [pushFailure, setPushFailure] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [upMonitors, setUpConfigs] = useState<any>({});
  const [downMonitors, setDownConfigs] = useState<any>({});
  const [showStatus, setShowStatus] = useState(false);
  const refreshProjectList = useCallback(() => {
    setLoading(true);
    electronAPI.findProjects().then((res: string) => {
      setLoading(false);
      try {
        const pojo = JSON.parse(res);
        if (Array.isArray(pojo)) {
          setProj(pojo);
        }
      } catch (e) {
        throw e;
      }
    });
  }, [electronAPI]);
  useEffect(() => {
    if (selectedProject) {
      electronAPI.pollProjectStatus(selectedProject).then(res => {
        const { upConfigs, downConfigs } = JSON.parse(res);
        setUpConfigs(upConfigs);
        setDownConfigs(downConfigs);
      });
    }
  }, [selectedProject, electronAPI]);
  useEffect(() => {
    if ((proj === undefined && !loading) || projectCreated) {
      setLoading(true);
      electronAPI.findProjects().then((res: string) => {
        setLoading(false);
        try {
          const pojo = JSON.parse(res);
          if (Array.isArray(pojo)) {
            setProj(pojo);
          }
        } catch (e) {
          throw e;
        }
      });
    }
  }, [electronAPI, loading, proj, projectCreated]);
  useEffect(() => {
    async function fn() {
      if (selectedProject) {
        const projectStructure = await electronAPI.fetchProject(selectedProject);
        try {
          const pojo = JSON.parse(projectStructure);
          setProjectTree(pojo);
        } catch (e) {
          throw e;
        }
      }
    }
    fn();
  }, [electronAPI, selectedProject]);
  if (proj?.length === 0) return <div>No projects created yet!</div>;
  return (
    <React.Fragment>
      <EuiFlexGroup>
        <EuiFlexItem>{proj?.length} projects.</EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiListGroup bordered>
            {proj?.map(project => (
              <EuiListGroupItem
                extraAction={{
                  iconType: 'push',
                  'aria-label': 'Push this project to the Kibana',
                  alwaysShow: true,
                  iconSize: 'm',
                  onClick: () => {
                    setSelectedProject(project);
                    setIsPushing(true);
                    electronAPI
                      .pushProjectToKibana(project)
                      .then(res => {
                        setIsPushing(false);
                        setShowPushSuccess(true);
                        setTimeout(() => setShowPushSuccess(false), 5_000);
                      })
                      .catch(e => {
                        setIsPushing(false);
                        setPushFailure(true);
                        setTimeout(() => setPushFailure(false), 5_000);
                      });
                  },
                }}
                isActive={project === selectedProject}
                key={project}
                onClick={() => {
                  setSelectedProject(project);
                }}
                label={project}
              />
            ))}
          </EuiListGroup>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFlexGroup direction="column" gutterSize="none">
            {!!selectedProject && (
              <EuiFlexItem grow={false}>
                <EuiFlexGroup alignItems="center" justifyContent="spaceBetween">
                  <EuiFlexItem grow={false}>
                    <EuiTitle size="xs">
                      <h2>{selectedProject}</h2>
                    </EuiTitle>
                  </EuiFlexItem>
                  <EuiFlexItem />
                  <EuiFlexItem grow={false}>
                    <EuiButtonEmpty
                      disabled={!selectedProject}
                      onClick={() => {
                        setShowProjectManager(true);
                      }}
                    >
                      Manage
                    </EuiButtonEmpty>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiButtonEmpty
                      disabled={!selectedProject}
                      onClick={() => {
                        setShowStatus(!showStatus);
                      }}
                    >
                      {showStatus ? 'Files' : 'Status'}
                    </EuiButtonEmpty>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
            )}
            <EuiFlexItem grow={false}>
              {showStatus && selectedProject && (
                <StatusViewer
                  upMonitors={upMonitors}
                  downMonitors={downMonitors}
                  selectedProjectName={selectedProject}
                />
              )}
              {!!projectTree && !showStatus && (
                <EuiTreeView
                  onClick={(e: any) => {
                    const filename = e.target.textContent;
                    const path = e.target.id ? e.target.id : e.target.parentElement?.id;

                    // open file and display/edit contents

                    electronAPI
                      .openFile(path)
                      .then((res: string) => {
                        setSelectedFile(filename);
                        setFileContents(res);
                        setSelectedFileFullPath(path);
                      })
                      .catch((e: any) => {
                        throw e;
                      });
                  }}
                  items={mapToTreeArray(projectTree)}
                  aria-label="Project tree"
                />
              )}
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
      <FileViewer
        fileName={selectedFile}
        fileContents={fileContents}
        fullPath={selectedFileFullPath}
        setFileContents={setFileContents}
      />
      {isPushing && (
        <EuiFlexGroup direction="column">
          <EuiFlexItem grow={false}>Pushing project {selectedProject} to Kibana...</EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiProgress size="xs" color="accent" />
          </EuiFlexItem>
        </EuiFlexGroup>
      )}
      {showPushSuccess && <div>Project {selectedProject} pushed successfully!</div>}
      {pushFailure && <div>Project {selectedProject} push failed</div>}
      {selectedProject && showProjectManager && (
        <ProjectManageFlyout
          projectName={selectedProject}
          isOpen={showProjectManager}
          close={() => setShowProjectManager(false)}
          refreshProjectList={refreshProjectList}
        />
      )}
    </React.Fragment>
  );
}
