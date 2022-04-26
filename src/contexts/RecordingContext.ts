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

import { createContext } from 'react';
import { RecordingStatus } from '../common/types';
import type { Setter } from '../common/types';

const UNINITIALIZED_MSG = 'Recording context not initialized';

async function notImplementedAsync() {
  throw Error(UNINITIALIZED_MSG);
}

function notImplemented() {
  throw Error(UNINITIALIZED_MSG);
}

/**
 * Exposes functions and flags for the purpose of controlling
 * a browser recording session.
 */
export interface IRecordingContext {
  /**
   * If not recording, will initiate a new recording session.
   */
  startOver: () => Promise<void>;
  /**
   * When `true` the UI displays a modal warning users that they are about
   * to delete previously-recorded steps.
   */
  isStartOverModalVisible: boolean;
  /**
   * Controls visibility of a modal warning users when they are about
   * to take an action that will erase previously-recorded steps.
   */
  setIsStartOverModalVisible: Setter<boolean>;
  /**
   * Contains info about the current state of the recorder session.
   */
  recordingStatus: RecordingStatus;
  /**
   * Pauses or unpauses a recording session. If the user
   * is not recording, nothing happens.
   */
  togglePause: () => void;
  /**
   * Starts or stops a recording session.
   */
  toggleRecording: () => void;
}

export const RecordingContext = createContext<IRecordingContext>({
  startOver: notImplementedAsync,
  isStartOverModalVisible: false,
  setIsStartOverModalVisible: () => {
    throw Error('not implemented');
  },
  recordingStatus: RecordingStatus.NotRecording,
  togglePause: notImplemented,
  toggleRecording: notImplemented,
});
