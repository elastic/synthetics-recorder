import React, { useState } from "react";
import {
  EuiBetaBadge,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLink,
  EuiPageTemplate,
  EuiSpacer,
} from "@elastic/eui";
import "./App.css";
import "@elastic/eui/dist/eui_theme_amsterdam_light.css";
import { Header } from "./components/Header";
import { StepsMonitor } from "./components/StepsMonitor";
import { TestResult } from "./components/TestResult";
import { RecordingContext } from "./contexts/RecordingContext";
import { AssertionDrawer } from "./components/AssertionDrawer";
import { AssertionContext } from "./contexts/AssertionContext";
import { StepsContext } from "./contexts/StepsContext";
import { useAssertionDrawer } from "./hooks/useAssertionDrawer";

const { ipcRenderer: ipc } = window.require("electron-better-ipc");

const MAIN_CONTROLS_MIN_WIDTH = 600;

export default function App() {
  const [url, setUrl] = useState("");
  const [stepActions, setStepActions] = useState([]);
  const [result, setResult] = useState("");
  const [type, setJourneyType] = useState("inline");
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const assertionDrawerUtils = useAssertionDrawer();

  const onUrlChange = value => {
    setUrl(value);
  };

  const onTestRun = result => {
    setResult(result);
  };

  return (
    <div style={{ padding: 4 }}>
      <StepsContext.Provider
        value={{
          actions: stepActions,
          onDeleteAction: (sIdx, aIdx) => {
            setStepActions(
              stepActions.map((s, idx) => {
                if (idx != sIdx) return s;
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
              isRecording,
              toggleRecording: async () => {
                if (isRecording) {
                  setIsRecording(false);
                  setIsPaused(false);
                  // Stop browser process
                  ipc.send("stop");
                } else {
                  setIsRecording(true);
                  await ipc.callMain("record-journey", { url });
                  setIsRecording(false);
                }
              },
              isPaused,
              togglePause: async () => {
                if (!isRecording) return;
                if (!isPaused) {
                  setIsPaused(true);
                  await ipc.callMain("set-mode", "none");
                } else {
                  await ipc.callMain("set-mode", "recording");
                  setIsPaused(false);
                }
              },
            }}
          >
            <EuiPageTemplate
              pageHeader={{
                bottomBorder: true,
                // the bottom border didn't grow without providing a value for
                // `restrictWidth`. We always want there to be a border and we
                // always want the header to fill the full width.
                restrictWidth: 4000,
                pageTitle: (
                  <EuiFlexGroup>
                    <EuiFlexItem grow={false}>
                      <EuiIcon size="xxl" type="logoElastic" />
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>Script recorder</EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiBetaBadge
                        style={{ marginTop: 10 }}
                        label="BETA"
                        color="accent"
                      />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                ),
                paddingSize: "s",
                rightSideItems: [
                  <EuiLink style={{ marginTop: 16 }}>Send feedback</EuiLink>,
                ],
              }}
            >
              <EuiSpacer />
              <EuiFlexGroup>
                <EuiFlexItem>
                  <EuiFlexGroup direction="column">
                    <EuiFlexItem grow={false}>
                      <Header url={url} onUrlChange={onUrlChange} />
                    </EuiFlexItem>
                    <EuiFlexItem style={{ minWidth: MAIN_CONTROLS_MIN_WIDTH }}>
                      <StepsMonitor url={url} type={type} />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
                <EuiFlexItem style={{ minWidth: 300 }}>
                  <TestResult
                    onTestRun={onTestRun}
                    result={result}
                    setType={setJourneyType}
                    type={type}
                  />
                </EuiFlexItem>
              </EuiFlexGroup>
              <AssertionDrawer width={MAIN_CONTROLS_MIN_WIDTH} />
            </EuiPageTemplate>
          </RecordingContext.Provider>
        </AssertionContext.Provider>
      </StepsContext.Provider>
    </div>
  );
}
