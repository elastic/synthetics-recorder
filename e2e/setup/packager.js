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
const { env } = require("../services");

const packageFiles = async () => {
  return new Promise((resolve, reject) => {
    const ls = spawn("npm", ["run", "react:start"], {
      env: {
        PORT: env.TEST_PORT,
        PATH: process.env.PATH,
        BROWSER: "none",
      },
      shell: true,
      detached: true,
    });

    ls.stdout.setEncoding("utf8");
    ls.stderr.setEncoding("utf8");

    ls.stdout.on("data", async data => {
      if (data.indexOf("Something is already running on port") !== -1) {
        // eslint-disable-next-line no-console
        console.warn(`Something is already running on port ${env.TEST_PORT}.`);
        reject();
      }

      if (data.indexOf("You can now view") !== -1) {
        resolve(ls);
      }
    });

    ls.stderr.on("data", data => {
      // eslint-disable-next-line no-console
      console.error(data);
      reject();
    });
  });
};

module.exports = async () => {
  const packager = await packageFiles();
  global.__packager__ = packager;
};
