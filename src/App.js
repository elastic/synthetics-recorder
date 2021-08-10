import React, { useState } from "react";
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiText,
  EuiTextArea,
} from "@elastic/eui";
import "./App.css";
import "@elastic/eui/dist/eui_theme_amsterdam_light.css";
import { Header } from "./components/Header";
import { Snippet } from "./components/Snippet";

export default function App() {
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("// Record journeys");
  const [result, setResult] = useState("");
  const [type, setJourneyType] = useState("inline");

  const onUrlChange = (value) => {
    setUrl(value);
  };
  const onJourneyType = (value) => {
    setJourneyType(value);
  };
  const onRecordingDone = (value) => {
    setCode(value);
  };
  const onTestRun = (result) => {
    setResult(result);
  };

  return (
    <div style={{ margin: "2px 10px" }}>
      <Header
        type={type}
        url={url}
        code={code}
        onTestRun={onTestRun}
        onJourneyType={onJourneyType}
        onUrlChange={onUrlChange}
      />
      <EuiSpacer />
      <EuiFlexGroup component="span" wrap={false}>
        <EuiFlexItem component="span" grow={2}>
          <Snippet
            code={code}
            type={type}
            url={url}
            onRecordingDone={onRecordingDone}
          />
        </EuiFlexItem>
        <EuiFlexItem component="span" grow={false}>
          <EuiText>
            <h3>Test Result</h3>
          </EuiText>
          <EuiSpacer />
          <EuiTextArea value={result} onChange={() => {}}></EuiTextArea>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
}
