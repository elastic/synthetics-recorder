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

import { createAction } from "../helpers/test";
import { isDroppable } from "./useDrop";

describe("useDrop", () => {
  describe(isDroppable.name, () => {
    it(`is not droppable if there is no action in front or behind`, () => {
      expect(
        isDroppable(0, 0, [
          { actions: [createAction("action-1")] },
          { actions: [createAction("action-2")] },
        ])
      ).toBe(false);
    });

    it(`is not droppable if the targeted action is the final item in the step`, () => {
      expect(
        isDroppable(0, 3, [
          {
            actions: [
              createAction("action-1"),
              createAction("action-2"),
              createAction("action-3"),
              createAction("action-4"),
            ],
          },
        ])
      ).toBe(false);
    });

    it("is droppable if there is an action behind", () => {
      expect(
        isDroppable(0, 2, [
          {
            actions: [
              createAction("action-1"),
              createAction("action-2"),
              createAction("action-3"),
              createAction("action-4"),
            ],
          },
        ])
      ).toBe(true);
    });

    it("is not droppable if the dragged step is more than one step away", () => {
      expect(
        isDroppable(
          0,
          0,
          [
            {
              actions: [
                createAction("a0"),
                createAction("a1"),
                createAction("a2"),
              ],
            },
            {
              actions: [
                createAction("a3"),
                createAction("a4"),
                createAction("a5"),
              ],
            },
            {
              actions: [createAction("a6"), createAction("a7")],
            },
          ],
          2
        )
      ).toBe(false);
    });
  });
});