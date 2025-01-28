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

const path = require('path');
const fsPromises = require('fs').promises;

const platformDirs = {
  darwin_x64: 'mac/Elastic Synthetics Recorder.app/Contents/Resources',
  darwin_arm64: 'mac-arm64/Elastic Synthetics Recorder.app/Contents/Resources',
  linux_x64: 'linux-unpacked/resources',
  win32_x64: 'win-unpacked/resources',
};
const resourcesSubpath = path.join('app.asar.unpacked', 'node_modules', '@img');
const libNames = {
  darwin_x64: 'darwin-x64',
  darwin_arm64: 'darwin-arm64',
  linux_x64: 'linux-x64',
  win32_x64: 'win32-x64',
};
function sharpBinName(platform, arch) {
  return `sharp-${libNames[formatPlatformArch(platform, arch)]}`;
}
function formatPlatformArch(platform, arch) {
  return `${platform}_${arch}`;
}
async function dirExist(path) {
  try {
    await fsPromises.access(path);
  } catch (_err) {
    return false;
  }
  return true;
}

// This script is called during the build process to ensure that if sharp binary dependencies are present in node_modules but have
// not been copied, they will be forcibly included in the package for the appropriate platform.
exports.default = async function checkSharpResources(ctx) {
  const platform = ctx.platform.nodeName;
  const { arch } = ctx;
  const resourcePath = path.join(
    __dirname,
    '..',
    'dist',
    platformDirs[formatPlatformArch(platform, arch)],
    resourcesSubpath
  );
  const rootNodeModules = path.join(__dirname, '..', 'node_modules', '@img');

  if (!(await dirExist(resourcePath))) {
    await fsPromises.mkdir(resourcePath, { recursive: true });
  }

  const contents = await fsPromises.readdir(resourcePath);
  if (!contents.some(file => file === sharpBinName(platform, arch))) {
    if (await dirExist(rootNodeModules)) {
      const rootContents = await fsPromises.readdir(rootNodeModules);
      const contentsSet = new Set(contents);
      const toCopy = rootContents.filter(file => !contentsSet.has(file));

      for (const file of toCopy) {
        const sourcePath = path.join(rootNodeModules, file);
        await fsPromises.cp(sourcePath, path.join(resourcePath, file), {
          recursive: true,
          force: false,
        });
      }
    }
  }
};
