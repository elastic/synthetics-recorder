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

function libvipsBinName(platform, arch) {
  return `sharp-libvips-${libNames[formatPlatformArch(platform, arch)]}`;
}
function formatPlatformArch(platform, arch) {
  return `${platform}_${arch}`;
}
async function dirExist(path, name) {
  try {
    await fsPromises.access(path);
    console.info(`Check: ${name} exists, true.`);
  } catch (_err) {
    console.info(`Check: ${name} exists, false.`);
    return false;
  }
  return true;
}

exports.default = async function checkSharpResources(ctx) {
  // const platform = ctx.electronPlatformName;
  // const arch = Arch[ctx.arch];
  const platform = ctx.platform.nodeName;
  const { arch } = ctx;
  console.log('compute for ', ctx, platform, arch);
  const resourcePath = path.join(
    __dirname,
    '..',
    'dist',
    platformDirs[formatPlatformArch(platform, arch)],
    resourcesSubpath
  );
  const rootNodeModules = path.join(__dirname, '..', 'node_modules', '@img');
  try {
    if (!(await dirExist(resourcePath, 'sharp resource path')))
      await fsPromises.mkdir(resourcePath, { recursive: true });
    const contents = await fsPromises.readdir(resourcePath);
    console.log('contents', contents);
    console.log('searching for', sharpBinName(platform, arch), libvipsBinName(platform, arch));
    if (!contents.some(file => file === sharpBinName(platform, arch))) {
      console.warn('sharp resources not found for platform/arch', platform, arch);
      if (await dirExist(rootNodeModules, 'root node_modules path')) {
        console.log('root node_modules path exists');
        const rootContents = await fsPromises.readdir(rootNodeModules);
        console.log('root contents:', rootContents);
        console.info('copying contents from node modules to resources');
        const contentsSet = new Set(contents);
        const toCopy = rootContents.filter(file => !contentsSet.has(file));

        for (const file of toCopy) {
          const sourcePath = path.join(rootNodeModules, file);
          console.info('copying sharp resource from', sourcePath, 'to', resourcePath);
          await fsPromises.cp(sourcePath, path.join(resourcePath, file), {
            recursive: true,
            force: false,
          });
        }
        const updated = await fsPromises.readdir(resourcePath);
        console.info('updated contents:', updated);
      }
    }
    if (!contents.some(file => file === libvipsBinName(platform, arch))) {
      console.warn('libvips resources not found for platform/arch', platform, arch);
    }
    console.info('sharp resources postbuild check complete');
  } catch (err) {
    console.error(err);
  }
};
