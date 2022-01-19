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

import React, { useContext } from "react";
import { useEffect, useRef, useState } from "react";
import {
  EuiCode,
  EuiEmptyPrompt,
  EuiThemeProvider,
  EuiThemeAmsterdam,
} from "@elastic/eui";
import "./App.css";
import "@elastic/eui/dist/eui_legacy_light.css";
import { Title } from "./components/Header/Title";
import { HeaderControls } from "./components/Header/HeaderControls";
import { CommunicationContext } from "./contexts/CommunicationContext";
import { RecordingStatus } from "./common/types";
import { RecordingContext } from "./contexts/RecordingContext";
import { UrlContext } from "./contexts/UrlContext";
import { StepsContext } from "./contexts/StepsContext";
import { TestContext } from "./contexts/TestContext";
import type { Step } from "./common/types";
import { useSyntheticsTest } from "./hooks/useSyntheticsTest";
import { generateIR, generateMergedIR } from "./helpers/generator";
import { StepSeparator } from "./components/StepSeparator";

import "@elastic/eui/dist/eui_theme_light.json";
import "./App.css";
import { useStepsContext } from "./hooks/useStepsContext";
import { CodeFlyout } from "./components/StepsMonitor";
import { TestResult } from "./components/TestResult";
import { AppPageBody } from "./components/AppPageBody";
import { StyledComponentsEuiProvider } from "./contexts/StyledComponentsEuiProvider";

export default function App() {
  const [url] = useState("");
  const [recordingStatus, setRecordingStatus] = useState(
    RecordingStatus.NotRecording
  );
  const [isCodeFlyoutVisible, setIsCodeFlyoutVisible] = useState(false);

  const { ipc } = useContext(CommunicationContext);
  const stepsContextUtils = useStepsContext();
  const { steps, setSteps } = stepsContextUtils;
  const syntheticsTestUtils = useSyntheticsTest(steps);

  // const onUrlChange = (value: string) => {
  //   setUrl(value);
  // };

  const urlRef = useRef(null);

  useEffect(() => {
    // `actions` here is a set of `ActionContext`s that make up a `Step`
    ipc.answerMain("change", ({ actions: step }: { actions: Step }) => {
      setSteps(prevSteps => {
        const nextSteps = generateIR(step);
        return generateMergedIR(prevSteps, nextSteps);
      });
    });
  }, [ipc, setSteps]);

  return (
    <EuiThemeProvider theme={EuiThemeAmsterdam}>
      <StyledComponentsEuiProvider>
        <StepsContext.Provider value={stepsContextUtils}>
          <RecordingContext.Provider
            value={{
              abortSession: async () => {
                if (recordingStatus !== RecordingStatus.Recording) return;
                await ipc.send("stop");
                setRecordingStatus(RecordingStatus.NotRecording);
                setSteps([]);
              },
              recordingStatus,
              toggleRecording: async () => {
                if (recordingStatus === RecordingStatus.Recording) {
                  setRecordingStatus(RecordingStatus.NotRecording);
                  // Stop browser process
                  ipc.send("stop");
                } else {
                  setRecordingStatus(RecordingStatus.Recording);
                  await ipc.callMain("record-journey", { url });
                  setRecordingStatus(RecordingStatus.NotRecording);
                }
              },
              togglePause: async () => {
                if (recordingStatus === RecordingStatus.NotRecording) return;
                if (recordingStatus !== RecordingStatus.Paused) {
                  setRecordingStatus(RecordingStatus.Paused);
                  await ipc.callMain("set-mode", "none");
                } else {
                  await ipc.callMain("set-mode", "recording");
                  setRecordingStatus(RecordingStatus.Recording);
                }
              },
            }}
          >
            <TestContext.Provider value={syntheticsTestUtils}>
              <UrlContext.Provider value={{ urlRef }}>
                <Title />
                <HeaderControls
                  setIsCodeFlyoutVisible={setIsCodeFlyoutVisible}
                />
                <AppPageBody>
                  {steps.length === 0 && (
                    <EuiEmptyPrompt
                      aria-label="This empty prompt indicates that you have not recorded any journey steps yet."
                      hasBorder={false}
                      title={<h3>No steps recorded yet</h3>}
                      body={
                        <p>
                          Click on <EuiCode>Start recording</EuiCode> to get
                          started with your script.
                        </p>
                      }
                    />
                  )}
                  {steps.map((step, index) => (
                    <StepSeparator
                      index={index}
                      key={`step-separator-${index + 1}`}
                      step={step}
                    />
                  ))}
                  {/*
                // this contains the old app layout code, kept here for reference purposes
                // during development. It should be removed before merging.
                <EuiFlexGroup>
                  <EuiFlexItem>
                    <EuiFlexGroup direction="column">
                      <EuiFlexItem grow={false}>
                        <Header url={url} onUrlChange={onUrlChange} />
                      </EuiFlexItem>
                      <EuiFlexItem>
                        <StepsMonitor
                          isFlyoutVisible={isCodeFlyoutVisible}
                          setIsFlyoutVisible={setIsCodeFlyoutVisible}
                        />
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiFlexItem>
                  <EuiFlexItem style={{ minWidth: 300 }}>
                    <TestResult />
                  </EuiFlexItem>
                </EuiFlexGroup> */}
                  <TestResult />
                  {isCodeFlyoutVisible && (
                    <CodeFlyout
                      steps={steps}
                      setIsFlyoutVisible={setIsCodeFlyoutVisible}
                    />
                  )}
                </AppPageBody>
              </UrlContext.Provider>
            </TestContext.Provider>
          </RecordingContext.Provider>
        </StepsContext.Provider>
      </StyledComponentsEuiProvider>
    </EuiThemeProvider>
  );
}
