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

import { createContext } from "react";

function notImplemented() {
  throw Error("Recording context not initialized");
}

/**
 * Exposes functions and flags for the purpose of controlling
 * a browser recording session.
 */
export interface IRecordingContext {
  /**
   * Messages the main process to stop the recording, discards
   * the actions the user has recorded.
   */
  abortSession: () => Promise<void>;
  /**
   * Is a recording session paused.
   */
  isPaused: boolean;
  /**
   * Is there a recording session taking place.
   */
  isRecording: boolean;
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
  abortSession: async function () {
    throw Error("RecordingContext abort session not implemented");
  },
  isPaused: false,
  isRecording: false,
  togglePause: notImplemented,
  toggleRecording: notImplemented,
});
