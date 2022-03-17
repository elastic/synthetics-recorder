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

import { ActionInContext } from "@elastic/synthetics";
import { Step, Steps } from "../common/types";
import { generateIR, generateMergedIR } from "./generator";

describe("generator", () => {
  describe("generateIR", () => {
    let step: Step;
    beforeEach(() => {
      step = {
        actions: [
          {
            pageAlias: "page",
            isMainFrame: true,
            frameUrl: "about:blank",
            committed: true,
            action: {
              name: "openPage",
              url: "about:blank",
              signals: [],
            },
          },
          {
            pageAlias: "page",
            isMainFrame: true,
            frameUrl: "https://vigneshh.in/",
            committed: true,
            action: {
              name: "navigate",
              url: "https://vigneshh.in/",
              signals: [],
            },
          },
          {
            pageAlias: "page",
            isMainFrame: true,
            frameUrl: "https://vigneshh.in/",
            action: {
              name: "click",
              selector:
                "text=I Enjoy evangelizing the magic of web performance.",
              signals: [],
              button: "left",
              modifiers: 0,
              clickCount: 1,
            },
            committed: true,
          },
          {
            pageAlias: "page",
            isMainFrame: true,
            frameUrl: "https://vigneshh.in/",
            action: {
              name: "assert",
              isAssert: true,
              command: "textContent",
              selector: "text=Babel Minify",
              value: "babel",
              signals: [],
            },
          },
          {
            pageAlias: "page",
            isMainFrame: true,
            frameUrl: "https://vigneshh.in/",
            action: {
              name: "click",
              selector: "text=Babel Minify",
              signals: [
                {
                  name: "popup",
                  popupAlias: "page1",
                  isAsync: true,
                },
              ],
              button: "left",
              modifiers: 0,
              clickCount: 1,
            },
            committed: true,
          },
          {
            pageAlias: "page1",
            isMainFrame: true,
            frameUrl: "https://github.com/babel/minify",
            action: {
              name: "click",
              selector: 'a:has-text("smoke")',
              signals: [
                {
                  name: "navigation",
                  url: "https://github.com/babel/minify",
                },
                {
                  name: "navigation",
                  url: "https://github.com/babel/minify/tree/master/smoke",
                },
                {
                  name: "navigation",
                  url: "https://github.com/babel/minify/tree/master/smoke",
                  isAsync: true,
                },
                {
                  name: "navigation",
                  url: "https://github.com/babel/minify",
                  isAsync: true,
                },
              ],
              button: "left",
              modifiers: 0,
              clickCount: 1,
            },
          },
          {
            pageAlias: "page1",
            isMainFrame: true,
            frameUrl: "https://github.com/babel/minify",
            committed: true,
            action: {
              name: "closePage",
              signals: [],
            },
          },
          {
            pageAlias: "page",
            isMainFrame: true,
            frameUrl: "https://vigneshh.in/",
            committed: true,
            action: {
              name: "closePage",
              signals: [],
            },
          },
        ],
      };
    });
    it("creates an enhanced IR", () => {
      const ir = generateIR([step]);

      expect(ir).toHaveLength(1);
      expect(ir[0].actions).toHaveLength(8);
    });
    it("keeps actions that already have a title", () => {
      const actionWithTitle = {
        pageAlias: "page",
        isMainFrame: true,
        frameUrl: "https://vigneshh.in/",
        title: "A custom title",
        action: {
          name: "assert",
          isAssert: true,
          command: "textContent",
          selector: "text=Babel Minify",
          value: "babel",
          signals: [],
        },
      };
      step.actions.push(actionWithTitle);
      const ir = generateIR([step]);
      const { length } = ir[0].actions;

      expect(ir[0].actions[length - 1]).toEqual(actionWithTitle);
    });
  });
  describe("generateMergedIR", () => {
    const prev: Steps = [
      {
        actions: [
          {
            pageAlias: "page",
            isMainFrame: true,
            frameUrl: "https://news.google.com",
            committed: true,
            action: {
              name: "navigate",
              url: "https://news.google.com",
              signals: [],
            },
            modified: true,
            title: "https://news.google.com",
          },
        ],
      },
      {
        actions: [
          {
            pageAlias: "page",
            isMainFrame: true,
            frameUrl: "https://www.google.com/",
            committed: true,
            action: {
              name: "navigate",
              url: "https://www.google.com/",
              signals: [],
            },
            title: "Go to https://www.google.com/",
          },
          {
            pageAlias: "page",
            isMainFrame: true,
            frameUrl: "https://www.google.com/",
            action: {
              name: "click",
              selector: '[aria-label="Search"]',
              signals: [],
              button: "left",
              modifiers: 0,
              clickCount: 1,
            },
            committed: true,
            title: 'Click [aria-label="Search"]',
          },
          {
            pageAlias: "page",
            isMainFrame: true,
            frameUrl: "https://www.google.com/",
            action: {
              name: "fill",
              selector: '[aria-label="Search"]',
              signals: [],
              text: "hello world",
            },
            committed: true,
            title: 'Fill [aria-label="Search"]',
          },
          {
            pageAlias: "page",
            isMainFrame: true,
            frameUrl: "https://www.google.com/",
            action: {
              name: "press",
              selector: '[aria-label="Search"]',
              signals: [
                {
                  name: "navigation",
                  url: "https://www.google.com/search?q=hello+world&source=hp&ei=HN8wYuGUN6aD9PwP3ryR2A8&iflsig=AHkkrS4AAAAAYjDtLG_pgIZ4vhlN3VoBrRzhKb2cOf9Y&ved=0ahUKEwjhkrvD48j2AhWmAZ0JHV5eBPsQ4dUDCAk&uact=5&oq=hello+world&gs_lcp=Cgdnd3Mtd2l6EAMyCAgAEIAEELEDMggILhCABBCxAzIICC4QgAQQsQMyCwguEIAEELEDENQCMggIABCABBCxAzIICAAQgAQQsQMyCAgAEIAEELEDMgsILhCABBCxAxDUAjIICAAQgAQQsQMyCAgAEIAEELEDOg4IABCPARDqAhCMAxDlAjoOCC4QjwEQ6gIQjAMQ5QI6DgguEIAEELEDEMcBEKMCOgsIABCABBCxAxCDAToLCC4QgAQQxwEQrwE6CggAELEDEIMBEAo6CAguELEDEIMBOhEILhCABBCxAxCDARDHARCjAjoRCC4QgAQQsQMQgwEQxwEQrwE6BQguEIAEOg4ILhCABBCxAxDHARDRAzoOCC4QgAQQxwEQrwEQ1AI6CwguELEDEMcBEKMCOgUIABCABDoRCC4QgAQQsQMQgwEQxwEQ0QM6CwguEIAEELEDEIMBOgsIABCABBCxAxDJAzoHCAAQsQMQCjoQCC4QgAQQsQMQxwEQ0QMQCjoICAAQgAQQyQM6CAguEIAEENQCUKMEWNYOYPAPaAFwAHgAgAFUiAGcBpIBAjExmAEAoAEBsAEK&sclient=gws-wiz",
                },
                {
                  name: "navigation",
                  url: "https://www.google.com/search?q=hello+world&source=hp&ei=HN8wYuGUN6aD9PwP3ryR2A8&iflsig=AHkkrS4AAAAAYjDtLG_pgIZ4vhlN3VoBrRzhKb2cOf9Y&ved=0ahUKEwjhkrvD48j2AhWmAZ0JHV5eBPsQ4dUDCAk&uact=5&oq=hello+world&gs_lcp=Cgdnd3Mtd2l6EAMyCAgAEIAEELEDMggILhCABBCxAzIICC4QgAQQsQMyCwguEIAEELEDENQCMggIABCABBCxAzIICAAQgAQQsQMyCAgAEIAEELEDMgsILhCABBCxAxDUAjIICAAQgAQQsQMyCAgAEIAEELEDOg4IABCPARDqAhCMAxDlAjoOCC4QjwEQ6gIQjAMQ5QI6DgguEIAEELEDEMcBEKMCOgsIABCABBCxAxCDAToLCC4QgAQQxwEQrwE6CggAELEDEIMBEAo6CAguELEDEIMBOhEILhCABBCxAxCDARDHARCjAjoRCC4QgAQQsQMQgwEQxwEQrwE6BQguEIAEOg4ILhCABBCxAxDHARDRAzoOCC4QgAQQxwEQrwEQ1AI6CwguELEDEMcBEKMCOgUIABCABDoRCC4QgAQQsQMQgwEQxwEQ0QM6CwguEIAEELEDEIMBOgsIABCABBCxAxDJAzoHCAAQsQMQCjoQCC4QgAQQsQMQxwEQ0QMQCjoICAAQgAQQyQM6CAguEIAEENQCUKMEWNYOYPAPaAFwAHgAgAFUiAGcBpIBAjExmAEAoAEBsAEK&sclient=gws-wiz",
                  isAsync: true,
                },
              ],
              key: "Enter",
              modifiers: 0,
            },
            committed: true,
            title: "Press Enter",
          },
          {
            pageAlias: "page",
            isMainFrame: true,
            frameUrl:
              "https://www.google.com/search?q=hello+world&source=hp&ei=HN8wYuGUN6aD9PwP3ryR2A8&iflsig=AHkkrS4AAAAAYjDtLG_pgIZ4vhlN3VoBrRzhKb2cOf9Y&ved=0ahUKEwjhkrvD48j2AhWmAZ0JHV5eBPsQ4dUDCAk&uact=5&oq=hello+world&gs_lcp=Cgdnd3Mtd2l6EAMyCAgAEIAEELEDMggILhCABBCxAzIICC4QgAQQsQMyCwguEIAEELEDENQCMggIABCABBCxAzIICAAQgAQQsQMyCAgAEIAEELEDMgsILhCABBCxAxDUAjIICAAQgAQQsQMyCAgAEIAEELEDOg4IABCPARDqAhCMAxDlAjoOCC4QjwEQ6gIQjAMQ5QI6DgguEIAEELEDEMcBEKMCOgsIABCABBCxAxCDAToLCC4QgAQQxwEQrwE6CggAELEDEIMBEAo6CAguELEDEIMBOhEILhCABBCxAxCDARDHARCjAjoRCC4QgAQQsQMQgwEQxwEQrwE6BQguEIAEOg4ILhCABBCxAxDHARDRAzoOCC4QgAQQxwEQrwEQ1AI6CwguELEDEMcBEKMCOgUIABCABDoRCC4QgAQQsQMQgwEQxwEQ0QM6CwguEIAEELEDEIMBOgsIABCABBCxAxDJAzoHCAAQsQMQCjoQCC4QgAQQsQMQxwEQ0QMQCjoICAAQgAQQyQM6CAguEIAEENQCUKMEWNYOYPAPaAFwAHgAgAFUiAGcBpIBAjExmAEAoAEBsAEK&sclient=gws-wiz",
            action: {
              name: "click",
              selector: 'text=/.*"Hello, World!" program - Wikipedia.*/',
              signals: [
                {
                  name: "navigation",
                  url: "https://en.wikipedia.org/wiki/%22Hello,_World!%22_program",
                },
              ],
              button: "left",
              modifiers: 0,
              clickCount: 1,
            },
            committed: true,
            title: 'Click text=/.*"Hello, World!" program - Wikipedia.*/',
          },
          {
            pageAlias: "page",
            isMainFrame: true,
            frameUrl:
              "https://en.wikipedia.org/wiki/%22Hello,_World!%22_program",
            action: {
              name: "click",
              selector: "text=Main page",
              signals: [
                {
                  name: "navigation",
                  url: "https://en.wikipedia.org/wiki/Main_Page",
                },
              ],
              button: "left",
              modifiers: 0,
              clickCount: 1,
            },
            committed: true,
            title: "Click text=Main page",
          },
        ],
      },
      {
        actions: [
          {
            pageAlias: "page",
            isMainFrame: true,
            frameUrl:
              "https://news.google.com/topstories?hl=en-US&gl=US&ceid=US:en",
            committed: true,
            action: {
              name: "navigate",
              url: "https://news.google.com/topstories?hl=en-US&gl=US&ceid=US:en",
              signals: [],
            },
            title:
              "Go to https://news.google.com/topstories?hl=en-US&gl=US&ceid=US:en",
          },
        ],
      },
    ];
    const cur: Steps = [
      {
        actions: [
          {
            pageAlias: "page",
            isMainFrame: true,
            frameUrl: "https://www.google.com/?gws_rd=ssl",
            committed: true,
            action: {
              name: "navigate",
              url: "https://www.google.com/?gws_rd=ssl",
              signals: [],
            },
            title: "Go to https://www.google.com/?gws_rd=ssl",
          },
          {
            pageAlias: "page",
            isMainFrame: true,
            frameUrl: "https://www.google.com/",
            committed: true,
            action: {
              name: "navigate",
              url: "https://www.google.com/",
              signals: [],
            },
            title: "Go to https://www.google.com/",
          },
          {
            pageAlias: "page",
            isMainFrame: true,
            frameUrl: "https://www.google.com/",
            action: {
              name: "click",
              selector: '[aria-label="Search"]',
              signals: [],
              button: "left",
              modifiers: 0,
              clickCount: 1,
            },
            committed: true,
            title: 'Click [aria-label="Search"]',
          },
          {
            pageAlias: "page",
            isMainFrame: true,
            frameUrl: "https://www.google.com/",
            action: {
              name: "fill",
              selector: '[aria-label="Search"]',
              signals: [],
              text: "hello world",
            },
            committed: true,
            title: 'Fill [aria-label="Search"]',
          },
          {
            pageAlias: "page",
            isMainFrame: true,
            frameUrl: "https://www.google.com/",
            action: {
              name: "press",
              selector: '[aria-label="Search"]',
              signals: [
                {
                  name: "navigation",
                  url: "https://www.google.com/search?q=hello+world&source=hp&ei=HN8wYuGUN6aD9PwP3ryR2A8&iflsig=AHkkrS4AAAAAYjDtLG_pgIZ4vhlN3VoBrRzhKb2cOf9Y&ved=0ahUKEwjhkrvD48j2AhWmAZ0JHV5eBPsQ4dUDCAk&uact=5&oq=hello+world&gs_lcp=Cgdnd3Mtd2l6EAMyCAgAEIAEELEDMggILhCABBCxAzIICC4QgAQQsQMyCwguEIAEELEDENQCMggIABCABBCxAzIICAAQgAQQsQMyCAgAEIAEELEDMgsILhCABBCxAxDUAjIICAAQgAQQsQMyCAgAEIAEELEDOg4IABCPARDqAhCMAxDlAjoOCC4QjwEQ6gIQjAMQ5QI6DgguEIAEELEDEMcBEKMCOgsIABCABBCxAxCDAToLCC4QgAQQxwEQrwE6CggAELEDEIMBEAo6CAguELEDEIMBOhEILhCABBCxAxCDARDHARCjAjoRCC4QgAQQsQMQgwEQxwEQrwE6BQguEIAEOg4ILhCABBCxAxDHARDRAzoOCC4QgAQQxwEQrwEQ1AI6CwguELEDEMcBEKMCOgUIABCABDoRCC4QgAQQsQMQgwEQxwEQ0QM6CwguEIAEELEDEIMBOgsIABCABBCxAxDJAzoHCAAQsQMQCjoQCC4QgAQQsQMQxwEQ0QMQCjoICAAQgAQQyQM6CAguEIAEENQCUKMEWNYOYPAPaAFwAHgAgAFUiAGcBpIBAjExmAEAoAEBsAEK&sclient=gws-wiz",
                },
                {
                  name: "navigation",
                  url: "https://www.google.com/search?q=hello+world&source=hp&ei=HN8wYuGUN6aD9PwP3ryR2A8&iflsig=AHkkrS4AAAAAYjDtLG_pgIZ4vhlN3VoBrRzhKb2cOf9Y&ved=0ahUKEwjhkrvD48j2AhWmAZ0JHV5eBPsQ4dUDCAk&uact=5&oq=hello+world&gs_lcp=Cgdnd3Mtd2l6EAMyCAgAEIAEELEDMggILhCABBCxAzIICC4QgAQQsQMyCwguEIAEELEDENQCMggIABCABBCxAzIICAAQgAQQsQMyCAgAEIAEELEDMgsILhCABBCxAxDUAjIICAAQgAQQsQMyCAgAEIAEELEDOg4IABCPARDqAhCMAxDlAjoOCC4QjwEQ6gIQjAMQ5QI6DgguEIAEELEDEMcBEKMCOgsIABCABBCxAxCDAToLCC4QgAQQxwEQrwE6CggAELEDEIMBEAo6CAguELEDEIMBOhEILhCABBCxAxCDARDHARCjAjoRCC4QgAQQsQMQgwEQxwEQrwE6BQguEIAEOg4ILhCABBCxAxDHARDRAzoOCC4QgAQQxwEQrwEQ1AI6CwguELEDEMcBEKMCOgUIABCABDoRCC4QgAQQsQMQgwEQxwEQ0QM6CwguEIAEELEDEIMBOgsIABCABBCxAxDJAzoHCAAQsQMQCjoQCC4QgAQQsQMQxwEQ0QMQCjoICAAQgAQQyQM6CAguEIAEENQCUKMEWNYOYPAPaAFwAHgAgAFUiAGcBpIBAjExmAEAoAEBsAEK&sclient=gws-wiz",
                  isAsync: true,
                },
              ],
              key: "Enter",
              modifiers: 0,
            },
            committed: true,
            title: "Press Enter",
          },
          {
            pageAlias: "page",
            isMainFrame: true,
            frameUrl:
              "https://www.google.com/search?q=hello+world&source=hp&ei=HN8wYuGUN6aD9PwP3ryR2A8&iflsig=AHkkrS4AAAAAYjDtLG_pgIZ4vhlN3VoBrRzhKb2cOf9Y&ved=0ahUKEwjhkrvD48j2AhWmAZ0JHV5eBPsQ4dUDCAk&uact=5&oq=hello+world&gs_lcp=Cgdnd3Mtd2l6EAMyCAgAEIAEELEDMggILhCABBCxAzIICC4QgAQQsQMyCwguEIAEELEDENQCMggIABCABBCxAzIICAAQgAQQsQMyCAgAEIAEELEDMgsILhCABBCxAxDUAjIICAAQgAQQsQMyCAgAEIAEELEDOg4IABCPARDqAhCMAxDlAjoOCC4QjwEQ6gIQjAMQ5QI6DgguEIAEELEDEMcBEKMCOgsIABCABBCxAxCDAToLCC4QgAQQxwEQrwE6CggAELEDEIMBEAo6CAguELEDEIMBOhEILhCABBCxAxCDARDHARCjAjoRCC4QgAQQsQMQgwEQxwEQrwE6BQguEIAEOg4ILhCABBCxAxDHARDRAzoOCC4QgAQQxwEQrwEQ1AI6CwguELEDEMcBEKMCOgUIABCABDoRCC4QgAQQsQMQgwEQxwEQ0QM6CwguEIAEELEDEIMBOgsIABCABBCxAxDJAzoHCAAQsQMQCjoQCC4QgAQQsQMQxwEQ0QMQCjoICAAQgAQQyQM6CAguEIAEENQCUKMEWNYOYPAPaAFwAHgAgAFUiAGcBpIBAjExmAEAoAEBsAEK&sclient=gws-wiz",
            action: {
              name: "click",
              selector: 'text=/.*"Hello, World!" program - Wikipedia.*/',
              signals: [
                {
                  name: "navigation",
                  url: "https://en.wikipedia.org/wiki/%22Hello,_World!%22_program",
                },
              ],
              button: "left",
              modifiers: 0,
              clickCount: 1,
            },
            committed: true,
            title: 'Click text=/.*"Hello, World!" program - Wikipedia.*/',
          },
          {
            pageAlias: "page",
            isMainFrame: true,
            frameUrl:
              "https://en.wikipedia.org/wiki/%22Hello,_World!%22_program",
            action: {
              name: "click",
              selector: "text=Main page",
              signals: [
                {
                  name: "navigation",
                  url: "https://en.wikipedia.org/wiki/Main_Page",
                },
              ],
              button: "left",
              modifiers: 0,
              clickCount: 1,
            },
            committed: true,
            title: "Click text=Main page",
          },
          {
            pageAlias: "page",
            isMainFrame: true,
            frameUrl:
              "https://news.google.com/topstories?hl=en-US&gl=US&ceid=US:en",
            committed: true,
            action: {
              name: "navigate",
              url: "https://news.google.com/topstories?hl=en-US&gl=US&ceid=US:en",
              signals: [],
            },
            title:
              "Go to https://news.google.com/topstories?hl=en-US&gl=US&ceid=US:en",
          },
        ],
      },
    ];
    it("returns next PW actions if no previous steps", () => {
      expect(generateMergedIR([], cur)).toEqual(cur);
    });
    it("returns empty set if PW actions are empty", () => {
      expect(generateMergedIR(prev, [])).toEqual([]);
    });
    it("picks up assertions", () => {
      const assert: ActionInContext = {
        pageAlias: "page",
        isMainFrame: true,
        frameUrl: "https://vigneshh.in/",
        action: {
          isAssert: true,
          name: "assert",
          command: "visible",
          selector: "text=Babel Minify",
          signals: [],
          modifiers: 0,
          clickCount: 1,
        },
        committed: true,
      };
      const result = generateMergedIR(
        [
          ...prev,
          {
            actions: [assert],
          },
        ],
        cur
      );
      const r = result[result.length - 1];
      const { length } = r.actions;
      expect(r.actions[length - 1]).toEqual(assert);
    });
    it("merges updated actions with modified UI actions", () => {
      expect(generateMergedIR(prev, cur)).toEqual([
        {
          actions: [
            {
              action: {
                name: "navigate",
                signals: [],
                url: "https://news.google.com",
              },
              committed: true,
              frameUrl: "https://news.google.com",
              isMainFrame: true,
              modified: true,
              pageAlias: "page",
              title: "https://news.google.com",
            },
          ],
        },
        {
          actions: [
            {
              action: {
                name: "navigate",
                signals: [],
                url: "https://www.google.com/",
              },
              committed: true,
              frameUrl: "https://www.google.com/",
              isMainFrame: true,
              pageAlias: "page",
              title: "Go to https://www.google.com/",
            },
            {
              action: {
                button: "left",
                clickCount: 1,
                modifiers: 0,
                name: "click",
                selector: '[aria-label="Search"]',
                signals: [],
              },
              committed: true,
              frameUrl: "https://www.google.com/",
              isMainFrame: true,
              pageAlias: "page",
              title: 'Click [aria-label="Search"]',
            },
            {
              action: {
                name: "fill",
                selector: '[aria-label="Search"]',
                signals: [],
                text: "hello world",
              },
              committed: true,
              frameUrl: "https://www.google.com/",
              isMainFrame: true,
              pageAlias: "page",
              title: 'Fill [aria-label="Search"]',
            },
            {
              action: {
                key: "Enter",
                modifiers: 0,
                name: "press",
                selector: '[aria-label="Search"]',
                signals: [
                  {
                    name: "navigation",
                    url: "https://www.google.com/search?q=hello+world&source=hp&ei=HN8wYuGUN6aD9PwP3ryR2A8&iflsig=AHkkrS4AAAAAYjDtLG_pgIZ4vhlN3VoBrRzhKb2cOf9Y&ved=0ahUKEwjhkrvD48j2AhWmAZ0JHV5eBPsQ4dUDCAk&uact=5&oq=hello+world&gs_lcp=Cgdnd3Mtd2l6EAMyCAgAEIAEELEDMggILhCABBCxAzIICC4QgAQQsQMyCwguEIAEELEDENQCMggIABCABBCxAzIICAAQgAQQsQMyCAgAEIAEELEDMgsILhCABBCxAxDUAjIICAAQgAQQsQMyCAgAEIAEELEDOg4IABCPARDqAhCMAxDlAjoOCC4QjwEQ6gIQjAMQ5QI6DgguEIAEELEDEMcBEKMCOgsIABCABBCxAxCDAToLCC4QgAQQxwEQrwE6CggAELEDEIMBEAo6CAguELEDEIMBOhEILhCABBCxAxCDARDHARCjAjoRCC4QgAQQsQMQgwEQxwEQrwE6BQguEIAEOg4ILhCABBCxAxDHARDRAzoOCC4QgAQQxwEQrwEQ1AI6CwguELEDEMcBEKMCOgUIABCABDoRCC4QgAQQsQMQgwEQxwEQ0QM6CwguEIAEELEDEIMBOgsIABCABBCxAxDJAzoHCAAQsQMQCjoQCC4QgAQQsQMQxwEQ0QMQCjoICAAQgAQQyQM6CAguEIAEENQCUKMEWNYOYPAPaAFwAHgAgAFUiAGcBpIBAjExmAEAoAEBsAEK&sclient=gws-wiz",
                  },
                  {
                    isAsync: true,
                    name: "navigation",
                    url: "https://www.google.com/search?q=hello+world&source=hp&ei=HN8wYuGUN6aD9PwP3ryR2A8&iflsig=AHkkrS4AAAAAYjDtLG_pgIZ4vhlN3VoBrRzhKb2cOf9Y&ved=0ahUKEwjhkrvD48j2AhWmAZ0JHV5eBPsQ4dUDCAk&uact=5&oq=hello+world&gs_lcp=Cgdnd3Mtd2l6EAMyCAgAEIAEELEDMggILhCABBCxAzIICC4QgAQQsQMyCwguEIAEELEDENQCMggIABCABBCxAzIICAAQgAQQsQMyCAgAEIAEELEDMgsILhCABBCxAxDUAjIICAAQgAQQsQMyCAgAEIAEELEDOg4IABCPARDqAhCMAxDlAjoOCC4QjwEQ6gIQjAMQ5QI6DgguEIAEELEDEMcBEKMCOgsIABCABBCxAxCDAToLCC4QgAQQxwEQrwE6CggAELEDEIMBEAo6CAguELEDEIMBOhEILhCABBCxAxCDARDHARCjAjoRCC4QgAQQsQMQgwEQxwEQrwE6BQguEIAEOg4ILhCABBCxAxDHARDRAzoOCC4QgAQQxwEQrwEQ1AI6CwguELEDEMcBEKMCOgUIABCABDoRCC4QgAQQsQMQgwEQxwEQ0QM6CwguEIAEELEDEIMBOgsIABCABBCxAxDJAzoHCAAQsQMQCjoQCC4QgAQQsQMQxwEQ0QMQCjoICAAQgAQQyQM6CAguEIAEENQCUKMEWNYOYPAPaAFwAHgAgAFUiAGcBpIBAjExmAEAoAEBsAEK&sclient=gws-wiz",
                  },
                ],
              },
              committed: true,
              frameUrl: "https://www.google.com/",
              isMainFrame: true,
              pageAlias: "page",
              title: "Press Enter",
            },
            {
              action: {
                button: "left",
                clickCount: 1,
                modifiers: 0,
                name: "click",
                selector: 'text=/.*"Hello, World!" program - Wikipedia.*/',
                signals: [
                  {
                    name: "navigation",
                    url: "https://en.wikipedia.org/wiki/%22Hello,_World!%22_program",
                  },
                ],
              },
              committed: true,
              frameUrl:
                "https://www.google.com/search?q=hello+world&source=hp&ei=HN8wYuGUN6aD9PwP3ryR2A8&iflsig=AHkkrS4AAAAAYjDtLG_pgIZ4vhlN3VoBrRzhKb2cOf9Y&ved=0ahUKEwjhkrvD48j2AhWmAZ0JHV5eBPsQ4dUDCAk&uact=5&oq=hello+world&gs_lcp=Cgdnd3Mtd2l6EAMyCAgAEIAEELEDMggILhCABBCxAzIICC4QgAQQsQMyCwguEIAEELEDENQCMggIABCABBCxAzIICAAQgAQQsQMyCAgAEIAEELEDMgsILhCABBCxAxDUAjIICAAQgAQQsQMyCAgAEIAEELEDOg4IABCPARDqAhCMAxDlAjoOCC4QjwEQ6gIQjAMQ5QI6DgguEIAEELEDEMcBEKMCOgsIABCABBCxAxCDAToLCC4QgAQQxwEQrwE6CggAELEDEIMBEAo6CAguELEDEIMBOhEILhCABBCxAxCDARDHARCjAjoRCC4QgAQQsQMQgwEQxwEQrwE6BQguEIAEOg4ILhCABBCxAxDHARDRAzoOCC4QgAQQxwEQrwEQ1AI6CwguELEDEMcBEKMCOgUIABCABDoRCC4QgAQQsQMQgwEQxwEQ0QM6CwguEIAEELEDEIMBOgsIABCABBCxAxDJAzoHCAAQsQMQCjoQCC4QgAQQsQMQxwEQ0QMQCjoICAAQgAQQyQM6CAguEIAEENQCUKMEWNYOYPAPaAFwAHgAgAFUiAGcBpIBAjExmAEAoAEBsAEK&sclient=gws-wiz",
              isMainFrame: true,
              pageAlias: "page",
              title: 'Click text=/.*"Hello, World!" program - Wikipedia.*/',
            },
            {
              action: {
                button: "left",
                clickCount: 1,
                modifiers: 0,
                name: "click",
                selector: "text=Main page",
                signals: [
                  {
                    name: "navigation",
                    url: "https://en.wikipedia.org/wiki/Main_Page",
                  },
                ],
              },
              committed: true,
              frameUrl:
                "https://en.wikipedia.org/wiki/%22Hello,_World!%22_program",
              isMainFrame: true,
              pageAlias: "page",
              title: "Click text=Main page",
            },
          ],
        },
        {
          actions: [
            {
              action: {
                name: "navigate",
                signals: [],
                url: "https://news.google.com/topstories?hl=en-US&gl=US&ceid=US:en",
              },
              committed: true,
              frameUrl:
                "https://news.google.com/topstories?hl=en-US&gl=US&ceid=US:en",
              isMainFrame: true,
              pageAlias: "page",
              title:
                "Go to https://news.google.com/topstories?hl=en-US&gl=US&ceid=US:en",
            },
          ],
        },
      ]);
    });
    it("picks up new actions", () => {
      expect(
        generateMergedIR(
          [
            {
              actions: [
                {
                  action: {
                    name: "navigate",
                    signals: [],
                    url: "https://news.google.com",
                  },
                  committed: true,
                  frameUrl: "https://news.google.com",
                  isMainFrame: true,
                  pageAlias: "page",
                  title:
                    "Go to https://news.google.com/topstories?hl=en-US&gl=US&ceid=US:en",
                },
              ],
            },
          ],
          [
            {
              actions: [
                {
                  action: {
                    name: "navigate",
                    signals: [],
                    url: "https://news.google.com",
                  },
                  committed: true,
                  frameUrl: "https://news.google.com",
                  isMainFrame: true,
                  pageAlias: "page",
                  title:
                    "Go to https://news.google.com/topstories?hl=en-US&gl=US&ceid=US:en",
                },
                {
                  pageAlias: "page",
                  isMainFrame: true,
                  frameUrl: "https://www.google.com/",
                  action: {
                    name: "click",
                    selector: '[aria-label="Search"]',
                    signals: [],
                    button: "left",
                    modifiers: 0,
                    clickCount: 1,
                  },
                  committed: true,
                  title: 'Click [aria-label="Search"]',
                },
              ],
            },
          ]
        )
      ).toEqual([
        {
          actions: [
            {
              action: {
                name: "navigate",
                signals: [],
                url: "https://news.google.com",
              },
              committed: true,
              frameUrl: "https://news.google.com",
              isMainFrame: true,
              pageAlias: "page",
              title:
                "Go to https://news.google.com/topstories?hl=en-US&gl=US&ceid=US:en",
            },
            {
              pageAlias: "page",
              isMainFrame: true,
              frameUrl: "https://www.google.com/",
              action: {
                name: "click",
                selector: '[aria-label="Search"]',
                signals: [],
                button: "left",
                modifiers: 0,
                clickCount: 1,
              },
              committed: true,
              title: 'Click [aria-label="Search"]',
            },
          ],
        },
      ]);
    });
  });
});
