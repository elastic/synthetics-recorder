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
import { render } from '../helpers/test';
import { SaveCodeButton } from './SaveCodeButton';
import { createSteps } from '../../common/helper/test/createAction';
import { fireEvent, waitFor } from '@testing-library/react';
import { getMockElectronApi } from '../helpers/test/mockApi';

describe('SaveCodeButton', () => {
  it('calls ipc on click', async () => {
    const exportScript = jest.fn();
    exportScript.mockImplementation(() => 'this would be generated code');
    const sendToast = jest.fn();
    const { getByLabelText } = render(<SaveCodeButton type="project" />, {
      contextOverrides: {
        communication: {
          electronAPI: getMockElectronApi({ exportScript }),
        },
        steps: {
          steps: createSteps([['action1', 'action2', 'action3'], ['action4']]),
        },
        toast: {
          sendToast,
        },
      },
    });

    const button = getByLabelText('save-code');

    fireEvent.click(button);

    await waitFor(() => {
      expect(exportScript).toHaveBeenCalled();
      expect(sendToast).toHaveBeenCalledTimes(1);
      const mockExportObject = sendToast.mock.calls[0][0];
      expect(mockExportObject.color).toBe('success');
      expect(mockExportObject.title).toBe('Script export successful');
      expect(mockExportObject.id).toContain('file-export-');
    });
  });
});
