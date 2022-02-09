"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_1 = require("playwright");
const path_1 = require("path");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const electron_better_ipc_1 = require("electron-better-ipc");
const events_1 = require("events");
const electron_1 = require("electron");
const child_process_1 = require("child_process");
const electron_log_1 = __importDefault(require("electron-log"));
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
const javascript_1 = require("@elastic/synthetics/dist/formatter/javascript");
const SYNTHETICS_CLI = require.resolve("@elastic/synthetics/dist/cli");
const config_1 = require("./config");
const IS_TEST_ENV = process.env.NODE_ENV === "test";
const CDP_TEST_PORT = parseInt(process.env.TEST_PORT ?? '61337') + 1;
async function launchContext() {
    const browser = await playwright_1.chromium.launch({
        headless: IS_TEST_ENV,
        executablePath: config_1.EXECUTABLE_PATH,
        args: IS_TEST_ENV ? [`--remote-debugging-port=${CDP_TEST_PORT}`] : [],
    });
    const context = await browser.newContext();
    let closingBrowser = false;
    async function closeBrowser() {
        if (closingBrowser)
            return;
        closingBrowser = true;
        await browser.close();
    }
    context.on("page", page => {
        page.on("dialog", () => { });
        page.on("close", () => {
            const hasPage = browser
                .contexts()
                .some(context => context.pages().length > 0);
            if (hasPage)
                return;
            closeBrowser().catch(_e => null);
        });
    });
    return { browser, context };
}
async function openPage(context, url) {
    const page = await context.newPage();
    if (url) {
        if ((0, fs_1.existsSync)(url))
            url = "file://" + (0, path_1.resolve)(url);
        else if (!url.startsWith("http") &&
            !url.startsWith("file://") &&
            !url.startsWith("about:"))
            url = "http://" + url;
        await page.goto(url);
    }
    return page;
}
let browserContext = null;
let actionListener = new events_1.EventEmitter();
async function recordJourneys(data, browserWindow) {
    try {
        const { browser, context } = await launchContext();
        browserContext = context;
        actionListener = new events_1.EventEmitter();
        // Listen to actions from Playwright recording session
        const actionsHandler = actions => {
            electron_better_ipc_1.ipcMain.callRenderer(browserWindow, "change", { actions });
        };
        actionListener.on("actions", actionsHandler);
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
            actionListener.removeListener("actions", actionsHandler);
            await browser.close().catch(_err => { });
        };
        electron_better_ipc_1.ipcMain.on("stop", closeBrowser);
        await (0, events_1.once)(browser, "disconnected");
    }
    catch (e) {
        electron_log_1.default.error(e);
    }
}
async function onTest(data) {
    const result = {
        succeeded: 0,
        failed: 0,
        skipped: 0,
        journey: {
            status: "succeeded",
            steps: [],
            type: "inline"
        },
    };
    const parseOrSkip = chunk => {
        try {
            return JSON.parse(chunk);
        }
        catch (_) {
            return {};
        }
    };
    const constructResult = chunk => {
        const parsed = parseOrSkip(chunk);
        switch (parsed.type) {
            case "journey/start": {
                const { journey } = parsed;
                result.journey = {
                    status: "succeeded",
                    steps: [],
                    type: journey.name,
                };
                break;
            }
            case "step/end": {
                const { step, error } = parsed;
                result[step.status]++;
                result.journey.steps.push({
                    name: step.name,
                    status: step.status,
                    error,
                    duration: Math.ceil(step.duration.us / 1000),
                });
                break;
            }
            case "journey/end": {
                const { journey } = parsed;
                result.journey.status = journey.status;
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
        const filePath = (0, path_1.join)(config_1.JOURNEY_DIR, "recorded.journey.js");
        if (!isSuite) {
            args.push("--inline");
        }
        else {
            await (0, promises_1.mkdir)(config_1.JOURNEY_DIR).catch(() => { });
            await (0, promises_1.writeFile)(filePath, data.code);
            args.unshift(filePath);
        }
        /**
         * Fork the Synthetics CLI with correct browser path and
         * cwd correctly spanws the process
         */
        const { stdout, stdin, stderr } = (0, child_process_1.fork)(`${SYNTHETICS_CLI}`, args, {
            env: {
                PLAYWRIGHT_BROWSERS_PATH: config_1.PLAYWRIGHT_BROWSERS_PATH,
            },
            cwd: electron_is_dev_1.default ? process.cwd() : process.resourcesPath,
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
            electron_log_1.default.error(chunk);
        }
        if (isSuite) {
            await (0, promises_1.rm)(filePath, { recursive: true, force: true });
        }
        return result;
    }
    catch (err) {
        electron_log_1.default.error(err);
        return result;
    }
}
async function onFileSave(code) {
    const { filePath, canceled } = await electron_1.dialog.showSaveDialog(electron_1.BrowserWindow.getFocusedWindow(), {
        defaultPath: "recorded.journey.js",
    });
    if (!canceled) {
        await (0, promises_1.writeFile)(filePath, code);
        return true;
    }
    return false;
}
async function onTransformCode(data) {
    const generator = new javascript_1.SyntheticsGenerator(data.isSuite);
    const code = generator.generateText(data.actions);
    return code;
}
async function onSetMode(mode) {
    if (!browserContext)
        return;
    const page = browserContext.pages()[0];
    if (!page)
        return;
    await page.mainFrame().evaluate(([mode]) => {
        window._playwrightSetMode(mode);
    }, [mode]);
    if (mode !== "inspecting")
        return;
    const [selector] = await (0, events_1.once)(actionListener, "selector");
    return selector;
}
async function onLinkExternal(url) {
    try {
        await electron_1.shell.openExternal(url);
    }
    catch (e) {
        electron_log_1.default.error(e);
    }
}
function setupListeners() {
    electron_better_ipc_1.ipcMain.answerRenderer("record-journey", recordJourneys);
    electron_better_ipc_1.ipcMain.answerRenderer("run-journey", onTest);
    electron_better_ipc_1.ipcMain.answerRenderer("save-file", onFileSave);
    electron_better_ipc_1.ipcMain.answerRenderer("actions-to-code", onTransformCode);
    electron_better_ipc_1.ipcMain.answerRenderer("set-mode", onSetMode);
    electron_better_ipc_1.ipcMain.answerRenderer("link-to-external", onLinkExternal);
}
exports.default = setupListeners;
