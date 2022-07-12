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

import { resultReducer } from './resultReducer';

describe('result reducer', () => {
  it.each(['inline', 'project'])('initializes result on journey start', type => {
    expect(
      resultReducer(undefined, {
        event: 'journey/start',
        data: { name: type },
      })
    ).toEqual({
      failed: 0,
      skipped: 0,
      succeeded: 0,
      journey: {
        status: 'running',
        type: type,
        steps: [],
      },
    });
  });

  it('adds success step to result', () => {
    expect(
      resultReducer(undefined, {
        event: 'step/end',
        data: {
          actionTitles: ['Go to https://en.wikipedia.org/wiki/%22Hello,_World!%22_program'],
          name: 'Go to https://en.wikipedia.org/wiki/%22Hello,_World!%22_program',
          status: 'succeeded',
          duration: 491,
        },
      })
    ).toEqual({
      failed: 0,
      skipped: 0,
      succeeded: 1,
      journey: {
        status: 'running',
        type: 'inline',
        steps: [
          {
            actionTitles: ['Go to https://en.wikipedia.org/wiki/%22Hello,_World!%22_program'],
            duration: 491,
            name: 'Go to https://en.wikipedia.org/wiki/%22Hello,_World!%22_program',
            status: 'succeeded',
          },
        ],
      },
    });
  });

  it('adds failed step to result', () => {
    expect(
      resultReducer(undefined, {
        event: 'step/end',
        data: {
          actionTitles: ['Go to https://en.wikipedia.org/wiki/%22Hello,_World!%22_program'],
          name: 'Go to https://en.wikipedia.org/wiki/%22Hello,_World!%22_program',
          status: 'failed',
          duration: 9000,
        },
      })
    ).toEqual({
      failed: 1,
      skipped: 0,
      succeeded: 0,
      journey: {
        status: 'running',
        type: 'inline',
        steps: [
          {
            actionTitles: ['Go to https://en.wikipedia.org/wiki/%22Hello,_World!%22_program'],
            duration: 9000,
            name: 'Go to https://en.wikipedia.org/wiki/%22Hello,_World!%22_program',
            status: 'failed',
          },
        ],
      },
    });
  });

  it('adds skipped step to result', () => {
    expect(
      resultReducer(undefined, {
        event: 'step/end',
        data: {
          actionTitles: ['Go to https://en.wikipedia.org/wiki/%22Hello,_World!%22_program'],
          name: 'Go to https://en.wikipedia.org/wiki/%22Hello,_World!%22_program',
          status: 'skipped',
          duration: 0,
        },
      })
    ).toEqual({
      failed: 0,
      skipped: 1,
      succeeded: 0,
      journey: {
        status: 'running',
        type: 'inline',
        steps: [
          {
            actionTitles: ['Go to https://en.wikipedia.org/wiki/%22Hello,_World!%22_program'],
            duration: 0,
            name: 'Go to https://en.wikipedia.org/wiki/%22Hello,_World!%22_program',
            status: 'skipped',
          },
        ],
      },
    });
  });

  it('updates the result to the final state from journey/end', () => {
    expect(
      resultReducer(
        {
          failed: 0,
          skipped: 0,
          succeeded: 1,
          journey: {
            status: 'running',
            type: 'inline',
            steps: [
              {
                actionTitles: ['Go to https://www.elastic.co'],
                duration: 100,
                name: 'Go to https://www.elastic.co',
                status: 'succeeded',
              },
            ],
          },
        },
        {
          event: 'journey/end',
          data: { name: 'inline', status: 'succeeded' },
        }
      )
    ).toEqual({
      failed: 0,
      skipped: 0,
      succeeded: 1,
      journey: {
        status: 'succeeded',
        steps: [
          {
            actionTitles: ['Go to https://www.elastic.co'],
            duration: 100,
            name: 'Go to https://www.elastic.co',
            status: 'succeeded',
          },
        ],
        type: 'inline',
      },
    });
  });

  it('constructs expected result for multiple calls', () => {
    const a = resultReducer(undefined, {
      event: 'journey/start',
      data: { name: 'inline' },
    });
    const b = resultReducer(a, {
      event: 'step/end',
      data: {
        actionTitles: ['Go to https://en.wikipedia.org/wiki/%22Hello,_World!%22_program'],
        name: 'Go to https://en.wikipedia.org/wiki/%22Hello,_World!%22_program',
        status: 'succeeded',
        duration: 491,
      },
    });
    const c = resultReducer(b, {
      event: 'step/end',
      data: {
        actionTitles: ['Go to https://en.wikipedia.org/wiki/%22Hello,_World!%22_program'],
        name: 'Go to https://en.wikipedia.org/wiki/%22Hello,_World!%22_program',
        status: 'failed',
        duration: 9000,
      },
    });
    const d = resultReducer(c, {
      event: 'step/end',
      data: {
        actionTitles: [
          'Go to https://en.wikipedia.org/wiki/%22Hello,_World!%22_program',
          'A second action',
        ],
        name: 'Go to https://en.wikipedia.org/wiki/%22Hello,_World!%22_program',
        status: 'skipped',
        duration: 0,
      },
    });
    const e = resultReducer(d, {
      event: 'journey/end',
      data: { name: 'inline', status: 'failed' },
    });
    expect(e).toEqual({
      failed: 1,
      skipped: 1,
      succeeded: 1,
      journey: {
        status: 'failed',
        type: 'inline',
        steps: [
          {
            actionTitles: ['Go to https://en.wikipedia.org/wiki/%22Hello,_World!%22_program'],
            name: 'Go to https://en.wikipedia.org/wiki/%22Hello,_World!%22_program',
            status: 'succeeded',
            duration: 491,
          },
          {
            actionTitles: ['Go to https://en.wikipedia.org/wiki/%22Hello,_World!%22_program'],
            name: 'Go to https://en.wikipedia.org/wiki/%22Hello,_World!%22_program',
            status: 'failed',
            duration: 9000,
          },
          {
            actionTitles: [
              'Go to https://en.wikipedia.org/wiki/%22Hello,_World!%22_program',
              'A second action',
            ],
            duration: 0,
            name: 'Go to https://en.wikipedia.org/wiki/%22Hello,_World!%22_program',
            status: 'skipped',
          },
        ],
      },
    });
  });

  it('handles override actions', () => {
    expect(
      resultReducer(
        {
          failed: 1,
          skipped: 1,
          succeeded: 1,
          journey: {
            status: 'failed',
            type: 'inline',
            steps: [],
          },
        },
        { event: 'override', data: undefined }
      )
    ).toBeUndefined();
  });
});
