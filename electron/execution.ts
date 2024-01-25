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

import axios from 'axios';
import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import type { RunJourneyOptions } from '../common/types';
import { browserManager } from './browserManager';
import {
  onSetMode,
  onExportScript,
  runJourney,
  recordJourney,
  onOpenExternalLink,
  onGenerateCode,
} from './api';
import { syntheticsManager } from './syntheticsManager';

export enum MainWindowEvent {
  MAIN_CLOSE = 'main-close',
}

// type Dir = { [key: string]: Dir[] } | string;
type Dir = any;

function fetchFiles(dir: string): Dir {
  const files = fs.readdirSync(dir);
  let dirMap = {};
  const leaves: string[] = [];
  for (const file of files) {
    if (file === 'node_modules') continue;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      const subdirs = fetchFiles(filePath);
      dirMap = { ...dirMap, ...subdirs };
    } else {
      leaves.push(file);
    }
  }
  return { [dir]: { ...dirMap, files: leaves } };
}

/**
 * Sets up IPC listeners for the main process to respond to UI events.
 *
 * @param mainWindowEmitter Allows handlers to respond to app-level events
 * @returns a list of functions that will remove the listeners this function adds.
 *
 * Because the IPC is global, it is important to remove the listeners anytime this function's caller
 * is destroyed or they will leak/block the next window from interacting with top-level app state.
 */
