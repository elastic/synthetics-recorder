const { chromium } = require("playwright");
const { join, resolve } = require("path");
const { existsSync } = require("fs");
const { writeFile, rm } = require("fs/promises");
const { ipcMain: ipc } = require("electron-better-ipc");
const { fork } = require("child_process");
const { EventEmitter, once } = require("events");
const { dialog, BrowserWindow } = require("electron");
const logger = require("electron-timber");
const SyntheticsGenerator = require("./formatter/synthetics");

const SYNTHETICS_CLI = require.resolve("@elastic/synthetics/dist/cli");
const JOURNEY_DIR = join(__dirname, "..", "journeys");

async function launchContext() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();

  let closingBrowser = false;
  async function closeBrowser() {
    if (closingBrowser) return;
    closingBrowser = true;
    await browser.close();
  }

  context.on("page", (page) => {
    page.on("dialog", () => {});
    page.on("close", () => {
      const hasPage = browser
        .contexts()
        .some((context) => context.pages().length > 0);
      if (hasPage) return;
      closeBrowser().catch((e) => null);
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

function removeColorCodes(str = "") {
  return str.replace(/\u001b\[.*?m/g, "");
}

let browserContext = null;
async function recordJourneys(data, browserWindow) {
  const { browser, context } = await launchContext();
  browserContext = context;
  const actionListener = new EventEmitter();
  actionListener.on("actions", (actions) => {
    ipc.callRenderer(browserWindow, "change", { actions });
  });

  actionListener.on("selector", (selector) => {
    ipc.callRenderer(browserWindow, "received-selector", selector);
  });

  await context._enableRecorder({
    launchOptions: {},
    contextOptions: {},
    startRecording: true,
    showRecorder: false,
    actionListener: actionListener,
  });
  await openPage(context, data.url);

  let closingBrowser = false;
  async function closeBrowser() {
    if (closingBrowser) return;
    closingBrowser = true;
    await browser.close();
    browserContext = null;
  }
  ipc.on("stop", closeBrowser);
  await once(browser, "disconnected");
}

async function onTest(data) {
  try {
    const isSuite = data.isSuite;
    const args = ["--no-headless"];
    const filePath = join(JOURNEY_DIR, "recorded.journey.js");
    if (!isSuite) {
      args.push("--inline");
    } else {
      await writeFile(filePath, data.code);
      args.unshift(filePath);
    }
    const { stdout, stdin, stderr } = fork(`${SYNTHETICS_CLI}`, args, {
      env: process.env,
      stdio: "pipe",
    });
    if (!isSuite) {
      stdin.write(data.code);
      stdin.end();
    }
    stdout.setEncoding("utf-8");
    stderr.setEncoding("utf-8");
    let chunks = [];
    for await (const chunk of stdout) {
      chunks.push(removeColorCodes(chunk));
    }
    for await (const chunk of stderr) {
      chunks.push(removeColorCodes(chunk));
    }
    if (isSuite) {
      await rm(filePath, { recursive: true, force: true });
    }
    return chunks.join("");
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
  if (browserContext) {
    const page = browserContext.pages()[0];
    await page.mainFrame().evaluate(
      ([mode]) => {
        window._playwrightSetMode(mode);
      },
      [mode]
    );
  }
}

function setupListeners() {
  ipc.answerRenderer("record-journey", recordJourneys);
  ipc.answerRenderer("run-journey", onTest);
  ipc.answerRenderer("save-file", onFileSave);
  ipc.answerRenderer("actions-to-code", onTransformCode);
  ipc.answerRenderer("set-mode", onSetMode);
}

module.exports = setupListeners;
