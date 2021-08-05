const { chromium } = require("playwright");
const { join, resolve } = require("path");
const { existsSync } = require("fs");
const SyntheticsGenerator = require("./formatter/synthetics");
const { ipcMain } = require("electron");
const { fork } = require("child_process");
const { EventEmitter } = require("events");

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

function removeColorCodes(str) {
  return str.replace(/\u001b\[.*?m/g, "");
}

/**
 * Record User Journeys
 */
ipcMain.on("record", async (event, data) => {
  const { browser, context } = await launchContext();
  const actionListener = new EventEmitter();
  let actions = [];
  let eraseLastAction = false;
  let lastActionContext = null;
  actionListener.on("action", (actionInContext) => {
    const { action, pageAlias } = actionInContext;
    if (lastActionContext && lastActionContext.pageAlias === pageAlias) {
      const { action: lastAction } = lastActionContext;
      // We augment last action based on the type.
      if (
        lastActionContext &&
        action.name === "fill" &&
        lastAction.name === "fill"
      ) {
        if (action.selector === lastAction.selector) eraseLastAction = true;
      }
      if (
        lastAction &&
        action.name === "click" &&
        lastAction.name === "click"
      ) {
        if (
          action.selector === lastAction.selector &&
          action.clickCount > lastAction.clickCount
        )
          eraseLastAction = true;
      }
      if (
        lastAction &&
        action.name === "navigate" &&
        lastAction.name === "navigate"
      ) {
        if (action.url === lastAction.url) {
          // Already at a target URL.
          this._currentAction = null;
          return;
        }
      }
      for (const name of ["check", "uncheck"]) {
        // Check and uncheck erase click.
        if (lastAction && action.name === name && lastAction.name === "click") {
          if (action.selector === lastAction.selector) eraseLastAction = true;
        }
      }
    }
    lastActionContext = actionInContext;
    if (eraseLastAction) {
      actions.pop();
    } else {
      event.sender.send("action", actionInContext);
    }
    actions.push(actionInContext);
  });

  await context._enableRecorder({
    launchOptions: {},
    contextOptions: {},
    startRecording: true,
    showRecorder: false,
    actionListener: actionListener,
  });
  await openPage(context, data.url);

  browser.on("disconnected", () => {
    const generator = new SyntheticsGenerator();
    const code = generator.generateText(actions);
    event.sender.send("code", code);
    actions = [];
    // fs.writeFileSync(`${JOURNEY_DIR}/recorded.journey.js`, code);
  });

  let closingBrowser = false;
  async function closeBrowser() {
    if (closingBrowser) return;
    closingBrowser = true;
    await browser.close();
  }

  ipcMain.on("stop", async () => await closeBrowser());
});

ipcMain.on("start", async (event, code) => {
  const { stdout, stdin, stderr } = fork(
    `${SYNTHETICS_CLI}`,
    ["--inline", "--no-headless"],
    {
      env: process.env,
      stdio: "pipe",
    }
  );
  stdin.write(code);
  stdin.end();
  stdout.setEncoding("utf-8");
  let data = [];
  for await (const chunk of stdout) {
    data.push(removeColorCodes(chunk));
  }
  for await (const chunk of stderr) {
    data.push(removeColorCodes(chunk));
  }
  event.sender.send("done", data.join(""));
});
