import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
import type { BrowserContext } from 'playwright-core';

import path from 'path';
import { EventEmitter, once } from 'events';
import { existsSync } from 'fs';
import { chromium } from 'playwright';
import logger from 'electron-log';
import { ActionInContext } from '../../common/types';
import { EXECUTABLE_PATH } from '../config';

const IS_TEST_ENV = process.env.NODE_ENV === 'test';
const CDP_TEST_PORT = parseInt(process.env.TEST_PORT ?? '61337') + 1;

let browserContext: BrowserContext | null = null;
let actionListener = new EventEmitter();

export function onRecordJourneys(mainWindowEmitter: EventEmitter, isBrowserRunning: boolean) {
    return async function (_event, url) {
    const browserWindow = BrowserWindow.getFocusedWindow()!;
      if (isBrowserRunning) {
        throw new Error(
          'Cannot start recording a journey, a browser operation is already in progress.'
        );
      }
      mainWindowEmitter.emit('browser-started');
      try {
        const { browser, context } = await launchContext();
        const closeBrowser = async () => {
          browserContext = null;
          actionListener.removeListener('actions', actionsHandler);
          try {
            await browser.close();
          } catch (e) {
            logger.error('Browser close threw an error', e);
          }
        };
        ipcMain.addListener('stop-recording', closeBrowser);
        // Listen to actions from Playwright recording session
        const actionsHandler = (actions: ActionInContext[]) => {
          // ipcMain.callRenderer(browserWindow, 'change', { actions });
          browserWindow.webContents.send('change', actions);
        };
        browserContext = context;
        actionListener = new EventEmitter();
        actionListener.on('actions', actionsHandler);
  
        const handleMainClose = () => {
          actionListener.removeAllListeners();
          ipcMain.removeListener('stop-recording', closeBrowser);
          browser.close().catch(() => {
            // isBrowserRunning = false;
            mainWindowEmitter.emit('browser-stopped');
          });
        };
  
        mainWindowEmitter.addListener('main-close', handleMainClose);
  
        // _enableRecorder is private method, not defined in BrowserContext type
        await (context as any)._enableRecorder({
          launchOptions: {},
          contextOptions: {},
          mode: 'recording',
          showRecorder: false,
          actionListener,
        });
        await openPage(context, url);
        await once(browser, 'disconnected');
  
        mainWindowEmitter.removeListener('main-close', handleMainClose);
      } catch (e) {
        logger.error(e);
      } finally {
        // isBrowserRunning = false;
        mainWindowEmitter.emit('browser-stopped');
      }
    };
  }
  

async function launchContext() {
  const browser = await chromium.launch({
    headless: IS_TEST_ENV,
    executablePath: EXECUTABLE_PATH,
    chromiumSandbox: true,
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
      if (existsSync(url)) url = 'file://' + path.resolve(url);
      else if (!url.startsWith('http') && !url.startsWith('file://') && !url.startsWith('about:'))
        url = 'http://' + url;
      await page.goto(url);
    }
    return page;
  }

// TODO: fix pause. it keeps recording
export async function onSetMode(_event: IpcMainInvokeEvent, mode: string) {
    if (!browserContext) return;
    const page = browserContext.pages()[0];
    if (!page) return;
    await page.mainFrame().evaluate(
      ([mode]) => {
        // `_playwrightSetMode` is a private function
        (window as any).__pw_setMode(mode);
      },
      [mode]
    );
    if (mode !== 'inspecting') return;
    const [selector] = await once(actionListener, 'selector');
    return selector;
  }
