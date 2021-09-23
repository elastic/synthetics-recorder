const { chromium } = require("playwright");
const { join, resolve } = require("path");
const { existsSync } = require("fs");
const { writeFile, rm } = require("fs/promises");
const { ipcMain: ipc } = require("electron-better-ipc");
const { EventEmitter, once } = require("events");
const { dialog, BrowserWindow } = require("electron");
const logger = require("electron-log");
const { run, journey, step, expect } = require("@elastic/synthetics");
const {
  SyntheticsGenerator,
} = require("@elastic/synthetics/dist/formatter/javascript");
const {
  getExecutablePath,
  getChromeVersion,
} = require("../scripts/install-pw");

const JOURNEY_DIR = join(__dirname, "..", "journeys");
const PLAYWRIGHT_BROWSERS_PATH =
  process.env.PLAYWRIGHT_BROWSERS_PATH || "local-browsers";

const configuredExetutablePath = getExecutablePath();
const installedVersion = getChromeVersion();

logger.info("Executable path before ", configuredExetutablePath);

const executablePath = join(
  __dirname,
  PLAYWRIGHT_BROWSERS_PATH,
  installedVersion,
  configuredExetutablePath.split(installedVersion)[1]
);

logger.info("Executable path after ", executablePath);

function loadInlineJourney(source) {
  const scriptFn = new Function(
    "step",
    "page",
    "context",
    "browser",
    "params",
    "expect",
    source
  );
  journey("recorded journey", async ({ page, context, browser, params }) => {
    scriptFn.apply(null, [step, page, context, browser, params, expect]);
  });
}

async function launchContext() {
  const browser = await chromium.launch({ headless: false, executablePath });
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

    async function closeBrowser() {
      browserContext = null;
      await browser.close().catch({});
    }
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
    total: 0,
    journeys: {},
  };
  class Reporter {
    constructor(runner) {
      runner.on("journey:start", ({ journey }) => {
        result.journeys[journey.name] = { status: "succeeded", steps: [] };
      });
      runner.on("step:end", ({ journey, step, end, start, status, error }) => {
        result[status]++;
        result.journeys[journey.name].steps.push({
          name: step.name,
          status,
          error,
          duration: Math.ceil((end - start) * 1000),
        });
      });
      runner.on("journey:end", ({ journey, status }) => {
        result.journeys[journey.name].status = status;
      });
      runner.on("end", () => {
        const { failed, succeeded, skipped } = result;
        result.total = failed + succeeded + skipped;
      });
    }
  }

  try {
    const isSuite = data.isSuite;
    const journeyPath = join(JOURNEY_DIR, `recorded-${Date.now()}.journey.js`);

    if (!isSuite) {
      data.code && loadInlineJourney(data.code);
    } else {
      await writeFile(journeyPath, data.code);
      require(journeyPath);
    }

    await run({
      reporter: Reporter,
      screenshots: "off",
      playwrightOptions: {
        headless: false,
        executablePath,
      },
    });
    if (isSuite) {
      await rm(journeyPath, { recursive: true, force: true });
    }
    return result;
  } catch (err) {
    logger.error(err);
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

function setupListeners() {
  ipc.answerRenderer("record-journey", recordJourneys);
  ipc.answerRenderer("run-journey", onTest);
  ipc.answerRenderer("save-file", onFileSave);
  ipc.answerRenderer("actions-to-code", onTransformCode);
  ipc.answerRenderer("set-mode", onSetMode);
}

module.exports = setupListeners;
