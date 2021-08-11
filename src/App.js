import React, { useState } from "react";
import {
  EuiCodeBlock,
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

const { ipcRenderer: ipc } = window.require("electron-better-ipc");

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
  const onUpdateActions = async (actions) => {
    const code = await ipc.callMain("actions-to-code", {
      actions,
      isSuite: type == "suite",
    });
    setCode(code);
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
      <EuiFlexGroup>
        <EuiFlexItem grow={2}>
          <Snippet type={type} url={url} onUpdateActions={onUpdateActions} />
        </EuiFlexItem>
        <EuiFlexItem grow={1}>
          <EuiText size="s">
            <strong>Generated Code</strong>
          </EuiText>
          <EuiCodeBlock
            language="js"
            fontSize="m"
            paddingSize="m"
            overflowHeight={200}
            style={{ minHeight: 120 }}
          >
            {code}
          </EuiCodeBlock>
          <EuiSpacer />
          <EuiText size="s">
            <strong>Test Result</strong>
          </EuiText>
          <EuiTextArea value={result} onChange={() => {}}></EuiTextArea>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
}
