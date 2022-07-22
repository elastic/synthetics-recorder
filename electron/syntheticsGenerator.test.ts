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

import /* Step, Steps */ '@elastic/synthetics';
import { SyntheticsGenerator } from './syntheticsGenerator';
import {
  createStepsWithOverrides,
  createStepWithOverrides,
} from '../common/helper/test/createAction';
import type { Step, Steps } from '../common/types';

const recorderStep = createStepWithOverrides([
  {
    frame: {
      url: 'about:blank',
    },
    action: {
      name: 'openPage',
      url: 'about:blank',
    },
  },
  {
    frame: {
      url: 'https://vigneshh.in/',
    },
    action: {
      name: 'navigate',
      url: 'https://vigneshh.in/',
    },
  },
  {
    frame: {
      url: 'https://vignesh.in/',
    },
    action: {
      name: 'assert',
      isAssert: true,
      command: 'isVisible',
      selector: 'text=Babel Minify',
    },
  },
  {
    frame: {
      url: 'https://vigneshh.in/',
    },
    action: {
      name: 'assert',
      isAssert: true,
      command: 'isEditable',
      selector: 'text=Babel Minify',
    },
  },
  {
    frame: {
      url: 'https://vigneshh.in/',
    },
    action: {
      name: 'assert',
      isAssert: true,
      command: 'textContent',
      selector: 'text=Babel Minify',
      value: 'Babel',
    },
  },
  {
    frame: {
      url: 'https://vigneshh.in/',
    },
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
    frame: {
      url: 'https://github.com/babel/minify',
      pageAlias: 'page1',
    },
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
    frame: {
      url: 'https://github.com/babel/minify',
      pageAlias: 'page1',
    },
    action: {
      name: 'closePage',
    },
  },
  {
    frame: {
      url: 'https://vigneshh.in/',
    },
    action: {
      name: 'closePage',
    },
  },
]);

