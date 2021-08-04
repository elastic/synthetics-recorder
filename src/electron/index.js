const path = require("path");
const fs = require("fs");
const { fork } = require("child_process");
const { EventEmitter } = require("events");
const { app, BrowserWindow, ipcMain } = require("electron");
const isDev = require("electron-is-dev");
const unhandled = require("electron-unhandled");
const { chromium } = require("playwright");
const SyntheticsGenerator = require("../formatter/synthetics");

unhandled();

const BUILD_DIR = path.join(__dirname, "../../", "build");

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

const syntheticsCli = require.resolve("@elastic/synthetics/dist/cli");
const JOURNEY_DIR = path.join(__dirname, "journeys");

async function createWindow() {
  const win = new BrowserWindow({
    title: "Synthetics Recorder",
    show: false,
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  win.on("ready-to-show", () => {
    win.show();
  });

  ipcMain.on("record", async (event, data) => {
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
      showRecorder: false,
      actionListener: actionListener,
    });

    await openPage(context, data.url);

    browser.on("disconnected", () => {
      const generator = new SyntheticsGenerator();
      // console.log("actions", actions);
      const code = generator.generateText(actions);
      event.sender.send("code", code);

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
  /**
   * Run Test Journeys
   */
  ipcMain.on("start", async (event, code) => {
    const syntheticsProcess = fork(
      `${syntheticsCli}`,
      ["--inline", "--no-headless"],
      {
        env: process.env,
        stdio: "pipe",
      }
    );
    syntheticsProcess.stdin.write(code);
    syntheticsProcess.stdout.on("data", (data) => {
      event.sender.send("done", data.toString());
    });

    syntheticsProcess.stderr.on("data", (data) => {
      event.sender.send("done", data.toString());
    });
    syntheticsProcess.stdin.end();
  });

  isDev
    ? win.loadURL("http://localhost:3000")
    : win.loadFile(path.join(BUILD_DIR, "index.html"));

  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
  }
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.whenReady().then(createWindow).catch(console.error);

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
