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
  EuiFlexGroup,
  EuiFlexItem,
  EuiPageBody,
  useEuiTheme,
} from "@elastic/eui";
import "./App.css";
import "@elastic/eui/dist/eui_legacy_light.css";
import { ThemeProvider as StyledComponentsThemeProvider } from "styled-components";
import { Header } from "./components/Header";
import { StepsMonitor } from "./components/StepsMonitor";
import { TestResult } from "./components/TestResult";
import { Title } from "./components/Header/Title";
import { HeaderControls } from "./components/Header/HeaderControls";
import { CommunicationContext } from "./contexts/CommunicationContext";
import { RecordingStatus } from "./common/types";
import { RecordingContext } from "./contexts/RecordingContext";
import { UrlContext } from "./contexts/UrlContext";
import { StepsContext } from "./contexts/StepsContext";
import { TestContext } from "./contexts/TestContext";
import type { ActionContext } from "./common/types";
import { useSyntheticsTest } from "./hooks/useSyntheticsTest";
import { generateIR, generateMergedIR } from "./helpers/generator";
import "@elastic/eui/dist/eui_theme_amsterdam_light.css";
import "./App.css";
import { StepSeparator } from "./components/StepSeparator";

export default function App() {
  const [url, setUrl] = useState("");
  const [stepActions, setStepActions] = useState<ActionContext[][]>([]);
  const [recordingStatus, setRecordingStatus] = useState(
    RecordingStatus.NotRecording
  );
  const [isCodeFlyoutVisible, setIsCodeFlyoutVisible] = useState(false);

  const { ipc } = useContext(CommunicationContext);
  const syntheticsTestUtils = useSyntheticsTest(stepActions);

  const onUrlChange = (value: string) => {
    setUrl(value);
  };

  const urlRef = useRef(null);

  useEffect(() => {
    ipc.answerMain("change", ({ actions }: { actions: ActionContext[] }) => {
      setStepActions((prevActionContexts: ActionContext[][]) => {
        const currActionsContexts = generateIR(actions);
        return generateMergedIR(prevActionContexts, currActionsContexts);
      });
    });
  }, [setStepActions, ipc]);

  const { euiTheme } = useEuiTheme();
  return (
    <StyledComponentsThemeProvider theme={euiTheme}>
      <StepsContext.Provider
        value={{
          actions: stepActions,
          // stepsTable,
          onDeleteAction: (sIdx, aIdx) => {
            setStepActions(value =>
              value.map((s, idx) => {
                if (idx !== sIdx) return s;
                s.splice(aIdx, 1);
                return [...s];
              })
            );
          },
          onInsertAction: (action, stepIndex, actionIndex) => {
            setStepActions(
              stepActions.map((step, ind) => {
                if (ind !== stepIndex) return step;
                step.splice(actionIndex, 0, action);
                return [...step];
              })
            );
          },
          onStepDetailChange: (step, stepIndex) => {
            const newActions = stepActions.map(
              (a: ActionContext[], ind: number) => {
                return ind === stepIndex ? step : a;
              }
            );
            setStepActions(newActions);
          },
          setActions: setStepActions,
        }}
      >
        <RecordingContext.Provider
          value={{
            abortSession: async () => {
              if (recordingStatus !== RecordingStatus.Recording) return;
              await ipc.send("stop");
              setRecordingStatus(RecordingStatus.NotRecording);
              setStepActions([]);
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
              <HeaderControls setIsCodeFlyoutVisible={setIsCodeFlyoutVisible} />
              <EuiPageBody
                style={{
                  backgroundColor: euiTheme.colors.emptyShade,
                  padding: "0px 0px 0px 40px",
                }}
              >
                {stepActions.map((step, index) => (
                  <StepSeparator
                    index={index}
                    key={`step-separator-${index + 1}`}
                    step={step}
                  />
                ))}
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
                </EuiFlexGroup>
              </EuiPageBody>
            </UrlContext.Provider>
          </TestContext.Provider>
        </RecordingContext.Provider>
      </StepsContext.Provider>
    </StyledComponentsThemeProvider>
  );
}
