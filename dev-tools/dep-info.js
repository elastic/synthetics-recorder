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

const { join } = require('path');
const { readFileSync, writeFileSync, readdirSync } = require('fs');
const { request } = require('undici');

const ROOT_DIR = join(__dirname, '../');
const ROOT_NODE_MODULES = join(ROOT_DIR, 'node_modules');
const CHROMIUM_LICENSE_URL =
  'https://chromium.googlesource.com/chromium/src/+/refs/heads/main/LICENSE?format=TEXT';

function safeReadDirSync(directory) {
  let files = [];
  try {
    files = readdirSync(directory);
  } catch (_) {
    // do nothing
  }
  return files;
}

function getFileContent(directory, filename) {
  const files = safeReadDirSync(directory);

  const file = files.find(f => f.toLowerCase().startsWith(filename.toLowerCase()));
  let content;
  if (file) {
    content = readFileSync(join(directory, file), 'utf8');
  }
  return content;
}

function generateDependencyInfo(deps) {
  var allLicenses = [];
  deps.forEach(d => {
    // we download forked `playwright-core` as playwright. The directory doesn't include NOTICE nor LICENSE
    // so we need to copy over from the official playwright-core package downloaded for synthetics agent.
    if (d === 'playwright') {
      d = 'playwright-core';
    }

    const modulesPath = join(ROOT_NODE_MODULES, d);

    const dep = { name: d };

    const license = getFileContent(modulesPath, 'LICENSE');
    if (license) {
      dep.license = license;
    }

    const notice = getFileContent(modulesPath, 'NOTICE');
    if (notice) {
      dep.notice = notice;
    }

    allLicenses.push(dep);
  });
  return allLicenses;
}

function getPackageInfo(pkgDir) {
  const { name, dependencies = {} } = JSON.parse(
    readFileSync(join(pkgDir, 'package.json'), 'utf8')
  );
  return { name, dependencies };
}

async function getChromiumInfo() {
  const { statusCode, body } = await request(CHROMIUM_LICENSE_URL);
  const bodyStr = await body.text();
  if (statusCode !== 200) {
    throw new Error(
      `Failed to fetch chromium license info. status: ${statusCode}, reason: ${bodyStr}`
    );
  }
  const license = Buffer.from(bodyStr, 'base64').toString('utf-8');
  return { name: 'chromium', license };
}

async function generateNotice() {
  const { name: pkgName, dependencies } = getPackageInfo(ROOT_DIR);
  const chromiumInfo = await getChromiumInfo();
  const depInfo = [chromiumInfo, ...generateDependencyInfo(Object.keys(dependencies))];
  let allLicenses = `
${pkgName}
Copyright (c) 2021-present, Elasticsearch BV

`;
  depInfo.forEach(d => {
    if (d.license || d.notice) {
      allLicenses += `
---
This product relies on ${d.name}

${d.license ? d.license : ''}

${d.notice ? d.notice : ''}`;
    }
  });
  writeFileSync(join(ROOT_DIR, './NOTICE.txt'), allLicenses);
  // eslint-disable-next-line no-console
  console.info('NOTICE.txt file is up-to-date');
}

generateNotice()
  // eslint-disable-next-line no-console
  .catch(error => console.error('Failed to generate NOTICE.txt', { error }));
