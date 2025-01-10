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

// const { spawn } = require('child_process');
const checkSharpResources = require('./check-sharp').default;

exports.default = async function fixSharp(ctx) {
  console.log('beginning fix sharp', ctx);
  const platform = ctx.platform.nodeName;
  const arch = ctx.arch;
  console.log('platform:', platform, 'arch:', arch);

  const filteredEnvs = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (!k.startsWith('APPLE_') && !k.includes('PASSWORD')) {
      filteredEnvs[k] = v;
    }
  }

  //   await new Promise((resolve, reject) => {
  //     console.info('Fixing sharp for platform', platform, 'arch', arch);
  //     const npmInstall = spawn('npm', ['install', 'sharp'], {
  //       stdio: 'inherit',
  //       shell: true,
  //       env: {
  //         ...filteredEnvs,
  //         npm_config_os: platform,
  //         npm_config_cpu: arch,
  //         npm_config_arch: arch,
  //         npm_config_platform: platform,
  //       },
  //     });
  //     npmInstall.on('close', code => {
  //       if (code === 0) {
  //         console.info('fix sharp resolved without error');
  //         resolve();
  //       } else {
  //         reject(new Error('process finished with error code ' + code));
  //       }
  //     });
  //     npmInstall.on('error', reason => {
  //       console.error('error fixing sharp', reason);
  //       reject(reason);
  //     });
  //   });
  await checkSharpResources(ctx);
  return true;
};
