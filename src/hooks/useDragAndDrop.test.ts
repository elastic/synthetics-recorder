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

import type { ActionInContext } from "@elastic/synthetics";
import { canDrag } from "./useDragAndDrop";

// copied from upstream branch, do not merge this but delete and reference
// original function after rebasing
function createAction(
  name: string,
  overrides?: Partial<ActionInContext>
): ActionInContext {
  return {
    action: {
      name,
      signals: [],
    },
    frameUrl: "https://www.elastic.co",
    isMainFrame: true,
    pageAlias: "pageAlias",
    ...(overrides ?? {}),
  };
}

describe("useDragAndDrop", () => {
  describe(`${canDrag.name}`, () => {
    it("returns `false` for first step", () => {
      expect(canDrag(0, [])).toBe(false);
    });

    it("returns `false` if preceding, current, and following steps have only one element", () => {
      expect(
        canDrag(1, [
          { actions: [createAction("action-1")] },
          { actions: [createAction("action-2")] },
          { actions: [createAction("action-3")] },
        ])
      ).toBe(false);
    });

    it("returns `true` if step heading can be dragged", () => {
      expect(
        canDrag(2, [
          { actions: [createAction("action-1")] },
          { actions: [createAction("action-2")] },
          { actions: [createAction("action-3"), createAction("action-4")] },
        ])
      ).toBe(true);
    });
  });
});
