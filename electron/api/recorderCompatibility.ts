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

import type { BrowserContext } from 'playwright-core';

/**
 * Prototype.js adds non-standard serialization hooks to built-in prototypes.
 * Playwright sends binding arguments as `serializedArgs` through JSON.stringify,
 * so normalize that payload to objects and arrays with no prototype first.
 */
export function addRecorderCompatibilityScript(
  context: Pick<BrowserContext, 'addInitScript'>
): Promise<void> {
  return context.addInitScript(() => {
    const NativeArray = Array;
    const stringify = JSON.stringify;
    const isArray = Array.isArray;
    const objectCreate = Object.create;
    const objectKeys = Object.keys;
    const setPrototypeOf = Object.setPrototypeOf;
    const hasOwn = Function.prototype.call.bind(Object.prototype.hasOwnProperty);

    function withoutPrototype(value: any): any {
      if (value === null || typeof value !== 'object') return value;

      if (isArray(value)) {
        const copy = new NativeArray(value.length);
        setPrototypeOf(copy, null);
        for (let index = 0; index < value.length; index++) {
          if (hasOwn(value, index)) copy[index] = withoutPrototype(value[index]);
        }
        return copy;
      }

      const copy = objectCreate(null);
      const keys = objectKeys(value);
      for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        const propertyValue = value[key];
        copy[key] =
          key === 'toJSON' && typeof propertyValue === 'function'
            ? undefined
            : withoutPrototype(propertyValue);
      }
      return copy;
    }

    JSON.stringify = function (value: any, replacer?: any, space?: any) {
      const isPlaywrightBindingPayload =
        value &&
        typeof value === 'object' &&
        typeof value.name === 'string' &&
        typeof value.seq === 'number' &&
        isArray(value.serializedArgs);

      if (!isPlaywrightBindingPayload) {
        return stringify.call(this, value, replacer, space);
      }

      return stringify.call(this, withoutPrototype(value), replacer, space);
    };
  });
}
