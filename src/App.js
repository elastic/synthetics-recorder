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

const { ipcRenderer: ipc } = window.require("electron-better-ipc");

export default function App() {
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("// Record journeys");
  const [actions, setActions] = useState([]);
  const [result, setResult] = useState("");
  const [type, setJourneyType] = useState("inline");

  const onUrlChange = (value) => {
    setUrl(value);
  };
  const onJourneyType = (value) => {
    setJourneyType(value);
  };
  const onUpdateActions = async (actions) => {
    setActions(actions);
  };
  const onTestRun = (result) => {
    setResult(result);
  };
  const onGenerateCode = async () => {
    const actionContexts = actions.map(({ actionContext }) => ({
      ...actionContext,
    }));
    const code = await ipc.callMain("actions-to-code", {
      actions: actionContexts,
      isSuite: type == "suite",
    });
    setCode(code);
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
            actions={actions}
            url={url}
            onUpdateActions={onUpdateActions}
            onGenerateCode={onGenerateCode}
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
