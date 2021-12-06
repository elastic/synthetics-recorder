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

const http = require("http");
const url = require("url");
const path = require("path");
const next = require("../../demo-app/node_modules/next");
const { env } = require("../services");

const NEXT_DIR = path.join(__dirname, "../..", "demo-app");

const startServer = async () => {
  const app = next({ dev: false, dir: NEXT_DIR });
  const handle = app.getRequestHandler();

  await app.prepare();

  const httpServer = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  httpServer.listen(env.DEMO_APP_PORT, err => {
    if (err) throw err;

    // eslint-disable-next-line no-console
    console.log(`> Demo app ready on http://localhost:${env.DEMO_APP_PORT}`);
  });

  return httpServer;
};

const startDemoApp = async () => {
  const demoAppServer = await startServer();
  global.__demoApp__ = demoAppServer;
};

module.exports = { startDemoApp };
