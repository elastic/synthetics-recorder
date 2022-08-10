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

// import type { Step } from '@elastic/synthetics';
import type { Step } from '../../common/types';
import { RendererProcessIpc } from 'electron-better-ipc';
import { getCodeForFailedResult } from './shared';

describe('shared', () => {
  describe('getCodeForFailedResult', () => {
    let mockIpc: RendererProcessIpc;

    beforeEach(() => {
      const mock = {
        answerMain: jest.fn(),
        callMain: jest.fn(),
      };
      mockIpc = mock as unknown as RendererProcessIpc;
    });

    it('returns empty string for undefined journey', async () => {
      expect(await getCodeForFailedResult(mockIpc, [])).toBe('');
    });

    it('returns an empty string if there are no failed steps in the journey', async () => {
      expect(
        await getCodeForFailedResult(mockIpc, [], {
          status: 'succeeded',
          type: 'inline',
          steps: [
            {
              duration: 10,
              name: 'I succeeded',
              status: 'succeeded',
            },
          ],
        })
      ).toBe('');
    });

    it('returns an empty string if there is no step title matching journey name', async () => {
      expect(
        await getCodeForFailedResult(mockIpc, [], {
          status: 'failed',
          type: 'inline',
          steps: [
            {
              duration: 10,
              name: 'I failed',
              status: 'failed',
            },
          ],
        })
      ).toBe('');
    });

    it('calls `getCodeFromActions` when a matching step for the failed journey step is found', async () => {
      const failedStep: Step = {
        actions: [
          {
            title: 'I failed',
            action: {
              name: 'click',
              signals: [],
            },
            frame: {
              isMainFrame: true,
              url: 'https://www.elastic.co',
              pageAlias: 'page alias',
            },
          },
        ],
      };

      await getCodeForFailedResult(mockIpc, [failedStep], {
        status: 'failed',
        type: 'inline',
        steps: [
          {
            duration: 10,
            name: 'I failed',
            status: 'failed',
          },
        ],
      });

      expect(mockIpc.callMain).toHaveBeenCalledTimes(1);
      expect(mockIpc.callMain).toHaveBeenCalledWith('actions-to-code', {
        actions: [failedStep],
        isProject: false,
      });
    });
  });
});
