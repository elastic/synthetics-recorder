/*
MIT License

Copyright (c) 2021-present, Elastic NV

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

import { addRecorderCompatibilityScript } from './recorderCompatibility';

describe('addRecorderCompatibilityScript', () => {
  let originalToJSON: PropertyDescriptor | undefined;
  let originalStringify: typeof JSON.stringify;

  beforeEach(() => {
    originalStringify = JSON.stringify;
    originalToJSON = Object.getOwnPropertyDescriptor(Array.prototype, 'toJSON');
    Object.defineProperty(Array.prototype, 'toJSON', {
      configurable: true,
      value: function () {
        return 'Prototype.js serialized this array as a string';
      },
    });
  });

  afterEach(() => {
    if (originalToJSON) {
      Object.defineProperty(Array.prototype, 'toJSON', originalToJSON);
    } else {
      delete (Array.prototype as any).toJSON;
    }
    JSON.stringify = originalStringify;
  });

  it('bypasses the Prototype.js override when Playwright serializes binding arguments', async () => {
    const context = {
      addInitScript: jest.fn(async (script: Function | string) => {
        if (typeof script === 'function') script();
      }),
    };

    await addRecorderCompatibilityScript(context);

    const payloadPrototype = {
      toJSON: () => 'Prototype.js serialized this object as a string',
    };
    const argument = Object.assign(Object.create(payloadPrototype), { value: 'button' });
    const payload = Object.assign(Object.create(payloadPrototype), {
      name: 'binding',
      seq: 1,
      serializedArgs: [argument],
    });

    expect(context.addInitScript).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(payload)).toBe(
      '{"name":"binding","seq":1,"serializedArgs":[{"value":"button"}]}'
    );
    expect(JSON.stringify(['application', 'data'])).toBe(
      '"Prototype.js serialized this array as a string"'
    );
  });
});
