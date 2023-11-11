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
const {
  downloadBrowserWithProgressBar,
} = require('playwright-core/lib/server/registry/browserFetcher');
const { getChromeVersion } = require('./install-pw');
const fs = require('fs/promises');

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

async function download(platform, arch, revision, directory) {
  const platformAndArch = `${platform}-${arch}`;
  const executablePath = findExecutablePath(directory, platform);
  const downloadHost =
    process.env['PLAYWRIGHT_DOWNLOAD_HOST'] || 'https://playwright.azureedge.net';
  const url = DOWNLOAD_URLS[platformAndArch] ?? DOWNLOAD_URLS[platform];
  const downloadURL = util.format(url, downloadHost, revision);
  const title = `chromium v${revision} for ${platformAndArch}`;
  const downloadFileName = `playwright-download-chromium-${platformAndArch}-${revision}.zip`;
  try {
    if (executablePath == null) {
      throw new Error('Executable path for playwright browser not found');
    }
    // eslint-disable-next-line no-console
    console.info('Downloading browser ', title);
    const downloadConnectionTimeout = 60_000;
    await downloadBrowserWithProgressBar(
      title,
      directory,
      executablePath,
      [downloadURL],
      downloadFileName,
      downloadConnectionTimeout
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

exports.downloadForPlatform = async function downloadForPlatform(electron_platform, arch) {
  const platform = translatePlatform(electron_platform);
  const [, revision] = getChromeVersion().split('-');
  const directory = path.join(
    process.cwd(),
    'local-browsers',
    '_releases',
    `${platform}-${arch}`,
    getChromeVersion()
  );
  await download(platform, arch, revision, directory);
  setPermissions(directory);
};

async function setPermissions(directory) {
  let files = [];
  try {
    files = await fs.readdir(directory);
  } catch (err) {
    if (err) {
      // eslint-disable-next-line no-console
      console.error(`Error reading directory ${directory}: ${err}`);
      return;
    }
  }

  for (const file of files) {
    const filePath = path.join(directory, file);
    let stats;
    try {
      stats = await fs.stat(filePath);
    } catch (err) {
      if (err) {
        // eslint-disable-next-line no-console
        console.error(`Cannot access file ${filePath}: ${err}`);
        return;
      }
    }
    if (stats.isDirectory()) {
      setPermissions(filePath);
    } else {
      let permissionsOk = true;
      try {
        await fs.access(filePath, fs.constants.R_OK | fs.constants.W_OK);
      } catch (_e) {
        permissionsOk = false;
      }
      if (!permissionsOk) {
        try {
          // eslint-disable-next-line no-console
          console.log(`Updating permissions: ${filePath}`);
          return fs.chmod(filePath, 0o755);
        } catch (_err) {
          // eslint-disable-next-line no-console
          console.error(`Could not update permissions for "${filePath}", build may fail`);
        }
      }
    }
  }
}
