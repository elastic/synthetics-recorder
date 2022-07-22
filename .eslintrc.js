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
const { readFileSync } = require('fs');
const LICENSE = readFileSync(path.join(__dirname, 'LICENSE'), 'utf-8');
const LICENSE_HEADER = '\n' + LICENSE;

module.exports = {
  env: {
    es2021: true,
  },
  plugins: ['header', 'prettier'],
  extends: ['react-app', 'plugin:react/recommended', 'prettier'],
  ignorePatterns: ['build', 'local-browsers', 'demo-app'],
  overrides: [
    {
      extends: ['eslint:recommended'],
      files: ['*.js', '*.jsx'],
    },
    {
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
      ],
      files: ['*.ts', '*.tsx'],
      plugins: ['@typescript-eslint'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 0,
        '@typescript-eslint/no-non-null-assertion': 0,
        '@typescript-eslint/no-explicit-any': 0,
      },
    },
  ],
  rules: {
    'default-case': 0,
    'header/header': [2, 'block', LICENSE_HEADER],
    'no-console': 1,
    'prettier/prettier': 2,
  },
};
