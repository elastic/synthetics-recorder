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

import { fireEvent, render, waitFor } from "@testing-library/react";
import React from "react";
import { RecordingStatus } from "../common/types";
import {
  IRecordingContext,
  RecordingContext,
} from "../contexts/RecordingContext";
import { Header, IHeader } from "./Header";

describe("<Header />", () => {
  let contextValues: IRecordingContext;
  let recordingStatus: RecordingStatus;

  beforeEach(() => {
    recordingStatus = RecordingStatus.NotRecording;
    contextValues = {
      abortSession: jest.fn(),
      recordingStatus: recordingStatus,
      togglePause: jest.fn().mockImplementation(() => {
        if (recordingStatus === RecordingStatus.Paused) {
          recordingStatus = RecordingStatus.Recording;
        } else {
          recordingStatus = RecordingStatus.Paused;
        }
      }),
      toggleRecording: jest.fn().mockImplementation(() => {
        if (recordingStatus === RecordingStatus.Recording) {
          recordingStatus = RecordingStatus.NotRecording;
        } else {
          recordingStatus = RecordingStatus.Recording;
        }
      }),
    };
  });

  const START_ARIA = "Toggle the script recorder between recording and paused";
  const RESTART_ARIA = "Stop recording and clear all recorded actions";

  const componentToRender = (
    contextOverrides?: Partial<IRecordingContext>,
    propsOverrides?: Partial<IHeader>
  ) => (
    <RecordingContext.Provider
      value={{ ...contextValues, ...contextOverrides }}
    >
      <Header
        onUrlChange={jest.fn()}
        stepCount={1}
        url="https://www.elastic.co/"
        {...propsOverrides}
      />
    </RecordingContext.Provider>
  );

  it("displays start text when not recording", async () => {
    const { getByLabelText } = render(componentToRender());

    expect(getByLabelText(START_ARIA).textContent).toBe("Start recording");
  });

  it("displays pause text when recording", () => {
    const { getByLabelText } = render(
      componentToRender({ recordingStatus: RecordingStatus.Recording })
    );

    expect(getByLabelText(START_ARIA).textContent).toBe("Pause");
  });

  it("displays resume text when paused", () => {
    const { getByLabelText } = render(
      componentToRender({ recordingStatus: RecordingStatus.Paused })
    );

    expect(getByLabelText(START_ARIA).textContent).toBe("Resume");
  });

  it("displays modal when start over is clicked", async () => {
    const { getByText, getByLabelText } = render(
      componentToRender(
        { recordingStatus: RecordingStatus.Recording },
        { stepCount: 23 }
      )
    );

    const restartButton = getByLabelText(RESTART_ARIA);

    fireEvent.click(restartButton);

    await waitFor(() => {
      expect(getByText("Delete 23 steps?"));
      expect(getByText("This action cannot be undone."));
      expect(getByText("Cancel"));
      expect(getByText("Delete and start over"));
    });
  });
});
