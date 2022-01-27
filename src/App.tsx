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
import { useEffect, useState } from "react";
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
import { TestResult } from "./components/TestResult";
import { AppPageBody } from "./components/AppPageBody";
import { StyledComponentsEuiProvider } from "./contexts/StyledComponentsEuiProvider";
import { ExportScriptFlyout } from "./components/ExportScriptFlyout";
import { useRecordingContext } from "./hooks/useRecordingContext";
import { StartOverWarningModal } from "./components/StartOverWarningModal";
import { RendererProcessIpc } from "electron-better-ipc";

export default function App() {
  const [url, setUrl] = useState("");
  const [isCodeFlyoutVisible, setIsCodeFlyoutVisible] = useState(false);

  const { ipc } = useContext(CommunicationContext);
  const stepsContextUtils = useStepsContext();
  const { steps, setSteps } = stepsContextUtils;
  const recordingContextUtils = useRecordingContext(ipc, url, steps.length);
  const { isStartOverModalVisible, setIsStartOverModalVisible, startOver } =
    recordingContextUtils;
  const syntheticsTestUtils = useSyntheticsTest(steps);

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
          <RecordingContext.Provider value={recordingContextUtils}>
            <TestContext.Provider value={syntheticsTestUtils}>
              <UrlContext.Provider value={{ url, setUrl }}>
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
                  <TestResult />
                  {isCodeFlyoutVisible && (
                    <ExportScriptFlyout
                      setVisible={setIsCodeFlyoutVisible}
                      steps={steps}
                    />
                  )}
                  {isStartOverModalVisible && (
                    <StartOverWarningModal
                      startOver={startOver}
                      setVisibility={setIsStartOverModalVisible}
                      stepCount={steps.length}
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
