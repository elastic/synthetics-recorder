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

import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { RecordingStatus } from '../../common/types';
import { IUrlField, UrlField, URL_FIELD_LABEL } from './UrlField';

describe('<UrlField />', () => {
  let setUrlMock: jest.Mock;
  let toggleRecordingMock: jest.Mock;
  const TEST_URL = 'https://www.elastic.co';

  beforeEach(() => {
    setUrlMock = jest.fn();
    toggleRecordingMock = jest.fn();
  });

  /**
   * Specifies helpful defaults to prevent boilerplate in test render calls.
   * @param props Optional props overrides.
   * @returns the UrlField component
   */
  function TestRender(props: Partial<IUrlField>) {
    return (
      <UrlField
        recordingStatus={RecordingStatus.NotRecording}
        setUrl={setUrlMock}
        toggleRecording={toggleRecordingMock}
        url=""
        {...props}
      />
    );
  }

  it('sets the url value', async () => {
    const { getByLabelText } = render(<TestRender />);

    const urlField = getByLabelText(URL_FIELD_LABEL);

    fireEvent.change(urlField, { target: { value: TEST_URL } });

    await waitFor(() => {
      expect(setUrlMock).toHaveBeenCalledWith(TEST_URL);
    });
  });

  it('toggles recording when enter press received', async () => {
    const { getByLabelText } = render(<TestRender />);
    const urlField = getByLabelText(URL_FIELD_LABEL);

    fireEvent.keyUp(urlField, { key: 'Enter' });

    await waitFor(() => {
      expect(toggleRecordingMock).toHaveBeenCalledTimes(1);
    });
  });

  it(`doesn't toggle recording if recording already in progress`, async () => {
    const { getByLabelText } = render(<TestRender recordingStatus={RecordingStatus.Recording} />);
    const urlField = getByLabelText(URL_FIELD_LABEL);

    fireEvent.keyUp(urlField, { key: 'Enter' });
    fireEvent.change(urlField, { target: { value: TEST_URL } });

    await waitFor(() => {
      expect(toggleRecordingMock).not.toHaveBeenCalled();
      expect(setUrlMock).toHaveBeenCalledWith(TEST_URL);
    });
  });
});