export default function setupListeners(mainWindowEmitter: EventEmitter) {
  mainWindowEmitter.once(MainWindowEvent.MAIN_CLOSE, async () => {
    if (browserManager.isRunning()) {
      await browserManager.closeBrowser();
    }

    if (syntheticsManager.isRunning()) {
      await syntheticsManager.stop();
    }
  });

  ipcMain.handle('record-journey', onRecordJourney);
  ipcMain.handle('run-journey', onRunJourney);
  ipcMain.handle('actions-to-code', onGenerateCode);
  ipcMain.handle('export-script', onExportScript);
  ipcMain.handle('set-mode', onSetMode(browserManager));
  ipcMain.handle('open-external-link', onOpenExternalLink);
  ipcMain.handle('push', async (_event, project: string) => {
    return new Promise((resolve, reject) => {
      const p = path.join(__dirname, '..', '..', project);
      const apiPath = path.join(p, 'api.json');
      const SYNTHETICS_API_KEY = JSON.parse(fs.readFileSync(apiPath, 'utf8')).apiKey;
      const push = spawn('npm', ['run', 'push'], {
        cwd: p,
        env: {
          PATH: process.env.PATH,
          SYNTHETICS_API_KEY,
        },
        shell: true,
        detached: true,
      });
      push.stdout.setEncoding('utf8');
      push.on('close', () => {
        resolve('pushed');
      });
      push.on('error', e => {
        reject(e);
      });
    });
  });
  ipcMain.handle('open-file', async (_event, path: string) => {
    return new Promise((resolve, reject) => {
      fs.readFile(path, 'utf8', (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  });
  ipcMain.handle('fetch-project', async (_event, project: string) => {
    return new Promise<string>(async (resolve, reject) => {
      const fileRes = fetchFiles(path.join(__dirname, '..', '..', project));

      resolve(JSON.stringify(fileRes));
    });
  });
  ipcMain.handle('delete-project', (_event, project) => {
    return new Promise((resolve, reject) => {
      const deleteProject = spawn('rm', ['-rf', path.join(__dirname, '..', '..', project)], {
        env: {
          PATH: process.env.PATH,
        },
        shell: true,
        detached: true,
      });
      deleteProject.on('close', () => {
        resolve('deleted');
      });
      deleteProject.on('error', reject);
    });
  });
  ipcMain.handle('get-project-config', (_event, project) => {
    return new Promise((resolve, reject) => {
      const configPath = path.join(
        path.join(__dirname, '..', '..', project),
        'synthetics.config.ts'
      );
      fs.readFile(configPath, 'utf8', (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  });
  ipcMain.handle('find-projects', async () => {
    return new Promise(async (resolve, reject) => {
      const projects: string[] = [];
      const p = path.join(__dirname, '..', '..');
      const subfolders = fs
        .readdirSync(p, { withFileTypes: true })
        .filter(r => fs.lstatSync(r.name).isDirectory());
      for (const subfolder of subfolders) {
        const files = fs.readdirSync(path.join(p, subfolder.name));
        if (Array.isArray(files) && files.includes('synthetics.config.ts')) {
          projects.push(subfolder.name);
        }
      }
      projects.sort();
      resolve(JSON.stringify(projects));
    });
  });
  ipcMain.handle('open-in-vs-code', async (_event, path: string) => {
    return new Promise((resolve, reject) => {
      const vscode = spawn('code', [path], {
        env: {
          PATH: process.env.PATH,
        },
        shell: true,
        detached: true,
      });
      vscode.on('close', () => resolve('opened'));
      vscode.on('error', reject);
    });
  });
  ipcMain.handle('poll-project-status', async (_event, project: string) => {
    return new Promise<string>(async (resolve, reject) => {
      const p = path.join(__dirname, '..', '..', project);
      const apiPath = path.join(p, 'api.json');
      const { apiKey: SYNTHETICS_API_KEY, kibanaUrl } = JSON.parse(
        fs.readFileSync(apiPath, 'utf8')
      );
      try {
        // {
        //           headers: {`Authorization`: `ApiKey ${SYNTHETICS_API_KEY}`},
        //       }
        const status = await axios.get(`${kibanaUrl}/internal/synthetics/overview_status`, {
          headers: {
            Authorization: `ApiKey ${SYNTHETICS_API_KEY}`,
          },
        });
        resolve(JSON.stringify(status.data));
      } catch (e) {
        reject(e);
      }
    });
  });
  ipcMain.handle('make-project', async (_event, args: string) => {
    return new Promise<string>((resolve, reject) => {
      let projectName: string;
      let kibanaUrl: string;
      let apiKey: string;

      try {
        const parsedArgs = JSON.parse(args);
        projectName = parsedArgs.projectName;
        kibanaUrl = parsedArgs.kibanaUrl;
        apiKey = parsedArgs.apiKey;
      } catch (e) {
        reject(e);
        return;
      }
      const makeProject = spawn('npx', ['@elastic/synthetics', 'init', projectName], {
        env: {
          PATH: process.env.PATH,
        },
        shell: true,
        detached: true,
      });

      let answeredCloud = false;
      let answeredKibanaUrl = false;
      let answeredApiKey = false;
      let answeredLocationsDown = false;
      let answeredLocationsSpace = false;
      let answeredLocationsEnter = false;
      let selectFrequency = false;
      let confirmProjectId = false;
      let confirmKibanaSpace = false;

      makeProject.on('close', () => {
        const apiPath = path.join(__dirname, '..', '..', projectName, 'api.json');
        try {
          fs.writeFileSync(apiPath, JSON.stringify({ apiKey, kibanaUrl }), { encoding: 'utf8' });
        } catch (e) {
          reject(e);
        }
        resolve('created');
      });
      makeProject.on('error', reject);

      makeProject.stdout.setEncoding('utf8');
      makeProject.stderr.setEncoding('utf8');
      makeProject.stdin.setDefaultEncoding('utf8');

      makeProject.stdout.on('data', data => {
        if (typeof data !== 'string') return;
        if (data.indexOf('Do you use Elastic Cloud') !== -1 && !answeredCloud) {
          answeredCloud = true;
          makeProject.stdin.write('f');
        }
        if (data.indexOf('What is the url of your Kibana instance') !== -1 && !answeredKibanaUrl) {
          answeredKibanaUrl = true;
          makeProject.stdin.write(`${kibanaUrl}\n`);
        }
        if (data.indexOf('What is your API key') !== -1 && !answeredApiKey) {
          answeredApiKey = true;
          makeProject.stdin.write(`${apiKey}\n`);
          // makeProject.stdin.write('NDBDZjZvd0JFd3dhc1c4eXgyVGE6ZS1pRDhHSFJULW1kVm5XZllTNEtCQQ==\n');
          // TGdfSDlJd0JZbUhCZVhZUWNyRFE6V1V5OTQwM0pTcTYzZVlvWlZnd1lWdw==
        }

        if (data.indexOf('Select the locations') !== -1 && !answeredLocationsDown) {
          answeredLocationsDown = true;
          makeProject.stdin.write('\u001B\u005B\u0042');
        } else if (data.indexOf('Select the locations') !== -1 && !answeredLocationsSpace) {
          answeredLocationsSpace = true;
          makeProject.stdin.write('\u0020'); // space
        } else if (data.indexOf('Select the locations') !== -1 && !answeredLocationsEnter) {
          answeredLocationsEnter = true;
          makeProject.stdin.write('\u00E2\u008F\u008E\n'); // enter
        }

        if (data.indexOf('240') !== -1 && !selectFrequency) {
          makeProject.stdin.write('\u00E2\u008F\u008E\n');
          selectFrequency = true;
        }

        if (data.indexOf('Choose project id') !== -1 && !confirmProjectId) {
          makeProject.stdin.write(`${projectName}\n`);
          confirmProjectId = true;
        }

        if (data.indexOf('Choose the target Kibana space') !== -1 && !confirmKibanaSpace) {
          makeProject.stdin.write('default\n');
          confirmKibanaSpace = true;
        }
      });
    });
  });

  return () => ipcMain.removeAllListeners();
}

async function onRecordJourney(event: IpcMainInvokeEvent, url: string) {
  if (browserManager.isRunning() || syntheticsManager.isRunning()) {
    throw new Error(
      'Cannot start recording a journey, a browser operation is already in progress.'
    );
  }
  await recordJourney(event, url, browserManager);
}

async function onRunJourney(event: IpcMainInvokeEvent, data: RunJourneyOptions) {
  if (browserManager.isRunning() || syntheticsManager.isRunning()) {
    throw new Error('Cannot start testing a journey, a browser operation is already in progress.');
  }
  await runJourney(event, data, syntheticsManager);
}
