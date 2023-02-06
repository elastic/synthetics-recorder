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

import { join } from 'path';
import { writeFile, rm, mkdir } from 'fs/promises';
import { EventEmitter } from 'events';
import { shell, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
import { fork, ChildProcess } from 'child_process';
import logger from 'electron-log';
import isDev from 'electron-is-dev';
import { JOURNEY_DIR, PLAYWRIGHT_BROWSERS_PATH } from './config';
import type {
  ActionInContext,
  RecorderSteps,
  RunJourneyOptions,
  StepEndEvent,
  StepStatus,
  TestEvent,
} from '../common/types';
import { SyntheticsGenerator } from './syntheticsGenerator';
import { BrowserManager, browserManager } from './browserManager';
import { onRecordJourneys, onSetMode, onExportScript } from './api';

const SYNTHETICS_CLI = require.resolve('@elastic/synthetics/dist/cli');

// TODO: setting isBrowserRunning from onRecordJourney is broken
export enum MainWindowEvent {
  MAIN_CLOSE = 'main-close',
}

/**
 * Attempts to find the step associated with a `step/end` event.
 *
 * If the step is found, the sequential titles of each action are overlayed
 * onto the object.
 * @param {*} steps list of steps to search
 * @param {*} event the result data from Playwright
 * @returns the event data combined with action titles in a new object
 */
function addActionsToStepResult(steps: RecorderSteps, event: StepEndEvent): TestEvent {
  const step = steps.find(
    s =>
      s.actions.length &&
      s.actions[0].title &&
      (event.data.name === s.actions[0].title || event.data.name === s.name)
  );
  if (!step) return { ...event, data: { ...event.data, actionTitles: [] } };
  return {
    ...event,
    data: {
      ...event.data,
      actionTitles: step.actions.map(
        (action: ActionInContext, index: number) => action?.title ?? `Action ${index + 1}`
      ),
    },
  };
}

function onTest(browserManager: BrowserManager) {
  return async function (_event: IpcMainInvokeEvent, data: RunJourneyOptions) {
    if (browserManager.isRunning()) {
      throw new Error(
        'Cannot start testing a journey, a browser operation is already in progress.'
      );
    }
    // TODO: connect onTest with browserManager and refactor
    // browserManager.isRunning() = true;
    const parseOrSkip = (chunk: string): Array<Record<string, any>> => {
      // at times stdout ships multiple steps in one chunk, broken by newline,
      // so here we split on the newline
      return chunk.split('\n').map(subChunk => {
        try {
          return JSON.parse(subChunk);
        } catch (_) {
          return {};
        }
      });
    };
    const isJourneyStart = (event: any): event is { journey: { name: string } } => {
      return event.type === 'journey/start' && !!event.journey.name;
    };

    const isStepEnd = (
      event: any
    ): event is {
      step: { duration: { us: number }; name: string; status: StepStatus };
      error?: Error;
    } => {
      return (
        event.type === 'step/end' &&
        ['succeeded', 'failed', 'skipped'].includes(event.step?.status) &&
        typeof event.step?.duration?.us === 'number'
      );
    };

    const isJourneyEnd = (
      event: any
    ): event is { journey: { name: string; status: 'succeeded' | 'failed' } } => {
      return (
        event.type === 'journey/end' && ['succeeded', 'failed'].includes(event.journey?.status)
      );
    };

    const constructEvent = (parsed: Record<string, any>): TestEvent | null => {
      if (isJourneyStart(parsed)) {
        return {
          event: 'journey/start',
          data: {
            name: parsed.journey.name,
          },
        };
      }
      if (isStepEnd(parsed)) {
        return {
          event: 'step/end',
          data: {
            name: parsed.step.name,
            status: parsed.step.status,
            duration: Math.ceil(parsed.step.duration.us / 1000),
            error: parsed.error,
          },
        };
      }
      if (isJourneyEnd(parsed)) {
        return {
          event: 'journey/end',
          data: {
            name: parsed.journey.name,
            status: parsed.journey.status,
          },
        };
      }
      return null;
    };
    // TODO: de-deup browserWindow getter
    const browserWindow = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    const sendTestEvent = (event: TestEvent) => {
      browserWindow.webContents.send('test-event', event);
    };

    const emitResult = (chunk: string) => {
      parseOrSkip(chunk).forEach(parsed => {
        const event = constructEvent(parsed);
        if (event) {
          sendTestEvent(
            event.event === 'step/end' ? addActionsToStepResult(data.steps, event) : event
          );
        }
      });
    };

    let synthCliProcess: ChildProcess | null = null; // child process, define here to kill when finished

    try {
      const isProject = data.isProject;
      const args = [
        '--no-headless',
        '--reporter=json',
        '--screenshots=off',
        '--no-throttling',
        '--sandbox',
      ];
      const filePath = join(JOURNEY_DIR, 'recorded.journey.js');
      if (!isProject) {
        args.push('--inline');
      } else {
        await mkdir(JOURNEY_DIR, { recursive: true });
        await writeFile(filePath, data.code);
        args.unshift(filePath);
      }

      /**
       * Fork the Synthetics CLI with correct browser path and
       * cwd correctly spawns the process
       */
      synthCliProcess = fork(`${SYNTHETICS_CLI}`, args, {
        env: {
          ...process.env,
          PLAYWRIGHT_BROWSERS_PATH,
        },
        cwd: isDev ? process.cwd() : process.resourcesPath,
        stdio: 'pipe',
      });

      function handleMainClose() {
        if (synthCliProcess && !synthCliProcess.kill()) {
          logger.warn('Unable to abort Synthetics test proceess.');
        }
      }
      // mainWindowEmitter.addListener(MainWindowEvent.MAIN_CLOSE, handleMainClose);

      const { stdout, stdin, stderr } = synthCliProcess as ChildProcess;
      if (!isProject) {
        stdin?.write(data.code);
        stdin?.end();
      }
      stdout?.setEncoding('utf-8');
      stderr?.setEncoding('utf-8');
      for await (const chunk of stdout!) {
        emitResult(chunk);
      }
      for await (const chunk of stderr!) {
        logger.error(chunk);
      }
      if (isProject) {
        await rm(filePath, { recursive: true, force: true });
      }

      // mainWindowEmitter.removeListener(MainWindowEvent.MAIN_CLOSE, handleMainClose);
    } catch (error: unknown) {
      logger.error(error);
      sendTestEvent({
        event: 'journey/end',
        data: {
          status: 'failed',
          error: error as Error,
        },
      });
    } finally {
      if (synthCliProcess && !synthCliProcess.kill()) {
        logger.warn(
          `Attempted to send SIGTERM to synthetics process, but did not receive exit signal. Process ID is ${synthCliProcess.pid}.`
        );
      }
      // isBrowserRunning = false;
    }
  };
}

async function onGenerateCode(
  _event: IpcMainInvokeEvent,
  data: { isProject: boolean; actions: RecorderSteps }
) {
  const generator = new SyntheticsGenerator(data.isProject);
  return generator.generateFromSteps(data.actions);
}

async function onLinkExternal(_event: IpcMainInvokeEvent, url: string) {
  try {
    await shell.openExternal(url);
  } catch (e) {
    logger.error(e);
  }
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
  });
  ipcMain.handle('record-journey', onRecordJourneys(browserManager));
  ipcMain.handle('run-journey', onTest(browserManager));
  ipcMain.handle('actions-to-code', onGenerateCode);
  ipcMain.handle('export-script', onExportScript);
  ipcMain.handle('set-mode', onSetMode(browserManager));
  ipcMain.handle('link-to-external', onLinkExternal);

  return () => ipcMain.removeAllListeners();
}
