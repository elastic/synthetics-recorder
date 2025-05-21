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

import { fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { createStep } from '../../../common/helper/test/createAction';
import { render } from '../../helpers/test';
import { getMockElectronApi } from '../../helpers/test/mockApi';
import { TestResult } from './TestResult';

describe('TestResult', () => {
  it('does not render the flyout if there is no result data', () => {
    const { queryByTestId } = render(<TestResult />, {
      contextOverrides: {
        test: {
          result: {
            failed: 0,
            succeeded: 0,
            skipped: 0,
            journey: {
              status: 'succeeded',
              steps: [],
              type: 'project',
            },
          },
        },
      },
    });
    expect(queryByTestId('result-flyout-title')).toBeNull();
  });

  it('does not render the flyout if result is falsy', () => {
    const { queryByTestId } = render(<TestResult />, {
      contextOverrides: {
        test: {
          isResultFlyoutVisible: true,
          result: undefined,
        },
      },
    });
    expect(queryByTestId('result-flyout-title')).toBeNull();
  });

  it('does not render the flyout if the total is 0', () => {
    const { queryByTestId } = render(<TestResult />, {
      contextOverrides: {
        test: {
          isResultFlyoutVisible: true,
          result: {
            failed: 0,
            succeeded: 0,
            skipped: 0,
            journey: {
              status: 'succeeded',
              steps: [],
              type: 'project',
            },
          },
        },
      },
    });
    expect(queryByTestId('result-flyout-title')).toBeNull();
  });

  it('renders the flyout for a success result', () => {
    const { getByText, getByRole } = render(<TestResult />, {
      contextOverrides: {
        test: {
          isResultFlyoutVisible: true,
          result: {
            failed: 0,
            succeeded: 2,
            skipped: 0,
            journey: {
              status: 'succeeded',
              steps: [
                {
                  duration: 2332,
                  name: 'Load page',
                  status: 'succeeded',
                },
                {
                  duration: 5023,
                  name: 'Click save',
                  status: 'succeeded',
                },
              ],
              type: 'project',
            },
          },
        },
      },
    });
    expect(getByRole('heading', { name: 'Journey Test Result' }));
    expect(getByText('1: Load page'));
    expect(getByText('2s'));
    expect(getByText('2: Click save'));
    expect(getByText('5s'));
  });

  it('calls the close function on flyout close', async () => {
    const setIsResultFlyoutVisible = jest.fn();
    const { getByLabelText } = render(<TestResult />, {
      contextOverrides: {
        test: {
          isResultFlyoutVisible: true,
          setIsResultFlyoutVisible,
          result: {
            failed: 0,
            succeeded: 2,
            skipped: 0,
            journey: {
              status: 'succeeded',
              steps: [
                {
                  duration: 2332,
                  name: 'Load page',
                  status: 'succeeded',
                },
                {
                  duration: 5023,
                  name: 'Click save',
                  status: 'succeeded',
                },
              ],
              type: 'project',
            },
          },
        },
      },
    });

    const closeButton = getByLabelText('Close this dialog');

    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(setIsResultFlyoutVisible).toHaveBeenCalledTimes(1);
    });
  });

  it('renders the flyout with error message and code for failed step', async () => {
    const errorMessage = 'Save button timeout expired';
    const generateCode = jest.fn();
    generateCode.mockImplementation(() => {
      return `
step('Click save', () => {
	await page.click('my button');
})`;
    });
    const { getByText, queryByText } = render(<TestResult />, {
      contextOverrides: {
        communication: { electronAPI: getMockElectronApi({ generateCode }) },
        steps: { steps: [createStep(['Click save'])] },
        test: {
          isResultFlyoutVisible: true,
          result: {
            failed: 1,
            succeeded: 1,
            skipped: 0,
            journey: {
              status: 'failed',
              steps: [
                {
                  duration: 2332,
                  name: 'Load page',
                  status: 'succeeded',
                },
                {
                  duration: 5023,
                  name: 'Click save',
                  status: 'failed',
                  error: Error(errorMessage),
                },
              ],
              type: 'project',
            },
          },
        },
      },
    });
    expect(getByText(errorMessage));
    await waitFor(() => {
      queryByText(`step('Click save', () => {`, { exact: false });
    });
  });
});
