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

import React from 'react';
import { fireEvent } from '@testing-library/react';
import { ExportScriptFlyout } from './Flyout';
import { render } from '../../helpers/test';
import { getMockIpc } from '../../helpers/test/ipc';
import { createSteps } from '../../../common/helper/test/createAction';

jest.mock('../../common/shared', () => ({
  getCodeFromActions: jest.fn().mockResolvedValue('test code'),
}));

const steps = createSteps([['step 1', 'step 2']]);

describe('ExportScriptFlyout', () => {
  it('renders header with correct text', () => {
    const setVisible = jest.fn();
    const { getByText } = render(<ExportScriptFlyout setVisible={setVisible} steps={steps} />, {
      contextOverrides: {
        communication: {
          ipc: getMockIpc(),
        },
      },
    });
    expect(getByText('Journey code'));
  });

  it('renders code in the body', async () => {
    const setVisible = jest.fn();
    const { findByText } = render(<ExportScriptFlyout setVisible={setVisible} steps={steps} />, {
      contextOverrides: {
        communication: {
          ipc: getMockIpc(),
        },
      },
    });
    expect(await findByText('test code'));
  });

  it('closes flyout on close button click', () => {
    const setVisible = jest.fn();
    const { getByText } = render(<ExportScriptFlyout setVisible={setVisible} steps={steps} />, {
      contextOverrides: {
        communication: {
          ipc: getMockIpc(),
        },
      },
    });
    fireEvent.click(getByText('Close'));
    expect(setVisible).toHaveBeenCalledWith(false);
  });

  it('toggles export as project', () => {
    const setVisible = jest.fn();
    const { getByLabelText } = render(
      <ExportScriptFlyout setVisible={setVisible} steps={steps} />,
      {
        contextOverrides: {
          communication: {
            ipc: getMockIpc(),
          },
        },
      }
    );
    fireEvent.click(getByLabelText('save-code'));
    expect(getByLabelText('save-code'));
  });
});
