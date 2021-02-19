const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { EventEmitter } = require("events");
const { app, BrowserWindow, ipcMain } = require("electron");
const { run } = require("@elastic/synthetics");
const unhandled = require("electron-unhandled");
const debug = require("electron-debug");
const { chromium } = require("playwright");
const SyntheticsGenerator = require("./formatter/synthetics");

unhandled();
// debug();

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
    if (fs.existsSync(url)) url = "file://" + path.resolve(url);
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

// Prevent window from being garbage collected
let mainWindow;
const JOURNEY_DIR = path.join(__dirname, "journeys");

async function createWindow() {
  const win = new BrowserWindow({
    title: "Synthetics Recorder",
    show: false,
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  win.on("ready-to-show", () => {
    win.show();
  });
  win.on("closed", () => {
    mainWindow = null;
  });

  ipcMain.on("record", async (event) => {
    const { browser, context } = await launchContext();
    const actionListener = new EventEmitter();
    const actions = [];
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
          if (
            lastAction &&
            action.name === name &&
            lastAction.name === "click"
          ) {
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
      listener: actionListener,
    });

    await openPage(context, "https://elastic.co");

    browser.on("disconnected", () => {
      const generator = new SyntheticsGenerator();
      // console.log("actions", actions);
      const text = generator.generateText(actions);
      // console.log(text);

      fs.writeFileSync(`${JOURNEY_DIR}/recorded.journey.js`, text);
    });

    let closingBrowser = false;
    async function closeBrowser() {
      if (closingBrowser) return;
      closingBrowser = true;
      await browser.close();
    }

    ipcMain.on("stop", async () => await closeBrowser());
  });
  /**
   * Run Test Journeys
   */
  ipcMain.on("start", async (event, data) => {
    const syntheticsProcess = spawn(
      "npx",
      ["@elastic/synthetics", `${JOURNEY_DIR}`, "--no-headless"],
      {
        env: process.env,
        stdio: "pipe",
      }
    );
    syntheticsProcess.stdout.on("data", (data) => {
      event.sender.send("done", data.toString());
    });

    syntheticsProcess.stderr.on("data", (data) => {
      event.sender.send("done", data.toString());
    });
  });

  await win.loadFile(path.join(__dirname, "index.html"));
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.whenReady().then(createWindow).catch(console.error);

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});
