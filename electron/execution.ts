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

import { chromium } from 'playwright';
import { join, resolve } from 'path';
import { existsSync } from 'fs';
import { writeFile, rm, mkdir } from 'fs/promises';
import { ipcMain as ipc } from 'electron-better-ipc';
import { EventEmitter, once } from 'events';
import { dialog, shell, BrowserWindow } from 'electron';
import { fork, ChildProcess } from 'child_process';
import logger from 'electron-log';
import isDev from 'electron-is-dev';
import { JOURNEY_DIR, PLAYWRIGHT_BROWSERS_PATH, EXECUTABLE_PATH } from './config';
import type { BrowserContext } from 'playwright';
import type { ActionInContext, Steps } from '@elastic/synthetics';
import type {
  GenerateCodeOptions,
  RecordJourneyOptions,
  RunJourneyOptions,
  StepEndEvent,
  StepStatus,
  TestEvent,
} from '../common/types';
import { SyntheticsGenerator } from './syntheticsGenerator';
import { BrowserRequestController } from './BrowserRequestController';
const SYNTHETICS_CLI = require.resolve('@elastic/synthetics/dist/cli');
const IS_TEST_ENV = process.env.NODE_ENV === 'test';
const CDP_TEST_PORT = parseInt(process.env.TEST_PORT ?? '61337') + 1;

const requestController = new BrowserRequestController();

async function launchContext() {
  const browser = await chromium.launch({
    headless: IS_TEST_ENV,
    executablePath: EXECUTABLE_PATH,
    args: IS_TEST_ENV ? [`--remote-debugging-port=${CDP_TEST_PORT}`] : [],
  });

  const context = await browser.newContext();

  let closingBrowser = false;
  async function closeBrowser() {
    if (closingBrowser) return;
    closingBrowser = true;
    await browser.close();
  }

  context.on('page', page => {
    page.on('close', () => {
      const hasPage = browser.contexts().some(context => context.pages().length > 0);
      if (hasPage) return;
      closeBrowser().catch(_e => null);
    });
  });
  return { browser, context };
}

async function openPage(context: BrowserContext, url: string) {
  const page = await context.newPage();
  if (url) {
    if (existsSync(url)) url = 'file://' + resolve(url);
    else if (!url.startsWith('http') && !url.startsWith('file://') && !url.startsWith('about:'))
      url = 'http://' + url;
    await page.goto(url);
  }
  return page;
}

let browserContext: BrowserContext | null = null;
let actionListener = new EventEmitter();

async function onRecordJourneys(data: { url: string }, browserWindow: BrowserWindow) {
  return requestController.executeRequest({ data }, browserWindow, async () => {
    const { browser, context } = await launchContext();
    browserContext = context;
    actionListener = new EventEmitter();
    // Listen to actions from Playwright recording session
    const actionsHandler = (actions: ActionInContext[]) => {
      ipc.callRenderer(browserWindow, 'change', { actions });
    };
    actionListener.on('actions', actionsHandler);

    // _enableRecorder is private method, not defined in BrowserContext type
    await (context as any)._enableRecorder({
      launchOptions: {},
      contextOptions: {},
      startRecording: true,
      showRecorder: false,
      actionListener,
    });
    await openPage(context, data.url);

    const closeBrowser = async () => {
      browserContext = null;
      actionListener.removeListener('actions', actionsHandler);
      try {
        await browser.close();
      } catch (e) {
        logger.error('Browser close threw an error', e);
      }
    };

    ipc.on('stop', closeBrowser);

    await once(browser, 'disconnected');
  });
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
function addActionsToStepResult(steps: Steps, event: StepEndEvent): TestEvent {
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

async function onTest(data: RunJourneyOptions, browserWindow: BrowserWindow) {
  return requestController.executeRequest({ data }, browserWindow, async () => {
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
      const isSuite = data.isSuite;
      const args = ['--no-headless', '--reporter=json', '--screenshots=off', '--no-throttling'];
      const filePath = join(JOURNEY_DIR, 'recorded.journey.js');
      if (!isSuite) {
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
      const { stdout, stdin, stderr } = synthCliProcess as ChildProcess;
      if (!isSuite) {
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
      if (isSuite) {
        await rm(filePath, { recursive: true, force: true });
      }
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
      if (synthCliProcess) {
        synthCliProcess.kill();
      }
    }
  });
}

async function onFileSave(code: string) {
  const window = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
  const { filePath, canceled } = await dialog.showSaveDialog(window, {
    defaultPath: 'recorded.journey.js',
  });

  if (!canceled && filePath) {
    await writeFile(filePath, code);
    return true;
  }
  return false;
}

async function onGenerateCode(data: { isSuite: boolean; actions: Steps }) {
  const generator = new SyntheticsGenerator(data.isSuite);
  return generator.generateFromSteps(data.actions);
}

async function onSetMode(mode: string) {
  if (!browserContext) return;
  const page = browserContext.pages()[0];
  if (!page) return;
  await page.mainFrame().evaluate(
    ([mode]) => {
      // `_playwrightSetMode` is a private function
      (window as any)._playwrightSetMode(mode);
    },
    [mode]
  );
  if (mode !== 'inspecting') return;
  const [selector] = await once(actionListener, 'selector');
  return selector;
}

async function onLinkExternal(url: string) {
  try {
    await shell.openExternal(url);
  } catch (e) {
    logger.error(e);
  }
}

export default function setupListeners() {
  ipc.answerRenderer<RecordJourneyOptions>('record-journey', onRecordJourneys);
  ipc.answerRenderer<RunJourneyOptions>('run-journey', onTest);
  ipc.answerRenderer<GenerateCodeOptions>('actions-to-code', onGenerateCode);
  ipc.answerRenderer<string>('save-file', onFileSave);
  ipc.answerRenderer<string>('set-mode', onSetMode);
  ipc.answerRenderer<string>('link-to-external', onLinkExternal);
}
