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

require('dotenv').config();

const util = require('util');
const path = require('path');
const { downloadBrowserWithProgressBar } = require('playwright/lib/utils/browserFetcher');
const { getChromeVersion } = require('./install-pw');

const EXECUTABLE_PATHS = {
  linux: ['chrome-linux', 'chrome'],
  mac: ['chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium'],
  win: ['chrome-win', 'chrome.exe'],
};

const DOWNLOAD_URLS = {
  linux: '%s/builds/chromium/%s/chromium-linux.zip',
  mac: '%s/builds/chromium/%s/chromium-mac.zip',
  win: '%s/builds/chromium/%s/chromium-win64.zip',
  'mac-arm64': '%s/builds/chromium/%s/chromium-mac-arm64.zip',
};

async function download(platform, revision, directory) {
  const executablePath = findExecutablePath(directory, platform);
  const downloadHost =
    process.env['PLAYWRIGHT_DOWNLOAD_HOST'] || 'https://playwright.azureedge.net';
  const downloadURL = util.format(DOWNLOAD_URLS[platform], downloadHost, revision);
  const title = `chromium v${revision} for ${platform}`;
  const downloadFileName = `playwright-download-chromium-${platform}-${revision}.zip`;
  try {
    // eslint-disable-next-line no-console
    console.info('Downloading browser ', title);
    await downloadBrowserWithProgressBar(
      title,
      directory,
      executablePath,
      downloadURL,
      downloadFileName
    );
  } catch (e) {
    throw new Error(`Failed to download ${title}, caused by\n${e.stack}`);
  }
}

function findExecutablePath(dir, platform) {
  const tokens = EXECUTABLE_PATHS[platform];
  return tokens ? path.join(dir, ...tokens) : undefined;
}

function translatePlatform(platform) {
  switch (platform) {
    case 'win32':
      return 'win';
    case 'darwin':
      return 'mac';
    default:
      return platform;
  }
}

exports.downloadForPlatform = async function downloadForPlatform(platform) {
  platform = translatePlatform(platform);
  const [, revision] = getChromeVersion().split('-');
  const directory = path.join(
    process.cwd(),
    'local-browsers',
    '_releases',
    platform,
    getChromeVersion()
  );
  await download(platform, revision, directory);
};
