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

/**
 * NOTE: these tests can be improved. Right now, there is no test code for the `togglePause`
 * and `toggleRecording` callbacks in the case of recording being in progress. It isn't possible
 * to control this state outside of the hook/context, which is by design, as we don't want
 * consuming code to be capable of managing the actual recording state, as this will lead to
 * lots of potential for unwanted/bad side effects.
 *
 * The recording state is only recording when we are awaiting a call to `ipc.callMain`, so tests
 * for this functionality will need to simulate that, as well as subsequent actions by the user.
 *
 * It's not strictly necessary to test these effects in unit testing, as they're covered by our e2e suite,
 * but a contribution that does add these unit tests will be nice for the sake of completeness.
 */

import { act, renderHook } from '@testing-library/react-hooks';
import type { Steps } from '@elastic/synthetics';
import { IElectronAPI } from '../../common/types';
import { RecordingStatus, Setter } from '../common/types';
import { getMockElectronApi } from '../helpers/test/mockApi';
import { useRecordingContext } from './useRecordingContext';

describe('useRecordingContext', () => {
  let electronApi: IElectronAPI;
  let setResult: (data: undefined) => void;
  let setSteps: Setter<Steps>;
  let recordJourney: jest.Mock;

  beforeEach(() => {
    recordJourney = jest.fn();
    electronApi = getMockElectronApi({
      recordJourney,
    });
    setResult = jest.fn();
    setSteps = jest.fn();
  });

  it('should initialize the recording context with the correct initial state', () => {
    const { result } = renderHook(() =>
      useRecordingContext(electronApi, '', 0, setResult, setSteps)
    );
    const recordingContext = result.current;

    expect(recordingContext.recordingStatus).toEqual(RecordingStatus.NotRecording);
    expect(recordingContext.isStartOverModalVisible).toEqual(false);
  });

  it('should toggle the recording status when toggleRecording is called', async () => {
    const url = 'https://elastic.co';
    const renderHookResponse = renderHook(() =>
      useRecordingContext(electronApi, url, 0, setResult, setSteps)
    );
    const recordingContext = renderHookResponse.result.current;

    await act(async () => recordingContext.toggleRecording());

    renderHookResponse.rerender();

    expect(recordJourney).toHaveBeenCalledWith(url);
  });

  it('sets start over modal visible if a step exists', async () => {
    const renderHookResponse = renderHook(() =>
      useRecordingContext(electronApi, '', 1, setResult, setSteps)
    );
    const recordingContext = renderHookResponse.result.current;

    await act(async () => recordingContext.toggleRecording());

    renderHookResponse.rerender();

    expect(renderHookResponse.result.current.isStartOverModalVisible).toBe(true);
  });

  it('startOver resets steps and runs a new recording session', async () => {
    const renderHookResponse = renderHook(() =>
      useRecordingContext(electronApi, 'https://test.com', 1, setResult, setSteps)
    );
    const recordingContext = renderHookResponse.result.current;

    await act(async () => recordingContext.startOver());

    renderHookResponse.rerender();

    expect(recordJourney).toHaveBeenCalledWith('https://test.com');
    expect(setSteps).toHaveBeenCalledWith([]);
  });

  it('togglePause does nothing when not recording', async () => {
    const renderHookResponse = renderHook(() =>
      useRecordingContext(electronApi, 'https://test.com', 1, setResult, setSteps)
    );
    const recordingContext = renderHookResponse.result.current;

    await act(async () => recordingContext.togglePause());

    renderHookResponse.rerender();

    expect(recordJourney).not.toHaveBeenCalled();
  });
});
