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
  const [code, setCode] = useState("// Record journeys");
  const [result, setResult] = useState("");
  const [type, setJourneyType] = useState("inline");

  const onJourneyType = (value) => {
    setJourneyType(value);
  };
  const onSaveSnippetCode = (value) => {
    setCode(value);
  };
  const onTestRun = (result) => {
    setResult(result);
  };

  return (
    <div style={{ margin: "2px 10px" }}>
      <Header
        type={type}
        onSaveSnippetCode={onSaveSnippetCode}
        onJourneyType={onJourneyType}
      />
      <EuiSpacer />
      <EuiFlexGroup component="span" wrap>
        <EuiFlexItem component="span">
          <Snippet code={code} type={type} onTestRun={onTestRun} />
        </EuiFlexItem>
        <EuiFlexItem component="span">
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
