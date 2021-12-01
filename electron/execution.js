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

const { chromium } = require("playwright");
const { join, resolve } = require("path");
const { existsSync } = require("fs");
const { writeFile, rm, mkdir } = require("fs/promises");
const { ipcMain: ipc } = require("electron-better-ipc");
const { EventEmitter, once } = require("events");
const { dialog, shell, BrowserWindow } = require("electron");
const { fork } = require("child_process");
const logger = require("electron-log");
const isDev = require("electron-is-dev");
const {
  SyntheticsGenerator,
} = require("@elastic/synthetics/dist/formatter/javascript");
const SYNTHETICS_CLI = require.resolve("@elastic/synthetics/dist/cli");
const {
  JOURNEY_DIR,
  PLAYWRIGHT_BROWSERS_PATH,
  EXECUTABLE_PATH,
} = require("./config");

async function launchContext() {
  const browser = await chromium.launch({
    headless: false,
    executablePath: EXECUTABLE_PATH,
  });
  const context = await browser.newContext();

  let closingBrowser = false;
  async function closeBrowser() {
    if (closingBrowser) return;
    closingBrowser = true;
    await browser.close();
  }

  context.on("page", page => {
    page.on("dialog", () => {});
    page.on("close", () => {
      const hasPage = browser
        .contexts()
        .some(context => context.pages().length > 0);
      if (hasPage) return;
      closeBrowser().catch(e => null);
    });
  });
  return { browser, context };
}

async function openPage(context, url) {
  const page = await context.newPage();
  if (url) {
    if (existsSync(url)) url = "file://" + resolve(url);
    else if (
      !url.startsWith("http") &&
      !url.startsWith("file://") &&
      !url.startsWith("about:")
    )
      url = "http://" + url;
    await page.goto(url);
  }
  return page;
}

let browserContext = null;
let actionListener = new EventEmitter();

async function recordJourneys(data, browserWindow) {
  try {
    const { browser, context } = await launchContext();
    browserContext = context;
    actionListener = new EventEmitter();
    // Listen to actions from Playwright recording session
    actionListener.on("actions", actions => {
      ipc.callRenderer(browserWindow, "change", { actions });
    });

    await context._enableRecorder({
      launchOptions: {},
      contextOptions: {},
      startRecording: true,
      showRecorder: false,
      actionListener,
    });
    await openPage(context, data.url);

    const closeBrowser = async () => {
      browserContext = null;
      await browser.close().catch({});
    };

    ipc.on("stop", closeBrowser);

    await once(browser, "disconnected");
  } catch (e) {
    logger.error(e);
  }
}

async function onTest(data) {
  const result = {
    succeeded: 0,
    failed: 0,
    skipped: 0,
    journeys: {},
  };

  const parseOrSkip = chunk => {
    try {
      return JSON.parse(chunk);
    } catch (_) {
      return {};
    }
  };
  const constructResult = chunk => {
    const parsed = parseOrSkip(chunk);
    switch (parsed.type) {
      case "journey/start": {
        const { journey } = parsed;
        result.journeys[journey.name] = { status: "succeeded", steps: [] };
        break;
      }
      case "step/end": {
        const { journey, step, error } = parsed;
        result[step.status]++;
        result.journeys[journey.name].steps.push({
          name: step.name,
          status: step.status,
          error,
          duration: Math.ceil(step.duration.us / 1000),
        });
        break;
      }
      case "journey/end": {
        const { journey } = parsed;
        result.journeys[journey.name].status = journey.status;
        break;
      }
    }
  };

  try {
    const isSuite = data.isSuite;
    const args = [
      "--no-headless",
      "--reporter=json",
      "--screenshots=off",
      "--no-throttling",
    ];
    const filePath = join(JOURNEY_DIR, "recorded.journey.js");
    if (!isSuite) {
      args.push("--inline");
    } else {
      await mkdir(JOURNEY_DIR).catch(() => {});
      await writeFile(filePath, data.code);
      args.unshift(filePath);
    }
    /**
     * Fork the Synthetics CLI with correct browser path and
     * cwd correctly spanws the process
     */
    const { stdout, stdin, stderr } = fork(`${SYNTHETICS_CLI}`, args, {
      env: {
        PLAYWRIGHT_BROWSERS_PATH,
      },
      cwd: isDev ? process.cwd() : process.resourcesPath,
      stdio: "pipe",
    });
    if (!isSuite) {
      stdin.write(data.code);
      stdin.end();
    }
    stdout.setEncoding("utf-8");
    stderr.setEncoding("utf-8");
    for await (const chunk of stdout) {
      constructResult(chunk);
    }
    for await (const chunk of stderr) {
      logger.error(chunk);
    }
    if (isSuite) {
      await rm(filePath, { recursive: true, force: true });
    }
    return result;
  } catch (err) {
    logger.error(err);
    return result;
  }
}

async function onFileSave(code) {
  const { filePath, canceled } = await dialog.showSaveDialog(
    BrowserWindow.getFocusedWindow(),
    {
      defaultPath: "recorded.journey.js",
    }
  );

  if (!canceled) {
    await writeFile(filePath, code);
    return true;
  }
  return false;
}

async function onTransformCode(data) {
  const generator = new SyntheticsGenerator(data.isSuite);
  const code = generator.generateText(data.actions);
  return code;
}

async function onSetMode(mode) {
  if (!browserContext) return;
  const page = browserContext.pages()[0];
  if (!page) return;
  await page.mainFrame().evaluate(
    ([mode]) => {
      window._playwrightSetMode(mode);
    },
    [mode]
  );
  if (mode !== "inspecting") return;
  const [selector] = await once(actionListener, "selector");
  return selector;
}

async function onLinkExternal(url) {
  try {
    await shell.openExternal(url);
  } catch (e) {
    logger.error(e);
  }
}

function setupListeners() {
  ipc.answerRenderer("record-journey", recordJourneys);
  ipc.answerRenderer("run-journey", onTest);
  ipc.answerRenderer("save-file", onFileSave);
  ipc.answerRenderer("actions-to-code", onTransformCode);
  ipc.answerRenderer("set-mode", onSetMode);
  ipc.answerRenderer("link-to-external", onLinkExternal);
}

module.exports = setupListeners;
