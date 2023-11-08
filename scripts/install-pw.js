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

// Load the process.env config from .env file
require('dotenv').config();
const { Registry } = require('playwright-core/lib/server');
// npm >=7 has workspaces enabled by default
// Therefore playwright-core, dependency of @elastic/synthetics,
// is downloaded to top-level `node_modules` rather than `@elastic/synthetics/node_modules`
const PLAYWRIGHT_CORE_PATH = require.resolve('playwright-core');
const BROWSER_PATH = PLAYWRIGHT_CORE_PATH.replace('index.js', 'browsers.json');
const SYNTHETICS_BROWSER_REVISIONS = require(BROWSER_PATH);
/**
 * Constructs the Registry with browsers that will be used
 * to download the chromium version required by the synthetics version
 */
const registry = new Registry(SYNTHETICS_BROWSER_REVISIONS);

module.exports.getChromeVersion = function () {
  const { browsers } = SYNTHETICS_BROWSER_REVISIONS;
  const revision = browsers.find(browser => browser.name === 'chromium').revision;
  return `chromium-${revision}`;
};

module.exports.getExecutablePath = function (browserName = 'chromium') {
  return registry.findExecutable(browserName).executablePath();
};

(async () => {
  if (require.main === module) {
    try {
      const executable = registry.findExecutable('chromium');
      await registry.install([executable]);
      // eslint-disable-next-line no-console
      console.log('Installation complete');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      process.exit(1);
    }
  }
})();
