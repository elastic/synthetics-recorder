import React, { useState } from "react";
import { EuiFlexGroup, EuiFlexItem, EuiSpacer } from "@elastic/eui";
import "./App.css";
import "@elastic/eui/dist/eui_theme_amsterdam_light.css";
import { Header } from "./components/Header";
import { StepsMonitor } from "./components/StepsMonitor";
import { TestResult } from "./components/TestResult";

export default function App() {
  const [url, setUrl] = useState("");
  const [currentActions, setCurrentActions] = useState([]);
  const [result, setResult] = useState("");
  const [type, setJourneyType] = useState("inline");

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
    <div style={{ padding: "2px 10px" }}>
      <Header
        url={url}
        type={type}
        currentActions={currentActions}
        onTestRun={onTestRun}
        onJourneyType={onJourneyType}
        onUrlChange={onUrlChange}
      />
      <EuiSpacer />
      <EuiFlexGroup wrap>
        <EuiFlexItem style={{ minWidth: 700 }}>
          <StepsMonitor
            url={url}
            type={type}
            currentActions={currentActions}
            onUpdateActions={onUpdateActions}
          />
        </EuiFlexItem>
        <EuiFlexItem style={{ minWidth: 200 }}>
          <TestResult result={result} />
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
}
