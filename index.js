const path = require("path");
const fs = require("fs");
const { EventEmitter } = require("events");
const { app, BrowserWindow, ipcMain } = require("electron");
const { run } = require("@elastic/synthetics");
const unhandled = require("electron-unhandled");
const debug = require("electron-debug");
const { chromium } = require("playwright");

unhandled();
debug();

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
    actionListener.on("action", (action) => {
      console.log("Listening action", action);
      event.sender.send("action", action);
    });
    await context._enableRecorder({
      launchOptions: {},
      contextOptions: {},
      startRecording: true,
      listener: actionListener,
    });

    await openPage(context, "https://vigneshh.in");

    ipcMain.on("stop", async (event) => {
      await browser.close();
    });
  });
  /**
   * Run Test Journeys
   */
  ipcMain.on("start", async (event, data) => {
    /**
     * Load journeys
     */
    require("./journeys/basic.journey");
    const results = await run({
      outfd: process.stdout.fd,
    });
    event.sender.send("done", results);
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
