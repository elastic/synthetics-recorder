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

import { RendererProcessIpc } from "electron-better-ipc";
import { getCodeForFailedResult, updateAction } from "./shared";
import type { Step, Steps } from "./types";

describe("shared", () => {
  describe("updateAction", () => {
    const steps: Steps = [
      {
        actions: [
          {
            pageAlias: "page",
            isMainFrame: true,
            frameUrl: "http://localhost:12349/html",
            committed: true,
            action: {
              name: "navigate",
              url: "http://localhost:12349/html",
              signals: [],
            },
            title: "Go to http://localhost:12349/html",
          },
          {
            pageAlias: "page",
            isMainFrame: true,
            frameUrl: "http://localhost:12349/html",
            action: {
              name: "click",
              selector: "text=Hello world A link to google",
              signals: [],
              button: "left",
              modifiers: 0,
              clickCount: 1,
            },
            title: "Click text=Hello world",
          },
          {
            action: {
              name: "assert",
              isAssert: true,
              selector: "text=Hello world",
              command: "innerText",
              value: undefined,
              signals: [],
            },
            frameUrl: "http://localhost:12349/html",
            modified: false,
            isMainFrame: true,
            pageAlias: "page",
          },
        ],
      },
    ];

    it("updates the action at the specified index", () => {
      const updatedSteps = updateAction(steps, "nextValue", 0, 2);
      expect(updatedSteps).toHaveLength(1);
      expect(updatedSteps[0].actions).toHaveLength(3);
      expect(JSON.stringify(updatedSteps[0].actions[0])).toEqual(
        JSON.stringify(steps[0].actions[0])
      );
      expect(JSON.stringify(updatedSteps[0].actions[1])).toEqual(
        JSON.stringify(steps[0].actions[1])
      );
      expect(JSON.stringify(updatedSteps[0].actions[2])).toEqual(
        JSON.stringify({
          ...steps[0].actions[2],
          action: { ...steps[0].actions[2].action, value: "nextValue" },
        })
      );
    });
  });

  describe("getCodeForFailedResult", () => {
    let mockIpc: RendererProcessIpc;

    beforeEach(() => {
      const mock = {
        answerMain: jest.fn(),
        callMain: jest.fn(),
      };
      mockIpc = mock as unknown as RendererProcessIpc;
    });

    it("returns empty string for undefined journey", async () => {
      expect(await getCodeForFailedResult(mockIpc, [])).toBe("");
    });

    it("returns an empty string if there are no failed steps in the journey", async () => {
      expect(
        await getCodeForFailedResult(mockIpc, [], {
          status: "succeeded",
          type: "inline",
          steps: [
            {
              duration: 10,
              name: "I succeeded",
              status: "succeeded",
            },
          ],
        })
      ).toBe("");
    });

    it("returns an empty string if there is no step title matching journey name", async () => {
      expect(
        await getCodeForFailedResult(mockIpc, [], {
          status: "failed",
          type: "inline",
          steps: [
            {
              duration: 10,
              name: "I failed",
              status: "failed",
            },
          ],
        })
      ).toBe("");
    });

    it("calls `getCodeFromActions` when a matching step for the failed journey step is found", async () => {
      const failedStep: Step = {
        actions: [
          {
            title: "I failed",
            action: {
              name: "click",
              signals: [],
            },
            isMainFrame: true,
            frameUrl: "https://www.elastic.co",
            pageAlias: "page alias",
          },
        ],
      };

      await getCodeForFailedResult(mockIpc, [failedStep], {
        status: "failed",
        type: "inline",
        steps: [
          {
            duration: 10,
            name: "I failed",
            status: "failed",
          },
        ],
      });

      expect(mockIpc.callMain).toHaveBeenCalledTimes(1);
      expect(mockIpc.callMain).toHaveBeenCalledWith("actions-to-code", {
        actions: [failedStep],
        isSuite: false,
      });
    });
  });
});
