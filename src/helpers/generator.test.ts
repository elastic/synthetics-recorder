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

import type { Step, Steps } from '@elastic/synthetics';
import { ActionContext } from '../common/types';
import { generateIR, generateMergedIR } from './generator';
import {
  createAction,
  createStepWithOverrides,
  createStepsWithOverrides,
} from '../../common/helper';

describe('generator', () => {
  describe('generateIR', () => {
    let step: Step;
    beforeEach(() => {
      step = createStepWithOverrides([
        {
          frameUrl: 'about:blank',
          action: {
            name: 'openPage',
            url: 'about:blank',
          },
        },
        {
          action: {
            name: 'navigate',
          },
        },
        {
          action: {
            name: 'click',
            selector: 'text=I Enjoy evangelizing the magic of web performance.',
            button: 'left',
            modifiers: 0,
            clickCount: 1,
          },
        },
        {
          action: {
            name: 'assert',
            isAssert: true,
            command: 'textContent',
            selector: 'text=Babel Minify',
            value: 'babel',
          },
        },
        {
          action: {
            name: 'click',
            selector: 'text=Babel Minify',
            signals: [
              {
                name: 'popup',
                popupAlias: 'page1',
                isAsync: true,
              },
            ],
            button: 'left',
            modifiers: 0,
            clickCount: 1,
          },
        },
        {
          action: {
            name: 'click',
            selector: 'a:has-text("smoke")',
            signals: [
              {
                name: 'navigation',
                url: 'https://github.com/babel/minify',
              },
              {
                name: 'navigation',
                url: 'https://github.com/babel/minify/tree/master/smoke',
              },
              {
                name: 'navigation',
                url: 'https://github.com/babel/minify/tree/master/smoke',
                isAsync: true,
              },
              {
                name: 'navigation',
                url: 'https://github.com/babel/minify',
                isAsync: true,
              },
            ],
            button: 'left',
            modifiers: 0,
            clickCount: 1,
          },
        },
        {
          action: { name: 'closePage' },
        },
        {
          action: { name: 'closePage' },
        },
      ]);
    });

    it('creates an enhanced IR', () => {
      const ir = generateIR([step]);

      expect(ir).toHaveLength(1);
      expect(ir[0].actions).toHaveLength(8);
    });

    it('keeps actions that already have a title', () => {
      const actionWithTitle = createAction('assert', {
        title: 'A custom title',
        action: {
          isAssert: true,
          command: 'textContent',
          selector: 'text=Babel Minify',
          value: 'babel',
        },
      });
      step.actions.push(actionWithTitle);
      const ir = generateIR([step]);
      const { length } = ir[0].actions;

      expect(ir[0].actions[length - 1]).toEqual(actionWithTitle);
    });
  });
  describe('generateMergedIR', () => {
    const prev: Steps = createStepsWithOverrides([
      [
        {
          action: {
            name: 'navigate',
          },
          modified: true,
          title: 'https://news.google.com',
        },
      ],
      [
        {
          action: {
            name: 'navigate',
          },
          title: 'Go to https://www.google.com/',
        },
        {
          action: {
            name: 'click',
            selector: '[aria-label="Search"]',
            button: 'left',
            modifiers: 0,
            clickCount: 1,
          },
          title: 'Click [aria-label="Search"]',
        },
        {
          action: {
            name: 'fill',
            selector: '[aria-label="Search"]',
            text: 'hello world',
          },
          title: 'Fill [aria-label="Search"]',
        },
        {
          action: {
            name: 'press',
            selector: '[aria-label="Search"]',
            signals: [
              {
                name: 'navigation',
                url: 'https://www.google.com/search?q=hello+world&source=hp&ei=HN8wYuGUN6aD9PwP3ryR2A8&iflsig=AHkkrS4AAAAAYjDtLG_pgIZ4vhlN3VoBrRzhKb2cOf9Y&ved=0ahUKEwjhkrvD48j2AhWmAZ0JHV5eBPsQ4dUDCAk&uact=5&oq=hello+world&gs_lcp=Cgdnd3Mtd2l6EAMyCAgAEIAEELEDMggILhCABBCxAzIICC4QgAQQsQMyCwguEIAEELEDENQCMggIABCABBCxAzIICAAQgAQQsQMyCAgAEIAEELEDMgsILhCABBCxAxDUAjIICAAQgAQQsQMyCAgAEIAEELEDOg4IABCPARDqAhCMAxDlAjoOCC4QjwEQ6gIQjAMQ5QI6DgguEIAEELEDEMcBEKMCOgsIABCABBCxAxCDAToLCC4QgAQQxwEQrwE6CggAELEDEIMBEAo6CAguELEDEIMBOhEILhCABBCxAxCDARDHARCjAjoRCC4QgAQQsQMQgwEQxwEQrwE6BQguEIAEOg4ILhCABBCxAxDHARDRAzoOCC4QgAQQxwEQrwEQ1AI6CwguELEDEMcBEKMCOgUIABCABDoRCC4QgAQQsQMQgwEQxwEQ0QM6CwguEIAEELEDEIMBOgsIABCABBCxAxDJAzoHCAAQsQMQCjoQCC4QgAQQsQMQxwEQ0QMQCjoICAAQgAQQyQM6CAguEIAEENQCUKMEWNYOYPAPaAFwAHgAgAFUiAGcBpIBAjExmAEAoAEBsAEK&sclient=gws-wiz',
              },
              {
                name: 'navigation',
                url: 'https://www.google.com/search?q=hello+world&source=hp&ei=HN8wYuGUN6aD9PwP3ryR2A8&iflsig=AHkkrS4AAAAAYjDtLG_pgIZ4vhlN3VoBrRzhKb2cOf9Y&ved=0ahUKEwjhkrvD48j2AhWmAZ0JHV5eBPsQ4dUDCAk&uact=5&oq=hello+world&gs_lcp=Cgdnd3Mtd2l6EAMyCAgAEIAEELEDMggILhCABBCxAzIICC4QgAQQsQMyCwguEIAEELEDENQCMggIABCABBCxAzIICAAQgAQQsQMyCAgAEIAEELEDMgsILhCABBCxAxDUAjIICAAQgAQQsQMyCAgAEIAEELEDOg4IABCPARDqAhCMAxDlAjoOCC4QjwEQ6gIQjAMQ5QI6DgguEIAEELEDEMcBEKMCOgsIABCABBCxAxCDAToLCC4QgAQQxwEQrwE6CggAELEDEIMBEAo6CAguELEDEIMBOhEILhCABBCxAxCDARDHARCjAjoRCC4QgAQQsQMQgwEQxwEQrwE6BQguEIAEOg4ILhCABBCxAxDHARDRAzoOCC4QgAQQxwEQrwEQ1AI6CwguELEDEMcBEKMCOgUIABCABDoRCC4QgAQQsQMQgwEQxwEQ0QM6CwguEIAEELEDEIMBOgsIABCABBCxAxDJAzoHCAAQsQMQCjoQCC4QgAQQsQMQxwEQ0QMQCjoICAAQgAQQyQM6CAguEIAEENQCUKMEWNYOYPAPaAFwAHgAgAFUiAGcBpIBAjExmAEAoAEBsAEK&sclient=gws-wiz',
                isAsync: true,
              },
            ],
            key: 'Enter',
            modifiers: 0,
          },
          title: 'Press Enter',
        },
        {
          action: {
            name: 'click',
            selector: 'text=/.*"Hello, World!" program - Wikipedia.*/',
            signals: [
              {
                name: 'navigation',
                url: 'https://en.wikipedia.org/wiki/%22Hello,_World!%22_program',
              },
            ],
            button: 'left',
            modifiers: 0,
            clickCount: 1,
          },
          title: 'Click text=/.*"Hello, World!" program - Wikipedia.*/',
        },
        {
          action: {
            name: 'click',
            selector: 'text=Main page',
            signals: [
              {
                name: 'navigation',
              },
            ],
            button: 'left',
            modifiers: 0,
            clickCount: 1,
          },
          title: 'Click text=Main page',
        },
      ],
      [
        {
          action: {
            name: 'navigate',
          },
          title: 'Go to https://news.google.com/topstories?hl=en-US&gl=US&ceid=US:en',
        },
      ],
    ]);
    const cur: Steps = createStepsWithOverrides([
      [
        {
          action: {
            name: 'navigate',
          },
          title: 'Go to https://www.google.com/?gws_rd=ssl',
        },
        {
          action: {
            name: 'navigate',
          },
          title: 'Go to https://www.google.com/',
        },
        {
          action: {
            name: 'click',
            selector: '[aria-label="Search"]',
            button: 'left',
            modifiers: 0,
            clickCount: 1,
          },
          title: 'Click [aria-label="Search"]',
        },
        {
          action: {
            name: 'fill',
            selector: '[aria-label="Search"]',
            signals: [],
            text: 'hello world',
          },
          title: 'Fill [aria-label="Search"]',
        },
        {
          action: {
            name: 'press',
            selector: '[aria-label="Search"]',
            signals: [
              {
                name: 'navigation',
                url: 'https://www.google.com/search?q=hello+world&source=hp&ei=HN8wYuGUN6aD9PwP3ryR2A8&iflsig=AHkkrS4AAAAAYjDtLG_pgIZ4vhlN3VoBrRzhKb2cOf9Y&ved=0ahUKEwjhkrvD48j2AhWmAZ0JHV5eBPsQ4dUDCAk&uact=5&oq=hello+world&gs_lcp=Cgdnd3Mtd2l6EAMyCAgAEIAEELEDMggILhCABBCxAzIICC4QgAQQsQMyCwguEIAEELEDENQCMggIABCABBCxAzIICAAQgAQQsQMyCAgAEIAEELEDMgsILhCABBCxAxDUAjIICAAQgAQQsQMyCAgAEIAEELEDOg4IABCPARDqAhCMAxDlAjoOCC4QjwEQ6gIQjAMQ5QI6DgguEIAEELEDEMcBEKMCOgsIABCABBCxAxCDAToLCC4QgAQQxwEQrwE6CggAELEDEIMBEAo6CAguELEDEIMBOhEILhCABBCxAxCDARDHARCjAjoRCC4QgAQQsQMQgwEQxwEQrwE6BQguEIAEOg4ILhCABBCxAxDHARDRAzoOCC4QgAQQxwEQrwEQ1AI6CwguELEDEMcBEKMCOgUIABCABDoRCC4QgAQQsQMQgwEQxwEQ0QM6CwguEIAEELEDEIMBOgsIABCABBCxAxDJAzoHCAAQsQMQCjoQCC4QgAQQsQMQxwEQ0QMQCjoICAAQgAQQyQM6CAguEIAEENQCUKMEWNYOYPAPaAFwAHgAgAFUiAGcBpIBAjExmAEAoAEBsAEK&sclient=gws-wiz',
              },
              {
                name: 'navigation',
                url: 'https://www.google.com/search?q=hello+world&source=hp&ei=HN8wYuGUN6aD9PwP3ryR2A8&iflsig=AHkkrS4AAAAAYjDtLG_pgIZ4vhlN3VoBrRzhKb2cOf9Y&ved=0ahUKEwjhkrvD48j2AhWmAZ0JHV5eBPsQ4dUDCAk&uact=5&oq=hello+world&gs_lcp=Cgdnd3Mtd2l6EAMyCAgAEIAEELEDMggILhCABBCxAzIICC4QgAQQsQMyCwguEIAEELEDENQCMggIABCABBCxAzIICAAQgAQQsQMyCAgAEIAEELEDMgsILhCABBCxAxDUAjIICAAQgAQQsQMyCAgAEIAEELEDOg4IABCPARDqAhCMAxDlAjoOCC4QjwEQ6gIQjAMQ5QI6DgguEIAEELEDEMcBEKMCOgsIABCABBCxAxCDAToLCC4QgAQQxwEQrwE6CggAELEDEIMBEAo6CAguELEDEIMBOhEILhCABBCxAxCDARDHARCjAjoRCC4QgAQQsQMQgwEQxwEQrwE6BQguEIAEOg4ILhCABBCxAxDHARDRAzoOCC4QgAQQxwEQrwEQ1AI6CwguELEDEMcBEKMCOgUIABCABDoRCC4QgAQQsQMQgwEQxwEQ0QM6CwguEIAEELEDEIMBOgsIABCABBCxAxDJAzoHCAAQsQMQCjoQCC4QgAQQsQMQxwEQ0QMQCjoICAAQgAQQyQM6CAguEIAEENQCUKMEWNYOYPAPaAFwAHgAgAFUiAGcBpIBAjExmAEAoAEBsAEK&sclient=gws-wiz',
                isAsync: true,
              },
            ],
            key: 'Enter',
            modifiers: 0,
          },
          title: 'Press Enter',
        },
        {
          action: {
            name: 'click',
            selector: 'text=/.*"Hello, World!" program - Wikipedia.*/',
            signals: [
              {
                name: 'navigation',
                url: 'https://en.wikipedia.org/wiki/%22Hello,_World!%22_program',
              },
            ],
            button: 'left',
            modifiers: 0,
            clickCount: 1,
          },
          title: 'Click text=/.*"Hello, World!" program - Wikipedia.*/',
        },
        {
          action: {
            name: 'click',
            selector: 'text=Main page',
            signals: [
              {
                name: 'navigation',
                url: 'https://en.wikipedia.org/wiki/Main_Page',
              },
            ],
            button: 'left',
            modifiers: 0,
            clickCount: 1,
          },
          title: 'Click text=Main page',
        },
        {
          action: {
            name: 'navigate',
          },
          title: 'Go to https://news.google.com/topstories?hl=en-US&gl=US&ceid=US:en',
        },
      ],
    ]);

    it('returns next PW actions if no previous steps', () => {
      expect(generateMergedIR([], cur)).toEqual(cur);
    });

    it('returns empty set if PW actions are empty', () => {
      expect(generateMergedIR(prev, [])).toEqual([]);
    });

    it('picks up assertions', () => {
      const assert: ActionContext = createAction('assert', {
        action: {
          isAssert: true,
          name: 'assert',
          command: 'visible',
          selector: 'text=Babel Minify',
          modifiers: 0,
          clickCount: 1,
        },
      });
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

    it('merges updated actions with modified UI actions', () => {
      expect(generateMergedIR(prev, cur)).toEqual(
        createStepsWithOverrides([
          [
            {
              action: {
                name: 'navigate',
              },
              modified: true,
              title: 'https://news.google.com',
            },
          ],
          [
            {
              action: {
                name: 'navigate',
              },
              title: 'Go to https://www.google.com/',
            },
            {
              action: {
                button: 'left',
                clickCount: 1,
                modifiers: 0,
                name: 'click',
                selector: '[aria-label="Search"]',
              },
              title: 'Click [aria-label="Search"]',
            },
            {
              action: {
                name: 'fill',
                selector: '[aria-label="Search"]',
                text: 'hello world',
              },
              title: 'Fill [aria-label="Search"]',
            },
            {
              action: {
                key: 'Enter',
                modifiers: 0,
                name: 'press',
                selector: '[aria-label="Search"]',
                signals: [
                  {
                    name: 'navigation',
                    url: 'https://www.google.com/search?q=hello+world&source=hp&ei=HN8wYuGUN6aD9PwP3ryR2A8&iflsig=AHkkrS4AAAAAYjDtLG_pgIZ4vhlN3VoBrRzhKb2cOf9Y&ved=0ahUKEwjhkrvD48j2AhWmAZ0JHV5eBPsQ4dUDCAk&uact=5&oq=hello+world&gs_lcp=Cgdnd3Mtd2l6EAMyCAgAEIAEELEDMggILhCABBCxAzIICC4QgAQQsQMyCwguEIAEELEDENQCMggIABCABBCxAzIICAAQgAQQsQMyCAgAEIAEELEDMgsILhCABBCxAxDUAjIICAAQgAQQsQMyCAgAEIAEELEDOg4IABCPARDqAhCMAxDlAjoOCC4QjwEQ6gIQjAMQ5QI6DgguEIAEELEDEMcBEKMCOgsIABCABBCxAxCDAToLCC4QgAQQxwEQrwE6CggAELEDEIMBEAo6CAguELEDEIMBOhEILhCABBCxAxCDARDHARCjAjoRCC4QgAQQsQMQgwEQxwEQrwE6BQguEIAEOg4ILhCABBCxAxDHARDRAzoOCC4QgAQQxwEQrwEQ1AI6CwguELEDEMcBEKMCOgUIABCABDoRCC4QgAQQsQMQgwEQxwEQ0QM6CwguEIAEELEDEIMBOgsIABCABBCxAxDJAzoHCAAQsQMQCjoQCC4QgAQQsQMQxwEQ0QMQCjoICAAQgAQQyQM6CAguEIAEENQCUKMEWNYOYPAPaAFwAHgAgAFUiAGcBpIBAjExmAEAoAEBsAEK&sclient=gws-wiz',
                  },
                  {
                    isAsync: true,
                    name: 'navigation',
                    url: 'https://www.google.com/search?q=hello+world&source=hp&ei=HN8wYuGUN6aD9PwP3ryR2A8&iflsig=AHkkrS4AAAAAYjDtLG_pgIZ4vhlN3VoBrRzhKb2cOf9Y&ved=0ahUKEwjhkrvD48j2AhWmAZ0JHV5eBPsQ4dUDCAk&uact=5&oq=hello+world&gs_lcp=Cgdnd3Mtd2l6EAMyCAgAEIAEELEDMggILhCABBCxAzIICC4QgAQQsQMyCwguEIAEELEDENQCMggIABCABBCxAzIICAAQgAQQsQMyCAgAEIAEELEDMgsILhCABBCxAxDUAjIICAAQgAQQsQMyCAgAEIAEELEDOg4IABCPARDqAhCMAxDlAjoOCC4QjwEQ6gIQjAMQ5QI6DgguEIAEELEDEMcBEKMCOgsIABCABBCxAxCDAToLCC4QgAQQxwEQrwE6CggAELEDEIMBEAo6CAguELEDEIMBOhEILhCABBCxAxCDARDHARCjAjoRCC4QgAQQsQMQgwEQxwEQrwE6BQguEIAEOg4ILhCABBCxAxDHARDRAzoOCC4QgAQQxwEQrwEQ1AI6CwguELEDEMcBEKMCOgUIABCABDoRCC4QgAQQsQMQgwEQxwEQ0QM6CwguEIAEELEDEIMBOgsIABCABBCxAxDJAzoHCAAQsQMQCjoQCC4QgAQQsQMQxwEQ0QMQCjoICAAQgAQQyQM6CAguEIAEENQCUKMEWNYOYPAPaAFwAHgAgAFUiAGcBpIBAjExmAEAoAEBsAEK&sclient=gws-wiz',
                  },
                ],
              },
              title: 'Press Enter',
            },
            {
              action: {
                button: 'left',
                clickCount: 1,
                modifiers: 0,
                name: 'click',
                selector: 'text=/.*"Hello, World!" program - Wikipedia.*/',
                signals: [
                  {
                    name: 'navigation',
                    url: 'https://en.wikipedia.org/wiki/%22Hello,_World!%22_program',
                  },
                ],
              },
              title: 'Click text=/.*"Hello, World!" program - Wikipedia.*/',
            },
            {
              action: {
                button: 'left',
                clickCount: 1,
                modifiers: 0,
                name: 'click',
                selector: 'text=Main page',
                signals: [
                  {
                    name: 'navigation',
                    url: 'https://en.wikipedia.org/wiki/Main_Page',
                  },
                ],
              },
              title: 'Click text=Main page',
            },
          ],
          [
            {
              action: {
                name: 'navigate',
              },
              title: 'Go to https://news.google.com/topstories?hl=en-US&gl=US&ceid=US:en',
            },
          ],
        ])
      );
    });

    it('picks up new actions', () => {
      expect(
        generateMergedIR(
          createStepsWithOverrides([
            [
              {
                action: {
                  name: 'navigate',
                },
                title: 'Go to https://news.google.com/topstories?hl=en-US&gl=US&ceid=US:en',
              },
            ],
          ]),
          createStepsWithOverrides([
            [
              {
                action: {
                  name: 'navigate',
                },
                title: 'Go to https://news.google.com/topstories?hl=en-US&gl=US&ceid=US:en',
              },
              {
                action: {
                  name: 'click',
                  selector: '[aria-label="Search"]',
                  button: 'left',
                  modifiers: 0,
                  clickCount: 1,
                },
                title: 'Click [aria-label="Search"]',
              },
            ],
          ])
        )
      ).toEqual(
        createStepsWithOverrides([
          [
            {
              action: {
                name: 'navigate',
              },
              title: 'Go to https://news.google.com/topstories?hl=en-US&gl=US&ceid=US:en',
            },
            {
              action: {
                name: 'click',
                selector: '[aria-label="Search"]',
                button: 'left',
                modifiers: 0,
                clickCount: 1,
              },
              title: 'Click [aria-label="Search"]',
            },
          ],
        ])
      );
    });
  });
});
