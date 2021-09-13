import React from "react";
import { EuiSpacer, EuiText, EuiTextArea } from "@elastic/eui";

export function TestResult(props) {
  return (
    <>
      <EuiText size="s">
        <strong>Test Result</strong>
      </EuiText>
      <EuiSpacer />
      <EuiTextArea
        style={{ minHeight: 440 }}
        compressed={true}
        value={props.result}
        onChange={() => {}}
      ></EuiTextArea>
    </>
  );
}
