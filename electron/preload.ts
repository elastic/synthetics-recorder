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
import type { IElectronAPI } from '../common/types';
import { contextBridge, ipcRenderer } from 'electron';

const electronAPI: IElectronAPI = {
  exportScript: async contents => {
    return await ipcRenderer.invoke('export-script', contents);
  },
  recordJourney: async url => {
    return await ipcRenderer.invoke('record-journey', url);
  },
  stopRecording: async () => {
    await ipcRenderer.invoke('stop-recording');
  },
  pauseRecording: async () => {
    await ipcRenderer.invoke('set-mode', 'none');
  },
  resumeRecording: async () => {
    await ipcRenderer.invoke('set-mode', 'recording');
  },
  addActionGeneratedListener: listener => {
    ipcRenderer.on('actions-generated', listener);
    return () => {
      ipcRenderer.removeAllListeners('actions-generated');
    };
  },
  generateCode: async params => {
    return ipcRenderer.invoke('actions-to-code', params);
  },
  openExternalLink: async url => {
    await ipcRenderer.invoke('open-external-link', url);
  },
  runTest: async (params, listener) => {
    ipcRenderer.on('test-event', listener);
    await ipcRenderer.invoke('run-journey', params);
  },
  removeOnTestListener: () => {
    ipcRenderer.removeAllListeners('test-event');
  },
  makeProject: (args: string) => {
    return ipcRenderer.invoke('make-project', args);
  },
  findProjects: () => {
    return ipcRenderer.invoke('find-projects');
  },
  fetchProject: project => {
    return ipcRenderer.invoke('fetch-project', project);
  },
  openFile: async path => {
    return ipcRenderer.invoke('open-file', path);
  },
  openInVsCode: async path => {
    return ipcRenderer.invoke('open-in-vs-code', path);
  },
  pushProjectToKibana: async project => {
    return ipcRenderer.invoke('push', project);
  },
  deleteProject: async project => {
    return ipcRenderer.invoke('delete-project', project);
  },
  getProjectConfig: async project => {
    return ipcRenderer.invoke('get-project-config', project);
  },
  pollProjectStatus: async project => {
    return ipcRenderer.invoke('poll-project-status', project);
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
