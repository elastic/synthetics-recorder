import React, { useCallback, useRef, useState } from "react";
import { EuiFlexGroup, EuiFlexItem, EuiSpacer } from "@elastic/eui";
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

const MAIN_CONTROLS_MIN_WIDTH = 700;

export default function App() {
  const [url, setUrl] = useState("");
  const [currentActions, setCurrentActions] = useState([]);
  const [stepActions, setStepActions] = useState([]);
  const [result, setResult] = useState("");
  const [type, setJourneyType] = useState("inline");
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const assertionDrawerUtils = useAssertionDrawer();

  const onUrlChange = (value) => {
    setUrl(value);
  };
  const onJourneyType = (value) => {
    setJourneyType(value);
  };
  const onUpdateActions = (actionWithSteps) => {
    // Spread the actions array modified by the IR
    const actions = actionWithSteps.flat();
    if (actions.length > 0) setCurrentActions(actions);
  };

  const onTestRun = (result) => {
    setResult(result);
  };

  return (
    <div style={{ margin: "2px 10px" }}>
      <StepsContext.Provider
        value={{
          actions: stepActions,
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
                } else if (url) {
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
            <Header
              url={url}
              type={type}
              currentActions={currentActions}
              onTestRun={onTestRun}
              onJourneyType={onJourneyType}
              onUrlChange={onUrlChange}
            />
            <EuiSpacer />
            <EuiFlexGroup wrap style={{ minHeight: 500 }}>
              <EuiFlexItem style={{ minWidth: MAIN_CONTROLS_MIN_WIDTH }}>
                <StepsMonitor
                  url={url}
                  type={type}
                  currentActions={currentActions}
                  onUpdateActions={onUpdateActions}
                />
              </EuiFlexItem>
              <EuiFlexItem style={{ minWidth: 300 }}>
                <TestResult result={result} />
              </EuiFlexItem>
            </EuiFlexGroup>
            <AssertionDrawer
              width={MAIN_CONTROLS_MIN_WIDTH}
              onUpdateActions={onUpdateActions}
            />
          </RecordingContext.Provider>
        </AssertionContext.Provider>
      </StepsContext.Provider>
    </div>
  );
}
