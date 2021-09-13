import React, { useState } from "react";
import {
  EuiFlexItem,
  EuiSpacer,
  EuiButton,
  EuiPanel,
  EuiTitle,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiCodeBlock,
} from "@elastic/eui";
import { Steps } from "./Steps";

const { ipcRenderer: ipc } = window.require("electron-better-ipc");

export function StepsMonitor(props) {
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
  const [code, setCode] = useState("");

  const showFlyout = async () => {
    const code = await ipc.callMain("actions-to-code", {
      actions: props.currentActions,
      isSuite: props.type == "suite",
    });
    setCode(code);
    setIsFlyoutVisible(true);
  };

  return (
    <EuiPanel hasBorder={true} color="transparent">
      <EuiFlexItem>
        <Steps url={props.url} onUpdateActions={props.onUpdateActions} />
      </EuiFlexItem>
      <EuiSpacer />
      {props.currentActions.length > 0 && (
        <EuiButton
          iconType="eye"
          iconSide="right"
          color="text"
          onClick={showFlyout}
        >
          Show Script
        </EuiButton>
      )}

      {isFlyoutVisible && (
        <EuiFlyout
          ownFocus
          onClose={() => setIsFlyoutVisible(false)}
          aria-labelledby="flyoutTitle"
        >
          <EuiFlyoutHeader hasBorder>
            <EuiTitle size="s">
              <h2 id="flyoutTitle">Recorded Code</h2>
            </EuiTitle>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            <EuiCodeBlock language="js" paddingSize="m" isCopyable>
              {code}
            </EuiCodeBlock>
          </EuiFlyoutBody>
        </EuiFlyout>
      )}
    </EuiPanel>
  );
}
