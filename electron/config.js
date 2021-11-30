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

const { join, dirname } = require("path");
const isDev = require("electron-is-dev");
const {
  getExecutablePath,
  getChromeVersion,
} = require("../scripts/install-pw");

/**
 * Electron resources path where all the `extraResources`
 * mentioned in build are copied to on all platforms
 */
const RESOURCES_PATH = process.resourcesPath;
const ROOT_DIR = dirname(__dirname);

/**
 * Journey directory is for storing a dummy file to simulate
 * the suite tests
 */
const JOURNEY_DIR = isDev
  ? join(ROOT_DIR, "journeys")
  : join(RESOURCES_PATH, "journeys");

/**
 * Controls where the browser binaries are available
 * to use it for both recording and testing phase
 */
const PLAYWRIGHT_BROWSERS_PATH = isDev
  ? join(ROOT_DIR, "local-browsers")
  : join(RESOURCES_PATH, "local-browsers");

const defaultExecutablePath = getExecutablePath();
const installedVersion = getChromeVersion();

const EXECUTABLE_PATH = join(
  PLAYWRIGHT_BROWSERS_PATH,
  installedVersion,
  defaultExecutablePath.split(installedVersion)[1]
);

module.exports = {
  JOURNEY_DIR,
  PLAYWRIGHT_BROWSERS_PATH,
  EXECUTABLE_PATH,
  RESOURCES_PATH,
};
