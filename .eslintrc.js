/**
 * MIT License
 *
 * Copyright (c) 2021-present, Elastic NV
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const { readFileSync } = require("fs");

const LICENSE = readFileSync("./LICENSE", "utf-8");
const LICENSE_HEADER =
  "/**\n" +
  LICENSE.split("\n")
    .map(line => ` *${line ? ` ${line}` : ""}`)
    .join("\n") +
  "\n */";

module.exports = {
  env: {
    es2021: true,
  },
  extends: ["react-app", "plugin:react/recommended"],
  ignorePatterns: ["build", "local-browsers"],
  overrides: [
    {
      extends: ["eslint:recommended"],
      files: ["*.js", "*.jsx"],
    },
    {
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/eslint-recommended",
      ],
      files: ["*.ts", "*.tsx"],
      plugins: ["@typescript-eslint"],
      rules: {
        "@typescript-eslint/explicit-module-boundary-types": 0,
        "@typescript-eslint/no-non-null-assertion": 0,
      },
    },
  ],
  rules: {
    "default-case": 0,
    "require-license-header": [
      "error",
      {
        license: LICENSE_HEADER,
      },
    ],
  },
};
