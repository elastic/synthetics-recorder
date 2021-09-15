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
  EuiFlexGroup,
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
    <EuiFlexGroup direction="column" gutterSize="xs">
      <EuiFlexItem>
        <EuiPanel hasBorder={true} color="transparent" borderRadius="none">
          <Steps url={props.url} onUpdateActions={props.onUpdateActions} />
          <EuiSpacer />

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
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        {props.currentActions.length > 0 && (
          <div>
            <EuiButton
              iconType="eye"
              iconSide="right"
              color="text"
              onClick={showFlyout}
            >
              Show Script
            </EuiButton>
          </div>
        )}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
