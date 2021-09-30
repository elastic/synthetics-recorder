import React, { useState, useContext } from "react";
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
import { StepsContext } from "../contexts/StepsContext";

const { ipcRenderer: ipc } = window.require("electron-better-ipc");

export function StepsMonitor(props) {
  const { actions } = useContext(StepsContext);
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
  const [code, setCode] = useState("");

  const showFlyout = async () => {
    const code = await ipc.callMain("actions-to-code", {
      actions: actions.flat(),
      isSuite: props.type == "suite",
    });
    setCode(code);
    setIsFlyoutVisible(true);
  };

  return (
    <EuiFlexGroup direction="column" gutterSize="xs">
      <EuiFlexItem>
        <EuiPanel hasBorder={true} color="transparent" borderRadius="none">
          <Steps />
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
        {actions.length > 0 && (
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
