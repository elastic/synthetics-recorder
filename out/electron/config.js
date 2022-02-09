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
exports.EXECUTABLE_PATH = exports.PLAYWRIGHT_BROWSERS_PATH = exports.JOURNEY_DIR = exports.RESOURCES_PATH = void 0;
const path_1 = require("path");
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
const install_pw_1 = require("../scripts/install-pw");
/**
 * Electron resources path where all the `extraResources`
 * mentioned in build are copied to on all platforms
 */
exports.RESOURCES_PATH = process.resourcesPath;
const ROOT_DIR = process.cwd(); // dirname(process.cwd());
/**
 * Journey directory is for storing a dummy file to simulate
 * the suite tests
 */
exports.JOURNEY_DIR = electron_is_dev_1.default
    ? (0, path_1.join)(ROOT_DIR, "journeys")
    : (0, path_1.join)(exports.RESOURCES_PATH, "journeys");
/**
 * Controls where the browser binaries are available
 * to use it for both recording and testing phase
 */
exports.PLAYWRIGHT_BROWSERS_PATH = electron_is_dev_1.default
    ? (0, path_1.join)(ROOT_DIR, "local-browsers")
    : (0, path_1.join)(exports.RESOURCES_PATH, "local-browsers");
const defaultExecutablePath = (0, install_pw_1.getExecutablePath)();
const installedVersion = (0, install_pw_1.getChromeVersion)();
exports.EXECUTABLE_PATH = (0, path_1.join)(exports.PLAYWRIGHT_BROWSERS_PATH, installedVersion, defaultExecutablePath.split(installedVersion)[1]);
