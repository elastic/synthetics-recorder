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
const { spawn } = require("child_process");
const { downloadForPlatform } = require("./download-browsers");

exports.default = function beforePack(ctx) {
  const arch = Arch[ctx.arch];
  const platform = ctx.electronPlatformName;
  return Promise.all([downloadForPlatform(platform), fixSharp(arch, platform)]);
};

const { Arch } = require("electron-builder");

function fixSharp(arch, platform) {
  // electron-builder gets the arch and platform information with its own option parameter and logic.
  // native dependency sharp needs to get arch and platform information via `npm_config_arch` and `npm_config_platform` when installing
  // as this function is called by electron-builder and they should run in the same context and run it for the same target platform and arch,
  // we set the process.env.npm_config_* manually
  // as in when installing the sharp, it uses what electron-builder is targeting
  // so that we align the target arch and platform for both electron-builder and sharp
  return new Promise((resolve, reject) => {
    const npmInstall = spawn("npm", ["run", "fix-sharp"], {
      stdio: "inherit",
      shell: true,
      env: {
        ...process.env,
        npm_config_arch: arch,
        npm_config_platform: platform,
      },
    });
    npmInstall.on("close", code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error("process finished with error code " + code));
      }
    });
    npmInstall.on("error", error => {
      reject(error);
    });
  });
}