describe('Synthetics JavaScript formatter', () => {
  it('accepts custom step organization', () => {
    const generator = new SyntheticsGenerator(true);
    const testSteps: Steps = [
      { actions: recorderStep.actions.slice(0, 2) },
      { actions: recorderStep.actions.slice(2, 4) },
      { actions: recorderStep.actions.slice(4, 7) },
      { actions: recorderStep.actions.slice(7, 9) },
    ];
    expect(generator.generateFromSteps(testSteps)).toMatchSnapshot();
  });

  it('uses custom step names', () => {
    const generator = new SyntheticsGenerator(false);
    const testSteps: Steps = [{ actions: recorderStep.actions.slice(0, 4) }];
    expect(
      generator.generateFromSteps(
        testSteps.map((s: Step) => {
          s.name = 'test-name';
          return s;
        })
      )
    ).toMatchSnapshot();
  });

  it('throws error if processing empty step', () => {
    const generator = new SyntheticsGenerator(false);
    const testSteps: Steps = [{ actions: [] }];
    expect(() => generator.generateFromSteps(testSteps)).toThrowError(
      'Cannot process an empty step'
    );
  });

  it('counts pages that cross steps', () => {
    const generator = new SyntheticsGenerator(false);
    const steps = createStepsWithOverrides([
      [
        {
          frame: {
            url: 'https://vigneshh.in',
          },
          action: {
            name: 'navigate',
            url: 'https://vigneshh.in/',
          },
        },
        {
          frame: {
            url: 'https://vigneshh.in/',
          },
          action: {
            name: 'click',
            selector: 'text=Tailor',
            signals: [{ name: 'popup', popupAlias: 'page1', isAsync: true }],
            button: 'left',
            modifiers: 0,
            clickCount: 1,
          },
        },
        {
          frame: {
            url: 'https://github.com/zalando/tailor',
            pageAlias: 'page1',
          },
          action: {
            name: 'click',
            selector: 'text=Packages 0',
            signals: [
              {
                name: 'navigation',
                url: 'https://github.com/orgs/zalando/packages?repo_name=tailor',
              },
            ],
            button: 'left',
            modifiers: 0,
            clickCount: 1,
          },
        },
      ],
      [
        {
          frame: {
            url: 'https://github.com/orgs/zalando/packages?repo_name=tailor',
            pageAlias: 'page1',
          },
          action: { name: 'closePage' },
        },
      ],
      [
        {
          frame: {
            url: 'https://vigneshh.in/',
          },
          action: {
            name: 'click',
            selector: 'text=Babel Minify',
            signals: [{ name: 'popup', popupAlias: 'page2', isAsync: true }],
            button: 'left',
            modifiers: 0,
            clickCount: 1,
          },
        },
        {
          frame: {
            url: 'https://github.com/babel/minify',
            pageAlias: 'page2',
          },
          action: {
            name: 'click',
            selector: ':nth-match(a:has-text("babel-minify"), 3)',
            signals: [{ name: 'navigation', url: 'https://github.com/topics/babel-minify' }],
            button: 'left',
            modifiers: 0,
            clickCount: 1,
          },
        },
      ],
      [
        {
          frame: {
            url: 'https://github.com/topics/babel-minify',
            pageAlias: 'page2',
          },
          action: { name: 'closePage' },
        },
      ],
    ]);
    expect(generator.findVarsToHoist(steps)).toEqual(['page1', 'page2']);
  });

  it('does not hoist when all accesses are in one step', () => {
    expect(
      new SyntheticsGenerator(false).generateFromSteps(
        createStepsWithOverrides([
          [
            {
              frame: {
                url: 'https://vigneshh.in/',
              },
              action: { name: 'navigate', url: 'https://vigneshh.in/' },
            },
            {
              frame: {
                url: 'https://vigneshh.in/',
              },
              action: {
                name: 'click',
                selector: 'text=Tailor',
                signals: [{ name: 'popup', popupAlias: 'page1', isAsync: true }],
                button: 'left',
                modifiers: 0,
                clickCount: 1,
              },
            },
            {
              frame: {
                url: 'https://github.com/zalando/tailor',
                pageAlias: 'page1',
              },
              action: {
                name: 'click',
                selector: 'text=Packages 0',
                signals: [
                  {
                    name: 'navigation',
                    url: 'https://github.com/orgs/zalando/packages?repo_name=tailor',
                  },
                ],
                button: 'left',
                modifiers: 0,
                clickCount: 1,
              },
            },
            {
              frame: {
                url: 'https://github.com/orgs/zalando/packages?repo_name=tailor',
                pageAlias: 'page1',
              },
              action: { name: 'closePage' },
            },
            {
              frame: {
                url: 'https://vigneshh.in/',
              },
              action: {
                name: 'click',
                selector: 'text=Babel Minify',
                signals: [{ name: 'popup', popupAlias: 'page2', isAsync: true }],
                button: 'left',
                modifiers: 0,
                clickCount: 1,
              },
            },
            {
              frame: {
                url: 'https://github.com/babel/minify',
                pageAlias: 'page2',
              },
              action: { name: 'closePage' },
            },
          ],
        ])
      )
    ).toMatchSnapshot();
  });

  it('hoist accounts for popup alias', () => {
    expect(
      new SyntheticsGenerator(false).generateFromSteps(
        createStepsWithOverrides([
          [
            {
              frame: {
                url: 'https://vigneshh.in/',
              },
              action: { name: 'navigate', url: 'https://vigneshh.in/' },
            },
            {
              frame: {
                url: 'https://vigneshh.in/',
              },
              action: {
                name: 'click',
                selector: 'text=Tailor',
                signals: [{ name: 'popup', popupAlias: 'page1', isAsync: true }],
                button: 'left',
                modifiers: 0,
                clickCount: 1,
              },
            },
            {
              frame: {
                url: 'https://github.com/zalando/tailor',
                pageAlias: 'page1',
              },
              action: {
                name: 'click',
                selector: 'text=Packages 0',
                signals: [
                  {
                    name: 'navigation',
                    url: 'https://github.com/orgs/zalando/packages?repo_name=tailor',
                  },
                ],
                button: 'left',
                modifiers: 0,
                clickCount: 1,
              },
            },
          ],
          [
            {
              frame: {
                url: 'https://github.com/orgs/zalando/packages?repo_name=tailor',
                pageAlias: 'page1',
              },
              action: { name: 'closePage' },
            },
            {
              frame: {
                url: 'https://vigneshh.in/',
              },
              action: {
                name: 'click',
                selector: 'text=Babel Minify',
                signals: [{ name: 'popup', popupAlias: 'page2', isAsync: true }],
                button: 'left',
                modifiers: 0,
                clickCount: 1,
              },
            },
          ],
          [
            {
              frame: {
                url: 'https://github.com/babel/minify',
                pageAlias: 'page2',
              },
              action: { name: 'closePage' },
            },
          ],
        ])
      )
    ).toMatchSnapshot();
  });

  it('hoists page objects to prevent undefined references', () => {
    expect(
      new SyntheticsGenerator(false).generateFromSteps(
        createStepsWithOverrides([
          [
            {
              frame: {
                url: 'https://vigneshh.in/',
              },
              action: { name: 'navigate', url: 'https://vigneshh.in/' },
            },
            {
              frame: {
                url: 'https://vigneshh.in/',
              },
              action: {
                name: 'click',
                selector: 'text=Tailor',
                signals: [{ name: 'popup', popupAlias: 'page1', isAsync: true }],
                button: 'left',
                modifiers: 0,
                clickCount: 1,
              },
            },
            {
              frame: {
                url: 'https://github.com/zalando/tailor',
                pageAlias: 'page1',
              },
              action: {
                name: 'click',
                selector: 'text=Packages 0',
                signals: [
                  {
                    name: 'navigation',
                    url: 'https://github.com/orgs/zalando/packages?repo_name=tailor',
                  },
                ],
                button: 'left',
                modifiers: 0,
                clickCount: 1,
              },
            },
          ],
          [
            {
              frame: {
                url: 'https://github.com/orgs/zalando/packages?repo_name=tailor',
                pageAlias: 'page1',
              },
              action: { name: 'closePage' },
            },
          ],
          [
            {
              frame: {
                url: 'https://vigneshh.in/',
              },
              action: {
                name: 'click',
                selector: 'text=Babel Minify',
                signals: [{ name: 'popup', popupAlias: 'page2', isAsync: true }],
                button: 'left',
                modifiers: 0,
                clickCount: 1,
              },
            },
            {
              frame: {
                url: 'https://github.com/babel/minify',
                pageAlias: 'page2',
              },
              action: {
                name: 'click',
                selector: ':nth-match(a:has-text("babel-minify"), 3)',
                signals: [{ name: 'navigation', url: 'https://github.com/topics/babel-minify' }],
                button: 'left',
                modifiers: 0,
                clickCount: 1,
              },
            },
          ],
          [
            {
              frame: {
                url: 'https://github.com/topics/babel-minify',
                pageAlias: 'page2',
              },
              action: { name: 'closePage' },
            },
          ],
        ])
      )
    ).toMatchSnapshot();
  });
});
