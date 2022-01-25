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

import { useCallback, useState } from "react";
import { RecordingStatus } from "../common/types";
import type { IPC } from "../common/types";

export function useRecordingContext(ipc: IPC, url: string, stepCount: number) {
  const [isStartOverModalVisible, setIsStartOverModalVisible] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState(
    RecordingStatus.NotRecording
  );
  const toggleRecording = useCallback(async () => {
    if (recordingStatus === RecordingStatus.NotRecording && stepCount > 0) {
      setIsStartOverModalVisible(true);
    } else if (recordingStatus === RecordingStatus.Recording) {
      setRecordingStatus(RecordingStatus.NotRecording);
      // Stop browser process
      ipc.send("stop");
    } else {
      setRecordingStatus(RecordingStatus.Recording);
      await ipc.callMain("record-journey", { url });
      setRecordingStatus(RecordingStatus.NotRecording);
    }
  }, [ipc, recordingStatus, stepCount, url]);

  const eraseSteps = useCallback(async () => {
    if (recordingStatus === RecordingStatus.NotRecording) {
      setRecordingStatus(RecordingStatus.Recording);
      await ipc.callMain("record-journey", { url });
      setRecordingStatus(RecordingStatus.NotRecording);
    }
  }, [ipc, recordingStatus, url]);

  const togglePause = async () => {
    if (recordingStatus === RecordingStatus.NotRecording) return;
    if (recordingStatus !== RecordingStatus.Paused) {
      setRecordingStatus(RecordingStatus.Paused);
      await ipc.callMain("set-mode", "none");
    } else {
      await ipc.callMain("set-mode", "recording");
      setRecordingStatus(RecordingStatus.Recording);
    }
  };

  return {
    eraseSteps,
    isStartOverModalVisible,
    setIsStartOverModalVisible,
    recordingStatus,
    toggleRecording,
    togglePause,
  };
}
