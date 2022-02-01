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
import { EuiFlexGroup, EuiFlexItem, EuiPageBody } from "@elastic/eui";
import "./App.css";
import "@elastic/eui/dist/eui_legacy_light.css";
import { Header } from "./components/Header";
import { StepsMonitor } from "./components/StepsMonitor";
import { TestResult } from "./components/TestResult";
import { AssertionDrawer } from "./components/AssertionDrawer";
import { Title } from "./components/Header/Title";
import { HeaderControls } from "./components/Header/HeaderControls";
import { AssertionContext } from "./contexts/AssertionContext";
import { CommunicationContext } from "./contexts/CommunicationContext";
import { RecordingContext } from "./contexts/RecordingContext";
import { StepsContext } from "./contexts/StepsContext";
import { TestContext } from "./contexts/TestContext";
import type { ActionContext } from "./common/types";
import { RecordingStatus } from "./common/types";
import { useAssertionDrawer } from "./hooks/useAssertionDrawer";
import { useSyntheticsTest } from "./hooks/useSyntheticsTest";
import { generateIR, generateMergedIR } from "./helpers/generator";
import { UrlContext } from "./contexts/UrlContext";

const MAIN_CONTROLS_MIN_WIDTH = 600;

export default function App() {
  const [url, setUrl] = useState("");
  const [stepActions, setStepActions] = useState<ActionContext[][]>([]);
  const [recordingStatus, setRecordingStatus] = useState(
    RecordingStatus.NotRecording
  );
  const [isCodeFlyoutVisible, setIsCodeFlyoutVisible] = useState(false);

  const { ipc } = useContext(CommunicationContext);
  const assertionDrawerUtils = useAssertionDrawer();
  const syntheticsTestUtils = useSyntheticsTest(stepActions);

  const onUrlChange = (value: string) => {
    setUrl(value);
  };

  const urlRef = useRef(null);

  useEffect(() => {
    ipc.answerMain("change", ({ actions }: { actions: ActionContext[] }) => {
      setStepActions(prevActionContexts => {
        const currActionsContexts = generateIR(actions);
        return generateMergedIR(prevActionContexts, currActionsContexts);
      });
    });
  }, [setStepActions, ipc]);

  return (
    <div>
      <StepsContext.Provider
        value={{
          actions: stepActions,
          onDeleteAction: (sIdx: number, aIdx: number) => {
            setStepActions(value =>
              value.map((s: ActionContext[], idx: number) => {
                if (idx !== sIdx) return s;
                s.splice(aIdx, 1);
                return [...s];
              })
            );
          },
          setActions: setStepActions,
        }}
      >
        <AssertionContext.Provider value={assertionDrawerUtils}>
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
                <HeaderControls
                  setIsCodeFlyoutVisible={setIsCodeFlyoutVisible}
                />
                <EuiPageBody>
                  <EuiFlexGroup>
                    <EuiFlexItem>
                      <EuiFlexGroup direction="column">
                        <EuiFlexItem grow={false}>
                          <Header
                            url={url}
                            onUrlChange={onUrlChange}
                            stepCount={stepActions.length}
                          />
                        </EuiFlexItem>
                        <EuiFlexItem
                          style={{ minWidth: MAIN_CONTROLS_MIN_WIDTH }}
                        >
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
                  <AssertionDrawer />
                </EuiPageBody>
              </UrlContext.Provider>
            </TestContext.Provider>
          </RecordingContext.Provider>
        </AssertionContext.Provider>
      </StepsContext.Provider>
    </div>
  );
}
