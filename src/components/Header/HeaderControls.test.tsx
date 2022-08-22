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
import { RecordingStatus } from '../../common/types';
import { HeaderControls } from './HeaderControls';
import { render } from '../../helpers/test';

describe('<HeaderControls />', () => {
  it('displays start text when not recording', async () => {
    const { getByLabelText } = render(<HeaderControls setIsCodeFlyoutVisible={jest.fn()} />);

    expect(getByLabelText('Start')).toBeTruthy();
  });

  it('displays pause text when recording', () => {
    const { getByLabelText } = render(<HeaderControls setIsCodeFlyoutVisible={jest.fn()} />, {
      contextOverrides: {
        recording: { recordingStatus: RecordingStatus.Recording },
      },
    });

    expect(getByLabelText('Pause')).toBeTruthy();
  });

  it('displays resume text when paused', () => {
    const { getByLabelText } = render(<HeaderControls setIsCodeFlyoutVisible={jest.fn()} />, {
      contextOverrides: {
        recording: { recordingStatus: RecordingStatus.Paused },
      },
    });

    expect(getByLabelText('Resume')).toBeTruthy();
  });
});
