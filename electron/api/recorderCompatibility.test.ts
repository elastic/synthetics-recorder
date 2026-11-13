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

import { createContext, runInContext } from 'vm';
import { addRecorderCompatibilityScript } from './recorderCompatibility';

describe('addRecorderCompatibilityScript', () => {
  it('bypasses the Prototype.js override when Playwright serializes binding arguments', async () => {
    const pageContext = createContext({});
    const context = {
      addInitScript: jest.fn(async (script: Function | string) => {
        if (typeof script === 'function') {
          runInContext(`(${script.toString()})()`, pageContext);
        }
      }),
    };

    await addRecorderCompatibilityScript(context);

    const payloadResult = runInContext(
      `
        Array.prototype.toJSON = function() {
          return 'Prototype.js serialized this array as a string';
        };
        const payloadPrototype = {
          toJSON: function() { return 'Prototype.js serialized this object as a string'; }
        };
        const argument = Object.assign(Object.create(payloadPrototype), { value: 'button' });
        const payload = Object.assign(Object.create(payloadPrototype), {
          name: 'binding',
          seq: 1,
          serializedArgs: [argument]
        });
        JSON.stringify(payload);
      `,
      pageContext
    );
    const regularPageSerialization = runInContext(
      `JSON.stringify(['application', 'data'])`,
      pageContext
    );

    expect(context.addInitScript).toHaveBeenCalledTimes(1);
    expect(payloadResult).toBe('{"name":"binding","seq":1,"serializedArgs":[{"value":"button"}]}');
    expect(regularPageSerialization).toBe('"Prototype.js serialized this array as a string"');
  });
});
