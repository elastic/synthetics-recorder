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

import { render } from "@testing-library/react";
import React from "react";
import {
  IRecordingContext,
  RecordingContext,
} from "../contexts/RecordingContext";
import { Header } from "./Header";

describe("<Header />", () => {
  let isPaused = false;
  let isRecording = false;
  let contextValues: IRecordingContext;

  beforeEach(() => {
    contextValues = {
      isPaused,
      isRecording,
      abortSession: jest.fn(),
      togglePause: jest.fn().mockImplementation(() => (isPaused = !isPaused)),
      toggleRecording: jest.fn().mockImplementation(() => {
        console.log("i run");
        isRecording = !isRecording;
      }),
    };
  });

  const START_BUTTON_ARIA =
    "Toggle the script recorder between recording and paused";

  const componentToRender = (overrides?: Partial<IRecordingContext>) => (
    <RecordingContext.Provider value={{ ...contextValues, ...overrides }}>
      <Header onUrlChange={jest.fn()} url="https://www.elastic.co/" />
    </RecordingContext.Provider>
  );

  it("displays start text when not recording", async () => {
    const { getByLabelText } = render(componentToRender());

    expect(getByLabelText(START_BUTTON_ARIA).textContent).toBe(
      "Start recording"
    );
  });

  it("displays pause text when recording", () => {
    const { getByLabelText } = render(componentToRender({ isRecording: true }));

    expect(getByLabelText(START_BUTTON_ARIA).textContent).toBe("Pause");
  });

  it("displays resume text when paused", () => {
    const { getByLabelText } = render(
      componentToRender({ isRecording: true, isPaused: true })
    );

    expect(getByLabelText(START_BUTTON_ARIA).textContent).toBe("Resume");
  });
});
